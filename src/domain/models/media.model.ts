import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Media extends Document {
    @Prop({ required: true, unique: true })
    mediaId: string;

    @Prop()
    caption?: string;

    @Prop({ required: true })
    type: string;

    @Prop({ type: Boolean, default: false })
    isProcessed: boolean;

    @Prop({ type: Date })
    processedAt?: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media); 