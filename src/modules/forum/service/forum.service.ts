import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ForumPost } from '../schema/forum-post.schema';
import { ForumComment } from '../schema/forum-comment.schema';

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(ForumPost.name) private postModel: Model<ForumPost>,
        @InjectModel(ForumComment.name) private commentModel: Model<ForumComment>,
    ) { }

    async create(createPostDto: any, userId: string) {
        const newPost = new this.postModel({
            ...createPostDto,
            author: userId,
        });
        return newPost.save();
    }

    // Obtener feed con datos del autor (Nombre y Avatar)
    async findAll() {
        return this.postModel
            .find()
            .populate('author', 'fullName avatarUrl') // Trae solo lo necesario del User
            .sort({ createdAt: -1 }) // Los más nuevos primero
            .exec();
    }

    async toggleLike(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);
        if (!post) {
            throw new Error('Post no encontrado');
        }
        const index = post.likes.indexOf(new Types.ObjectId(userId));

        if (index === -1) {
            post.likes.push(new Types.ObjectId(userId));
        } else {
            post.likes.splice(index, 1);
        }
        return post.save();
    }

    async addComment(userId: string, createCommentDto: any) {
        const { postId, content } = createCommentDto;

        // A) Crear el comentario
        const newComment = new this.commentModel({
            content,
            author: userId,
            post: postId,
        });
        await newComment.save();

        // B) Actualizar el contador en el Post padre (Optimización)
        await this.postModel.findByIdAndUpdate(postId, {
            $inc: { commentsCount: 1 } // Suma 1 al contador automáticamente
        });

        return newComment;
    }

    async findCommentsByPost(postId: string) {
        return this.commentModel.find({ post: postId })
            .populate('author', 'fullName avatarUrl') // Para ver quién escribió
            .sort({ createdAt: 1 }) // Los más viejos primero (orden cronológico)
            .exec();
    }
}