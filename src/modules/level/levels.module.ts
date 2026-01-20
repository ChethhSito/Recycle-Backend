import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LevelsService } from './service/levels.service';
import { LevelsController } from './controller/levels.controller';
import { Level, LevelSchema } from './schema/levels.schema';

@Module({
    imports: [
        // 1. Registramos el Schema de Mongo
        MongooseModule.forFeature([{ name: Level.name, schema: LevelSchema }]),
    ],
    controllers: [LevelsController], // 2. Registramos el Controller
    providers: [LevelsService],      // 3. Registramos el Servicio
    exports: [LevelsService],        // (Opcional) Por si otro módulo necesita info de niveles
})
export class LevelsModule { }