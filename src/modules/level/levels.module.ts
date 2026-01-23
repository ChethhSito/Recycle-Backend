import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LevelsService } from './service/levels.service';
import { LevelsController } from './controller/levels.controller';
import { Level, LevelSchema } from './schema/levels.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Level.name, schema: LevelSchema }]),
    ],
    controllers: [LevelsController],
    providers: [LevelsService],
    exports: [LevelsService],
})
export class LevelsModule { }