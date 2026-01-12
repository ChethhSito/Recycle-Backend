// src/modules/levels/schemas/level.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LevelDocument = Level & Document;

@Schema({ timestamps: true })
export class Level {
    @Prop({ required: true })
    name: string; // "Semilla", "Brote"

    @Prop({ required: true })
    minPoints: number;

    @Prop({ required: true })
    maxPoints: number;

    @Prop()
    badgeUrl: string;
}