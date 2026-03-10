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
    ECO_SOCIO = 'ECO_SOCIO',
    ECO_EMBAJADOR = 'ECO_EMBAJADOR',
    ECO_VISIONARIO = 'ECO_VISIONARIO'
}

@Schema({ timestamps: true })
export class Donation {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    payerName: string;

    @Prop({ enum: MembershipTier, required: true })
    membershipTier: MembershipTier;

    @Prop({ required: true })
    amount: number;

    @Prop({ enum: DonationStatus, default: DonationStatus.PENDING })
    status: DonationStatus;

    @Prop({ type: String })
    imageUrl?: string;

    @Prop({ default: false })
    isRead: boolean;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
