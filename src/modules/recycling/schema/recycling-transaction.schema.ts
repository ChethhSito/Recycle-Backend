import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RecyclingStatus } from '../enum/recycling-status.enum';

@Schema({ timestamps: true })
export class RecyclingTransaction extends Document {

    // Relaciones
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    citizenId: Types.ObjectId; // Quién entrega

    @Prop({ type: Types.ObjectId, ref: 'User' })
    recyclerId: Types.ObjectId; // Quién recoge (puede ser null al inicio)

    @Prop({ type: Types.ObjectId, ref: 'Material', required: true })
    materialId: Types.ObjectId; // Qué material es

    // Detalles
    @Prop({ required: true })
    quantity: number; // Cantidad o peso reportado por ciudadano

    @Prop({ required: true })
    confirmedQuantity: number; // Cantidad REAL confirmada por reciclador


    // Cálculos finales (Se llenan al completar la transacción)
    @Prop()
    pointsEarned: number; // Puntos ganados

    @Prop()
    co2Saved: number; // Huella verde generada

    @Prop()
    evidenceUrl: string; // Foto de la bolsa/material
}

export const RecyclingTransactionSchema = SchemaFactory.createForClass(RecyclingTransaction);