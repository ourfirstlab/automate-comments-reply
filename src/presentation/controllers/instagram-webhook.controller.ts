import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus, Inject, Logger, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ILLMService } from '../../domain/services/llm.service.interface';
import { InstagramWebhookEntry } from '../../domain/models/instagram-comment.model';
import { WebhookVerificationDto } from '../dto/webhook-verification.dto';
import { WebhookPayloadDto } from '../dto/webhook-payload.dto';
import { InstagramMediaService } from '../../infrastructure/services/instagram-media.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../../domain/models/comment.model';
import { Media } from '../../domain/models/media.model';
import axios from 'axios';
import * as crypto from 'crypto';

@ApiTags('Instagram Webhook')
@Controller('webhook')
export class InstagramWebhookController {
    private readonly logger = new Logger(InstagramWebhookController.name);
    private readonly skipValidation: boolean;

    constructor(
        private readonly configService: ConfigService,
        @Inject('ILLMService') private readonly llmService: ILLMService,
        private readonly mediaService: InstagramMediaService,
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
        @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
    ) {
        this.skipValidation = this.configService.get<boolean>('instagram.skipWebhookValidation') ?? false;
        console.log(`skip validation: ${this.skipValidation}`);
        if (this.skipValidation) {
            this.logger.warn('Webhook validation is disabled. This should only be used in development!');
        }
    }

    @Get('health')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    async healthCheck(): Promise<{ status: string }> {
        return { status: 'ok' };
    }

    @Get()
    @ApiOperation({ summary: 'Handle webhook verification' })
    @ApiQuery({ name: 'hub.mode', required: true, type: String })
    @ApiQuery({ name: 'hub.verify_token', required: true, type: String })
    @ApiQuery({ name: 'hub.challenge', required: true, type: String })
    @ApiResponse({ status: 200, description: 'Returns the challenge string' })
    @ApiResponse({ status: 400, description: 'Invalid verification request' })
    async handleWebhookVerification(
        @Query() query: WebhookVerificationDto,
    ): Promise<string> {
        const verifyToken = this.configService.get<string>('instagram.webhookVerifyToken');

        if (query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === verifyToken) {
            this.logger.log('Webhook verification successful');
            return query['hub.challenge'];
        }
        this.logger.warn('Invalid webhook verification request');
        throw new Error('Invalid webhook verification request');
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle webhook notifications' })
    @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
    @ApiHeader({ name: 'x-hub-signature-256', required: true, description: 'SHA-256 signature of the request body' })
    async handleWebhook(
        @Body() payload: WebhookPayloadDto,
    ): Promise<void> {
        const accessToken = this.configService.get<string>('instagram.accessToken');
        const botUsername = this.configService.get<string>('instagram.username');

        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                if (change.field === 'comments') {
                    const comment = change.value;

                    console.log(comment.from.username, botUsername)
                    // Skip comments from the bot's own account
                    if (comment.from.username === botUsername) {
                        this.logger.log(`Skipping comment from bot's own account (${botUsername})`);
                        // Store the comment in MongoDB
                        await this.commentModel.create({
                            commentId: comment.id,
                            mediaId: comment.media.id,
                            text: comment.text,
                            username: comment.from.username,
                            parentId: comment.parent_id,
                            isProcessed: true,
                        });
                        continue;
                    }

                    try {
                        this.logger.log(`Processing comment from ${comment.from.username}: ${comment.text}`);
                        if (comment.parent_id) {
                            this.logger.log(`This is a reply to comment ${comment.parent_id}`);
                        }

                        // Store the comment in MongoDB
                        const storedComment = await this.commentModel.create({
                            commentId: comment.id,
                            mediaId: comment.media.id,
                            text: comment.text,
                            username: comment.from.username,
                            parentId: comment.parent_id,
                            isProcessed: false,
                        });

                        // Get or fetch media context
                        let media = await this.mediaModel.findOne({ mediaId: comment.media.id });
                        if (!media) {
                            this.logger.log(`Media ${comment.media.id} not found, fetching from Instagram API`);
                            await this.mediaService.fetchAndStoreNewMedia();
                            media = await this.mediaModel.findOne({ mediaId: comment.media.id });
                            if (!media) {
                                this.logger.log(`Media ${comment.media.id} Not found after update`);
                            }
                        }

                        // Generate response using LLM with media context
                        const response = await this.llmService.generateResponse(comment.text, {
                            caption: media?.caption,
                            type: media?.type,
                        });
                        this.logger.log(`Generated response: ${response}`);

                        // Post reply to Instagram
                        const replyResponse = await axios.post(
                            `https://graph.instagram.com/v22.0/${comment.id}/replies`,
                            {
                                message: `@${comment.from.username} ${response}`,
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        // Update comment with reply information
                        await this.commentModel.updateOne(
                            { commentId: comment.id },
                            {
                                replyText: response,
                                repliedAt: new Date(),
                                isProcessed: true,
                            }
                        );

                        this.logger.log(`Successfully replied to comment ${comment.id}`);
                        this.logger.log('Instagram API Response:', JSON.stringify(replyResponse.data, null, 2));
                    } catch (error) {
                        this.logger.error(
                            `Error processing comment ${comment.id}: ${error.message}`,
                            error.stack,
                        );
                        if (error.response) {
                            this.logger.error('Instagram API Error Response:', JSON.stringify(error.response.data, null, 2));
                            this.logger.error('Instagram API Error Status:', error.response.status);
                            this.logger.error('Instagram API Error Headers:', JSON.stringify(error.response.headers, null, 2));
                        }
                        if (error.request) {
                            this.logger.error('Instagram API Request:', {
                                url: error.request.path,
                                method: error.request.method,
                                headers: error.request.headers,
                                data: error.request.data,
                            });
                        }
                        // Don't throw the error to prevent webhook retries
                        // Instagram will retry failed webhooks automatically
                    }
                }
            }
        }
    }
} 