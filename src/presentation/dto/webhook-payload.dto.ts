import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class CommentFromDto {
    @ApiProperty({
        description: 'The ID of the user who made the comment',
        example: '987654321',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'The username of the user who made the comment',
        example: 'example_user',
    })
    @IsString()
    username: string;
}

class CommentValueDto {
    @ApiProperty({
        description: 'The ID of the comment',
        example: '123456789',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'The text of the comment',
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
        description: 'The timestamp when the comment was created',
        example: '2024-05-02T12:00:00Z',
    })
    @IsString()
    created_time: string;

    @ApiProperty({
        description: 'The ID of the post',
        example: '123456789',
    })
    @IsString()
    post_id: string;
}

class WebhookChangeDto {
    @ApiProperty({
        description: 'The value of the change',
        type: CommentValueDto,
    })
    @ValidateNested()
    @Type(() => CommentValueDto)
    value: CommentValueDto;

    @ApiProperty({
        description: 'The field that changed',
        example: 'comments',
    })
    @IsString()
    field: string;
}

class WebhookEntryDto {
    @ApiProperty({
        description: 'The changes in the webhook',
        type: [WebhookChangeDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WebhookChangeDto)
    changes: WebhookChangeDto[];

    @ApiProperty({
        description: 'The ID of the entry',
        example: '123456789',
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'The time of the entry',
        example: 1714646400,
    })
    @IsNumber()
    time: number;
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
} 