import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RequestDocument = Request & Document;

export enum MaterialType {
    PLASTIC = 'PLASTIC',
    CARDBOARD = 'CARDBOARD',
    GLASS = 'GLASS',
    METAL = 'METAL',
    RAEE = 'RAEE',
}

export enum RequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}

@Schema({ timestamps: true })
export class Request {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    citizen: Types.ObjectId;

    @Prop({ required: true })
    category: string;

    @Prop({ required: true })
    materialType: string;

    @Prop({ required: true })
    quantity: number;

    @Prop({ default: 'peso' })
    measureType: string;

    @Prop({ type: String, required: false })
    description: string;

    @Prop({ type: String })
    imageUrl: string;

    // 👇 CAMBIO IMPORTANTE: ESTRUCTURA GEOJSON
    @Prop({
        type: {
            type: String, // 'Point'
            enum: ['Point'], // Solo permitimos puntos
            default: 'Point',
        },
        coordinates: {
            type: [Number], // Array de números [Longitud, Latitud]
            required: true,
        },
        address: { type: String } // Guardamos la dirección legible aquí también
    })
    location: {
        type: string;
        coordinates: number[];
        address?: string;
    };

    @Prop({ default: RequestStatus.PENDING, enum: RequestStatus })
    status: string;

    @Prop({ default: 0 })
    estimatedPoints: number;
}

export const RequestSchema = SchemaFactory.createForClass(Request);

// 👇 Indexamos el campo 'location' para búsquedas geoespaciales rápidas
RequestSchema.index({ location: '2dsphere' });