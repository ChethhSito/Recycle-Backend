// src/modules/requests/schemas/request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RequestDocument = Request & Document;

@Schema({ timestamps: true })
export class Request {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId; // ¿De quién es? (Lo sacamos del Token)

    @Prop({ required: true, enum: ['plastic', 'cardboard', 'metal', 'glass', 'raee'] })
    material: string; // Para saber en qué tarjeta pintarlo

    @Prop({ required: true })
    quantity: number; // El peso (ej: 5.2)

    @Prop({ required: true, default: 'kg' })
    unit: string;

    @Prop({ default: 'pending', enum: ['pending', 'accepted', 'completed', 'canceled'] })
    status: string; // Solo sumaremos los que estén 'completed'
}

export const RequestSchema = SchemaFactory.createForClass(Request);