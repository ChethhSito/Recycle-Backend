import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EcoParticipantDocument = HydratedDocument<EcoParticipant>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class EcoParticipant {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user: Types.ObjectId;

    @Prop({ default: 0 })
    total_recycled_kg: number;

    @Prop({ default: 0 })
    current_points: number;

    @Prop({ default: 1 }) // ID numérico para compatibilidad inicial
    level_id: number;

    @Prop({ type: Types.ObjectId, ref: 'Level', default: null })
    level_ref: Types.ObjectId; // Referencia normalizada para el futuro

    @Prop({ type: String, enum: ['NONE', 'ECO_SOCIO', 'ECO_EMBAJADOR', 'ECO_VISIONARIO'], default: 'NONE' })
    membershipTier: string;

    @Prop({ type: String, enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'NONE'], default: 'NONE' })
    membershipStatus: string;

    @Prop({ type: Date, default: null })
    lastActivity: Date;
}

export const EcoParticipantSchema = SchemaFactory.createForClass(EcoParticipant);
