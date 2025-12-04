import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecyclingTransaction } from '../schema/recycling-transaction.schema';
import { CreateRecyclingDto, UpdateRecyclingDto } from '../dto/recycling.dto';

@Injectable()
export class RecyclingService {
    constructor(@InjectModel(RecyclingTransaction.name) private recyclingModel: Model<RecyclingTransaction>) { }

    async create(createRecyclingDto: CreateRecyclingDto): Promise<RecyclingTransaction> {
        const createdTransaction = new this.recyclingModel(createRecyclingDto);
        return createdTransaction.save();
    }

    async findAll(): Promise<RecyclingTransaction[]> {
        return this.recyclingModel.find().exec();
    }

    async findOne(id: string): Promise<RecyclingTransaction | null> {
        return this.recyclingModel.findById(id).exec();
    }

    async update(id: string, updateRecyclingDto: UpdateRecyclingDto): Promise<RecyclingTransaction | null> {
        return this.recyclingModel.findByIdAndUpdate(id, updateRecyclingDto, { new: true }).exec();
    }
}