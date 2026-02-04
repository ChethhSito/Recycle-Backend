import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ForumComment extends Document {
    @Prop({ required: true })
    content: string;

    // ¿Quién lo escribió?
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: Types.ObjectId;

    // ¿A qué conversación pertenece?
    @Prop({ type: Types.ObjectId, ref: 'ForumPost', required: true })
    post: Types.ObjectId;
}

export const ForumCommentSchema = SchemaFactory.createForClass(ForumComment);