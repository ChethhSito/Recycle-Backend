import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enum/userRole.enum';

@Schema({ timestamps: true })
export class User extends Document {
    // --- Identificación ---
    @Prop({ required: true, unique: true })
    dni: string;

    @Prop({ required: true })
    firstName: string; // nombres

    @Prop({ required: true })
    lastName: string; // apellidos

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string; // contrasena_hash

    @Prop()
    phone: string;

    @Prop({ required: true, enum: UserRole, default: UserRole.CITIZEN })
    role: UserRole;

    @Prop()
    birthDate: Date;

    // --- Ubicación Detallada ---
    @Prop()
    addressText: string; // La dirección escrita

    @Prop()
    district: string;

    @Prop()
    province: string;

    @Prop()
    department: string;

    // GeoJSON para mapas (latitud/longitud optimizado para Mongo)
    @Prop({
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [longitud, latitud]
    })
    location: { type: string; coordinates: number[] };

    // --- Campos específicos de Reciclador ---
    @Prop({ default: false })
    isFormalized: boolean; // es_formalizado

    // --- Gamificación (Acumuladores) ---
    @Prop({ default: 0 })
    currentPoints: number; // puntos_actuales

    @Prop({ default: 0 })
    greenFootprintCO2: number; // huella_verde_total (CO2 ahorrado)
}

export const UserSchema = SchemaFactory.createForClass(User);
// Importante: Crear índice para búsquedas geográficas rápidas
UserSchema.index({ location: '2dsphere' });