import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Material extends Document {
    @Prop({ required: true, unique: true })
    name: string; // Plástico, Vidrio, Cartón

    @Prop({ required: true })
    unit: string; // 'KG', 'UNIDAD'

    // Reglas de negocio (Puntos)
    @Prop({ required: true })
    pointsPerUnitDonated: number; // Ej: 10 puntos si regala

    @Prop({ required: true })
    pointsPerUnitSold: number;    // Ej: 5 puntos si vende

    @Prop({ required: true })
    co2FactorPerUnit: number;     // Factor para Huella Verde (Ej: 0.5 kg CO2)

    @Prop({ default: true })
    isActive: boolean;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);