import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material } from '../schema/material.schema';
import { CreateMaterialDto, UpdateMaterialDto } from '../dto/material.dto';

@Injectable()
export class MaterialService {
    constructor(@InjectModel(Material.name) private materialModel: Model<Material>) { }

    async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
        const createdMaterial = new this.materialModel(createMaterialDto);
        return createdMaterial.save();
    }

    async findAll(): Promise<Material[]> {
        return this.materialModel.find().exec();
    }

    async findOne(id: string): Promise<Material | null> {
        return this.materialModel.findById(id).exec();
    }

    async update(id: string, updateMaterialDto: UpdateMaterialDto): Promise<Material | null> {
        return this.materialModel.findByIdAndUpdate(id, updateMaterialDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Material | null> {
        return this.materialModel.findByIdAndDelete(id).exec();
    }
}
