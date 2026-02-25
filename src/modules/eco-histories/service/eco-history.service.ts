import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EcoHistory, EcoHistoryDocument } from '../schema/eco-history.schema';
import { CreateEcoHistoryDto, UpdateEcoHistoryStatusDto } from '../dto/eco-history.dto';
import { EcoHistoryStatus } from '../enum/eco-history-status.enum';

@Injectable()
export class EcoHistoryService {
    constructor(
        @InjectModel(EcoHistory.name) private ecoHistoryModel: Model<EcoHistoryDocument>
    ) { }

    async create(createDto: CreateEcoHistoryDto, userId: string): Promise<EcoHistory> {
        const newHistory = new this.ecoHistoryModel({
            ...createDto,
            user: new Types.ObjectId(userId),
            status: EcoHistoryStatus.PENDING
        });
        return newHistory.save();
    }

    async findAll(): Promise<EcoHistory[]> {
        return this.ecoHistoryModel.find()
            .populate('user', 'fullName email avatarUrl')
            .sort({ created_at: -1 })
            .exec();
    }

    async findApproved(): Promise<EcoHistory[]> {
        return this.ecoHistoryModel.find({ status: EcoHistoryStatus.APPROVED })
            .populate('user', 'fullName avatarUrl')
            .sort({ created_at: -1 })
            .exec();
    }

    async findFeatured(): Promise<EcoHistory[]> {
        return this.ecoHistoryModel.find({
            status: EcoHistoryStatus.APPROVED,
            isFeatured: true
        })
            .populate('user', 'fullName avatarUrl')
            .sort({ created_at: -1 })
            .limit(3)
            .exec();
    }

    async updateStatus(id: string, updateDto: UpdateEcoHistoryStatusDto): Promise<EcoHistory> {
        const updated = await this.ecoHistoryModel.findByIdAndUpdate(
            id,
            { status: updateDto.status },
            { new: true }
        ).exec();

        if (!updated) {
            throw new NotFoundException('EcoHistoria no encontrada');
        }
        return updated;
    }

    async toggleFeatured(id: string): Promise<EcoHistory> {
        const history = await this.ecoHistoryModel.findById(id);
        if (!history) throw new NotFoundException('EcoHistoria no encontrada');

        history.isFeatured = !history.isFeatured;
        return history.save();
    }

    async toggleLike(id: string): Promise<EcoHistory> {
        const history = await this.ecoHistoryModel.findById(id);
        if (!history) throw new NotFoundException('EcoHistoria no encontrada');

        // Para evitar que se borren, incrementamos el contador en el backend
        history.likes = (history.likes || 0) + 1;
        return history.save();
    }

    async remove(id: string): Promise<any> {
        return this.ecoHistoryModel.findByIdAndDelete(id).exec();
    }
}
