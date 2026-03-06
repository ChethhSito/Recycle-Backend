import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EcoParticipantDocument = HydratedDocument<EcoParticipant>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class EcoParticipant {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
    user: Types.ObjectId;

    @Prop({ default: 0 })
    total_recycled_kg: number;

    @Prop({ default: 0 })
    current_points: number;

    @Prop({ default: 1 }) // ID numérico para compatibilidad inicial
    level_id: number;

    @Prop({ type: Types.ObjectId, ref: 'Level', default: null })
    level_ref: Types.ObjectId; // Referencia normalizada para el futuro

    @Prop({
        type: {
            total_kg: { type: Number, default: 0 },
            total_units: { type: Number, default: 0 },
            by_category: {
                plastic: {
                    kg: { type: Number, default: 0 },
                    units: { type: Number, default: 0 }
                },
                paper: {
                    kg: { type: Number, default: 0 },
                    units: { type: Number, default: 0 }
                },
                glass: {
                    kg: { type: Number, default: 0 },
                    units: { type: Number, default: 0 }
                },
                metal: {
                    kg: { type: Number, default: 0 },
                    units: { type: Number, default: 0 }
                },
                electronics: {
                    kg: { type: Number, default: 0 },
                    units: { type: Number, default: 0 }
                }
            }
        },
        _id: false,
        default: () => ({
            total_kg: 0,
            total_units: 0,
            by_category: {
                plastic: { kg: 0, units: 0 },
                paper: { kg: 0, units: 0 },
                glass: { kg: 0, units: 0 },
                metal: { kg: 0, units: 0 },
                electronics: { kg: 0, units: 0 }
            }
        })
    })
    recyclingStats: any;

    @Prop({ type: String, enum: ['NONE', 'ECO_SOCIO', 'ECO_EMBAJADOR', 'ECO_VISIONARIO'], default: 'NONE' })
    membershipTier: string;

    @Prop({ type: String, enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'NONE'], default: 'NONE' })
    membershipStatus: string;

    @Prop({ type: Date, default: null })
    lastActivity: Date;
}

export const EcoParticipantSchema = SchemaFactory.createForClass(EcoParticipant);
