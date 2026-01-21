import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { User, UserSchema } from './schema/users.schema';
import { CloudinaryModule } from 'src/common/cloudinary.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        CloudinaryModule],

    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }