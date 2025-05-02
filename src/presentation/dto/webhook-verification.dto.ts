import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WebhookVerificationDto {
    @ApiProperty({
        description: 'The mode of the webhook request',
        example: 'subscribe',
    })
    @IsString()
    'hub.mode': string;

    @ApiProperty({
        description: 'The verification token',
        example: 'your_verification_token',
    })
    @IsString()
    'hub.verify_token': string;

    @ApiProperty({
        description: 'The challenge string to be returned',
        example: 'challenge_string',
    })
    @IsString()
    'hub.challenge': string;
} 