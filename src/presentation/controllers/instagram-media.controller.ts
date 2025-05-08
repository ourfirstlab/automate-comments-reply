import { Controller, Get, Post, Param, Logger, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InstagramMediaService } from '../../infrastructure/services/instagram-media.service';

@ApiTags('Instagram Media')
@Controller('media')
export class InstagramMediaController {
    private readonly logger = new Logger(InstagramMediaController.name);

    constructor(private readonly mediaService: InstagramMediaService) { }

    @Get('fetch')
    @ApiOperation({ summary: 'Fetch and store new media posts' })
    @ApiResponse({ status: 200, description: 'Successfully fetched and stored new media' })
    @ApiQuery({ name: 'verify_token', required: true, type: String })
    async fetchNewMedia(@Query('verify_token') verifyToken: string) {
        this.checkVerifyToken(verifyToken);
        const newMedia = await this.mediaService.fetchAndStoreNewMedia();
        return {
            message: `Found ${newMedia.length} new media posts`,
            media: newMedia,
        };
    }

    @Get(':mediaId')
    @ApiOperation({ summary: 'Get media details by ID' })
    @ApiResponse({ status: 200, description: 'Returns media details' })
    @ApiQuery({ name: 'verify_token', required: true, type: String })
    async getMediaDetails(@Param('mediaId') mediaId: string, @Query('verify_token') verifyToken: string) {
        this.checkVerifyToken(verifyToken);
        return this.mediaService.getMediaById(mediaId);
    }

    private checkVerifyToken(token: string) {
        // This should match the logic in the webhook controller
        const expected = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
        if (!token || token !== expected) {
            throw new BadRequestException('Invalid or missing verify_token');
        }
    }
} 