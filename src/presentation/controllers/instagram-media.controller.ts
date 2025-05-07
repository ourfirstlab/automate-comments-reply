import { Controller, Get, Post, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InstagramMediaService } from '../../infrastructure/services/instagram-media.service';

@ApiTags('Instagram Media')
@Controller('media')
export class InstagramMediaController {
    private readonly logger = new Logger(InstagramMediaController.name);

    constructor(private readonly mediaService: InstagramMediaService) { }

    @Get('fetch')
    @ApiOperation({ summary: 'Fetch and store new media posts' })
    @ApiResponse({ status: 200, description: 'Successfully fetched and stored new media' })
    async fetchNewMedia() {
        const newMedia = await this.mediaService.fetchAndStoreNewMedia();
        return {
            message: `Found ${newMedia.length} new media posts`,
            media: newMedia,
        };
    }

    @Get(':mediaId')
    @ApiOperation({ summary: 'Get media details by ID' })
    @ApiResponse({ status: 200, description: 'Returns media details' })
    async getMediaDetails(@Param('mediaId') mediaId: string) {
        return this.mediaService.getMediaById(mediaId);
    }
} 