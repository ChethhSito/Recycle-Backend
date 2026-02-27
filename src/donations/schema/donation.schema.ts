import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DonationDocument = Donation & Document;

export enum DonationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export enum MembershipTier {
    NONE = 'NONE',
    STARTER = 'STARTER', // Eco-Socio
    GROWTH = 'GROWTH',   // Eco-Embajador
    HERO = 'HERO'        // Eco-Visionario
}

@Schema({ timestamps: true })
export class Donation {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    payerName: string;

    @Prop({ enum: MembershipTier, required: true })
    tier: MembershipTier;

    @Prop({ required: true })
    amount: number;

    @Prop({ enum: DonationStatus, default: DonationStatus.PENDING })
    status: DonationStatus;

    @Prop({ type: String })
    transactionId?: string;

    @Prop({ type: String })
    imageUrl?: string;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
