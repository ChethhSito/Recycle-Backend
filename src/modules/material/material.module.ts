import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialService } from './service/material.service';
import { MaterialController } from './controller/material.controller';
import { Material, MaterialSchema } from './schema/material.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }])],
    controllers: [MaterialController],
    providers: [MaterialService],
    exports: [MaterialService],
})
export class MaterialModule { }
