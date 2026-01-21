// src/modules/users/service/users.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'; // npm install bcrypt
import { User, UserDocument } from '../schema/users.schema';
import { CreateUserDto } from '../dto/users.dto';
import { CloudinaryService } from 'src/common/cloudinary.service';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private cloudinaryService: CloudinaryService) { }

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

    async updateAvatar(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ninguna imagen');
        }

        // 1. Subir imagen a Cloudinary
        const result = await this.cloudinaryService.uploadFile(file);

        // 2. Actualizar el usuario en Mongo con la nueva URL
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { avatarUrl: result.secure_url },
            { new: true } // Esto hace que nos devuelva el usuario YA actualizado
        );

        if (!updatedUser) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // 3. Retornamos la nueva URL para que el frontend la muestre al instante
        return {
            message: 'Avatar actualizado correctamente',
            avatarUrl: updatedUser.avatarUrl
        };
    }

    async updateProfile(userId: string, data: { fullName?: string; phone?: string }) {
        // findByIdAndUpdate(ID, Datos Nuevos, Opciones)
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            {
                ...data // Esto expande fullName y phone si vienen en el objeto
            },
            { new: true } // Importante: devuelve el dato nuevo, no el viejo
        );

        if (!updatedUser) throw new NotFoundException('Usuario no encontrado');

        return updatedUser;
    }
}