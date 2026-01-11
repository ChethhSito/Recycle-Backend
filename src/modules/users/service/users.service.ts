// src/modules/users/service/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'; // npm install bcrypt
import { User, UserDocument } from '../schema/users.schema';
import { CreateUserDto } from '../dto/users.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        // 1. Encriptar contraseña si existe (Para usuarios que NO son de Google)
        if (createUserDto.password) {
            const salt = await bcrypt.genSalt(10);
            createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
        }

        // 2. Crear usuario
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find().exec();
    }

    // Este método busca por ID de MongoDB (para perfiles)
    async findOne(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    // Este método busca por Email (para Login y Google)
    async findOneByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async remove(id: string): Promise<UserDocument | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }

    async update(id: string, update: Partial<User>): Promise<UserDocument | null> {
        return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
    }
}