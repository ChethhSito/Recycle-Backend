
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Induction, InductionDocument } from '../schema/induction.schema';
import { CreateInductionDto } from '../dto/create-induction.dto';
import { UpdateInductionDto } from '../dto/update-induction.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class InductionService {
    constructor(
        @InjectModel(Induction.name) private inductionModel: Model<InductionDocument>,
    ) { }

    async create(createInductionDto: CreateInductionDto): Promise<Induction> {
        const createdInduction = new this.inductionModel(createInductionDto);
        return createdInduction.save();
    }

    async findAll(): Promise<Induction[]> {
        return this.inductionModel.find({ isActive: true }).exec();
    }

    async findOne(id: string): Promise<Induction> {
        const induction = await this.inductionModel.findById(id).exec();
        if (!induction) {
            throw new NotFoundException(`Induction video with ID ${id} not found`);
        }
        return induction;
    }

    async update(id: string, updateInductionDto: UpdateInductionDto): Promise<Induction> {
        const updatedInduction = await this.inductionModel
            .findByIdAndUpdate(id, updateInductionDto, { new: true })
            .exec();
        if (!updatedInduction) {
            throw new NotFoundException(`Induction video with ID ${id} not found`);
        }
        return updatedInduction;
    }

    async remove(id: string): Promise<Induction> {
        const deletedInduction = await this.inductionModel
            .findByIdAndDelete(id)
            .exec();
        if (!deletedInduction) {
            throw new NotFoundException(`Induction video with ID ${id} not found`);
        }
        return deletedInduction;
    }

    async incrementView(id: string): Promise<Induction> {
        const updatedInduction = await this.inductionModel
            .findByIdAndUpdate(
                id,
                { $inc: { views: 1 } },
                { new: true },
            )
            .exec();
        if (!updatedInduction) {
            throw new NotFoundException(`Induction video with ID ${id} not found`);
        }
        return updatedInduction;
    }
}
