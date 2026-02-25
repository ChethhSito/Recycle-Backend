
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PartnerRequestDocument = PartnerRequest & Document;

@Schema({ timestamps: true })
export class PartnerRequest {
    @Prop({ required: true })
    name: string; // Nombre Empresa

    @Prop({ required: true })
    email: string;

    @Prop()
    phone: string;

    @Prop()
    website: string; // Redes o Web

    @Prop()
    message: string;

    @Prop({ default: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CONTACTED'] })
    status: string;
}

export const PartnerRequestSchema = SchemaFactory.createForClass(PartnerRequest);
