import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNumber, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CommentFromDto {
    @ApiProperty({
        description: 'Instagram-scoped ID of the Instagram user who made the comment',
        example: '123456789',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Username of the Instagram user who made the comment',
        example: 'example_user',
    })
    @IsString()
    username: string;
}

export class MediaDto {
    @ApiProperty({
        description: 'Media ID that was commented on',
        example: '17911317054015405',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Ad ID, included if the comment was on an ad post',
        example: '123456789',
        required: false,
    })
    @IsString()
    @IsOptional()
    ad_id?: string;

    @ApiProperty({
        description: 'Ad title, included if the comment was on an ad post',
        example: 'Summer Sale',
        required: false,
    })
    @IsString()
    @IsOptional()
    ad_title?: string;

    @ApiProperty({
        description: 'Original media ID, included if the comment was on an ad post',
        example: '123456789',
        required: false,
    })
    @IsString()
    @IsOptional()
    original_media_id?: string;

    @ApiProperty({
        description: 'Product ID, included if the comment was on a specific product in an ad',
        example: 'REELS',
    })
    @IsString()
    media_product_type: string;
}

export class CommentValueDto {
    @ApiProperty({
        description: 'The ID of the comment',
        example: '18038985995628134',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Comment text, included if comment included text',
        example: 'Great post!',
    })
    @IsString()
    text: string;

    @ApiProperty({
        description: 'The user who made the comment',
        type: CommentFromDto,
    })
    @ValidateNested()
    @Type(() => CommentFromDto)
    from: CommentFromDto;

    @ApiProperty({
        description: 'The media information',
        type: MediaDto,
    })
    @ValidateNested()
    @Type(() => MediaDto)
    media: MediaDto;

    @ApiProperty({
        description: 'The ID of the parent comment if this is a reply to another comment',
        example: '17892955707215182',
        required: false,
    })
    @IsString()
    @IsOptional()
    parent_id?: string;
}

export class WebhookChangeDto {
    @ApiProperty({
        description: 'The field that changed',
        example: 'comments',
    })
    @IsString()
    field: string;

    @ApiProperty({
        description: 'The value of the change',
        type: CommentValueDto,
    })
    @ValidateNested()
    @Type(() => CommentValueDto)
    value: CommentValueDto;
}

export class WebhookEntryDto {
    @ApiProperty({
        description: 'ID of your app user\'s Instagram professional account',
        example: '17841463234297561',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Time Meta sent the notification',
        example: 1746204741,
    })
    @IsNumber()
    time: number;

    @ApiProperty({
        description: 'The changes in the webhook',
        type: [WebhookChangeDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WebhookChangeDto)
    changes: WebhookChangeDto[];
}

export class WebhookPayloadDto {
    @ApiProperty({
        description: 'The webhook entries',
        type: [WebhookEntryDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WebhookEntryDto)
    entry: WebhookEntryDto[];

    @ApiProperty({
        description: 'The object type',
        example: 'instagram',
    })
    @IsString()
    object: string;
} 