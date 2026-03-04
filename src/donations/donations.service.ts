import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Donation, DonationDocument, DonationStatus } from './schema/donation.schema';
import { User, UserDocument } from '../modules/users/schema/users.schema';
import { EcoParticipant, EcoParticipantDocument } from '../modules/users/schema/eco-participant.schema';

@Injectable()
export class DonationsService {
    constructor(
        @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(EcoParticipant.name) private participantModel: Model<EcoParticipantDocument>,
    ) { }

    async createDonation(userId: string, data: any) {
        const donation = new this.donationModel({
            user: userId,
            ...data,
            status: DonationStatus.PENDING,
        });

        // Actualizamos el perfil de participante a PENDING si aplica
        await this.participantModel.findOneAndUpdate(
            { user: userId },
            { membershipStatus: 'PENDING' },
            { upsert: true }
        );

        return donation.save();
    }

    async findAll() {
        return this.donationModel.find().populate('user', 'fullName email').sort({ createdAt: -1 }).exec();
    }

    async approveDonation(donationId: string) {
        const donation = await this.donationModel.findById(donationId);
        if (!donation) return null;

        donation.status = DonationStatus.APPROVED;
        await donation.save();

        // 🏆 ACTUALIZACIÓN DE MEMBRESÍA EN EL PERFIL (NORMALIZADO)
        const tierMapping = {
            'starter': 'ECO_SOCIO',
            'growth': 'ECO_EMBAJADOR',
            'hero': 'ECO_VISIONARIO'
        };

        const finalTier = tierMapping[donation.tier] || 'NONE';

        await this.participantModel.findOneAndUpdate(
            { user: donation.user },
            {
                membershipTier: finalTier,
                membershipStatus: 'ACTIVE',
            },
            { upsert: true }
        );

        return donation;
    }

    async rejectDonation(donationId: string) {
        const donation = await this.donationModel.findById(donationId);
        if (!donation) return null;

        donation.status = DonationStatus.REJECTED;
        return donation.save();
    }
}
