import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Media } from '../../domain/models/media.model';

@Injectable()
export class InstagramMediaService {
    private readonly logger = new Logger(InstagramMediaService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectModel(Media.name) private readonly mediaModel: Model<Media>,
    ) { }

    async fetchAndStoreNewMedia(): Promise<Media[]> {
        const accessToken = this.configService.get<string>('instagram.accessToken');
        const userId = this.configService.get<string>('instagram.userId');

        try {
            const response = await axios.get(
                `https://graph.instagram.com/v22.0/${userId}/media`,
                {
                    params: {
                        fields: 'id,caption,media_type',
                        access_token: accessToken,
                    },
                }
            );

            const newMedia: Media[] = [];

            for (const mediaData of response.data.data) {
                const existingMedia = await this.mediaModel.findOne({ mediaId: mediaData.id });

                if (!existingMedia) {
                    const media = await this.mediaModel.create({
                        mediaId: mediaData.id,
                        caption: mediaData.caption,
                        type: mediaData.media_type,
                        isProcessed: false,
                    });
                    newMedia.push(media);
                    this.logger.log(`Stored new media: ${mediaData.id}`);
                }
            }

            return newMedia;
        } catch (error) {
            this.logger.error('Error fetching media:', error.message);
            throw error;
        }
    }

    async getMediaById(mediaId: string): Promise<Media | null> {
        return this.mediaModel.findOne({ mediaId });
    }

    async markMediaAsProcessed(mediaId: string): Promise<void> {
        await this.mediaModel.updateOne(
            { mediaId },
            {
                isProcessed: true,
                processedAt: new Date(),
            }
        );
    }
} 