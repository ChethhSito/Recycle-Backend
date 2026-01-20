import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LevelDocument = Level & Document;

@Schema({ timestamps: true })
export class Level {
    // Ej: "Semilla de Cambio"
    @Prop({ required: true, unique: true })
    name: string;

    // Ej: 1, 2, 3 (Para ordenar fácilmente)
    @Prop({ required: true, unique: true })
    levelNumber: number;

    // Puntos necesarios para ALCANZAR este nivel (targetPoints en tu Front)
    @Prop({ required: true })
    maxPoints: number;

    // Puntos donde inicia (opcional, pero útil para validaciones)
    @Prop({ required: true })
    minPoints: number;

    // --- TEXTOS ---
    @Prop({ required: true })
    description: string; // Frase corta

    @Prop({ required: true })
    longDescription: string; // Texto largo del modal

    // --- DISEÑO (Lo que agregaste) ---
    @Prop({ required: true })
    iconName: string; // Ej: 'seed', 'tree'

    @Prop({ required: true })
    primaryColor: string; // Ej: '#5D4037'

    @Prop({ required: true })
    bgColor: string; // Ej: '#F5E6D3'
}

export const LevelSchema = SchemaFactory.createForClass(Level);