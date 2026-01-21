
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Partner, PartnerDocument } from '../schema/partner.schema';
import { CreatePartnerDto } from '../dto/create-partner.dto';
import { UpdatePartnerDto } from '../dto/update-partner.dto';

@Injectable()
export class PartnersService {
    constructor(
        @InjectModel(Partner.name) private partnerModel: Model<PartnerDocument>,
    ) { }

    async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
        const createdPartner = new this.partnerModel(createPartnerDto);
        return createdPartner.save();
    }

    async findAll(): Promise<Partner[]> {
        // Sort pinned items first
        return this.partnerModel.find().sort({ isPinned: -1, _id: -1 }).exec();
    }

    async findOne(id: string): Promise<Partner> {
        const partner = await this.partnerModel.findById(id).exec();
        if (!partner) {
            throw new NotFoundException(`Partner with ID ${id} not found`);
        }
        return partner;
    }

    async update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner> {
        const updatedPartner = await this.partnerModel
            .findByIdAndUpdate(id, updatePartnerDto, { new: true })
            .exec();
        if (!updatedPartner) {
            throw new NotFoundException(`Partner with ID ${id} not found`);
        }
        return updatedPartner;
    }

    async remove(id: string): Promise<Partner> {
        const deletedPartner = await this.partnerModel
            .findByIdAndDelete(id)
            .exec();
        if (!deletedPartner) {
            throw new NotFoundException(`Partner with ID ${id} not found`);
        }
        return deletedPartner;
    }
}
