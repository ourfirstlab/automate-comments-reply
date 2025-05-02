import { IsArray, IsString, IsNumber, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class FromDto {
    @IsString()
    id: string;

    @IsString()
    username: string;
}

class MediaDto {
    @IsString()
    id: string;

    @IsString()
    media_product_type: string;
}

class ValueDto {
    @IsObject()
    @ValidateNested()
    @Type(() => FromDto)
    from: FromDto;

    @IsObject()
    @ValidateNested()
    @Type(() => MediaDto)
    media: MediaDto;

    @IsString()
    id: string;

    @IsString()
    text: string;
}

class ChangeDto {
    @IsObject()
    @ValidateNested()
    @Type(() => ValueDto)
    value: ValueDto;

    @IsString()
    field: string;
}

class EntryDto {
    @IsString()
    id: string;

    @IsNumber()
    time: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChangeDto)
    changes: ChangeDto[];
}

export class InstagramWebhookDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EntryDto)
    entry: EntryDto[];

    @IsString()
    object: string;
} 