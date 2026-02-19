
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerRequest, PartnerRequestDocument } from '../schema/partner-request.schema';
import { CreatePartnerRequestDto } from '../dto/create-partner-request.dto';

import { PartnersService } from './partners.service';

@Injectable()
export class PartnerRequestsService {
    constructor(
        @InjectModel(PartnerRequest.name) private requestModel: Model<PartnerRequestDocument>,
        private readonly partnersService: PartnersService
    ) { }

    async create(createPartnerRequestDto: CreatePartnerRequestDto): Promise<PartnerRequest> {
        const createdRequest = new this.requestModel(createPartnerRequestDto);
        return createdRequest.save();
    }

    async findAll(): Promise<PartnerRequest[]> {
        return this.requestModel.find().sort({ createdAt: -1 }).exec();
    }

    async updateStatus(id: string, status: string): Promise<PartnerRequest | null> {
        const request = await this.requestModel.findById(id);
        if (!request) return null;

        // Create Partner if approving for the first time
        if (status === 'APPROVED' && request.status !== 'APPROVED') {
            await this.partnersService.createFromRequest(request);
        }

        request.status = status;
        return request.save();
    }

    async remove(id: string): Promise<PartnerRequest | null> {
        return this.requestModel.findByIdAndDelete(id);
    }
}
