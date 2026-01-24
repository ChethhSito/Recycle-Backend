import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RewardCategory, PartnerType } from '../enum/reward-category.enum';

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: false })
    imageUrl: string; // URL de la imagen

    @Prop({ required: true, min: 0 })
    points: number; // Costo en puntos

    @Prop({ required: true, enum: RewardCategory })
    category: RewardCategory;

    @Prop({ default: 0, min: 0 })
    stock: number;

    @Prop({ required: true })
    sponsor: string; // "EcoLife Store", "Yape", etc.

    @Prop({ required: true })
    expiryDate: Date; // Fecha de vencimiento

    @Prop({ required: true })
    terms: string; // Términos y condiciones

    // --- Campos opcionales para Partners ---
    @Prop({ default: false })
    isPartner: boolean;

    @Prop({ required: false })
    partnerName: string;

    @Prop({ required: false, enum: PartnerType })
    partnerType: PartnerType;

    @Prop({ default: true })
    isActive: boolean;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);