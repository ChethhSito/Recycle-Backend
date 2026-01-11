import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../enum/userRole.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }) // Esto crea created_at y updated_at automáticos
export class User {
    // --- DATOS OBLIGATORIOS ---
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, unique: true }) // Email único es vital
    email: string;

    @Prop({ default: 'local' }) // 'local' o 'google'
    authProvider: string;

    @Prop({ enum: UserRole, default: UserRole.CITIZEN })
    role: string;

    // --- DATOS OPCIONALES (Para Google) ---
    @Prop({
        unique: true,
        sparse: true,
        type: String,
        // 👇 ESTA LÍNEA ES LA MAGIA: Convierte "" en undefined
        set: (val: string) => (val === '' ? undefined : val)
    })
    documentNumber: string;

    @Prop({ required: false })
    password?: string; // Guardaremos el Hash aquí

    @Prop({
        unique: true,
        sparse: true,
        type: String,
        set: (val: string) => (val === '' ? undefined : val) // 👇 Aplícalo aquí también
    })
    phone: string;

    @Prop({ required: false })
    avatarUrl?: string;

    @Prop({
        unique: true,
        sparse: true,
        type: String,
        set: (val: string) => (val === '' ? undefined : val) // 👇 Y aquí
    })
    googleId: string;

    // --- GAMIFICACIÓN (Valores por defecto) ---
    @Prop({ default: 0 })
    total_recycled_kg: number;

    @Prop({ default: 0 })
    current_points: number;

    @Prop({ default: 1 }) // ID del nivel Semilla
    level_id: number;

    @Prop({ type: String, default: null })
    resetPasswordToken: string | null;

    // SOLUCIÓN: Agrega "type: Date" explícitamente
    @Prop({ type: Date, default: null })
    resetPasswordExpires: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);