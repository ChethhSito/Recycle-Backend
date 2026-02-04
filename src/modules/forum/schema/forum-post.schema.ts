import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ForumCategory } from '../enum/forum-category.enum';

@Schema({ timestamps: true })
export class ForumPost extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: String, enum: ForumCategory, default: ForumCategory.GENERAL })
    category: ForumCategory;

    // Vinculación al Usuario (como en tu esquema de forum_comments)
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: Types.ObjectId;

    // Array de IDs de usuarios que dieron like
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    likes: Types.ObjectId[];

    @Prop({ default: 0 })
    commentsCount: number;
}

export const ForumPostSchema = SchemaFactory.createForClass(ForumPost);