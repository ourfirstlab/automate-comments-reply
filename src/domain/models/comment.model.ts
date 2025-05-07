import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
    @Prop({ required: true })
    commentId: string;

    @Prop({ required: true })
    mediaId: string;

    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    username: string;

    @Prop()
    parentId?: string;

    @Prop()
    replyText?: string;

    @Prop({ type: Date })
    repliedAt?: Date;

    @Prop({ type: Boolean, default: false })
    isProcessed: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment); 