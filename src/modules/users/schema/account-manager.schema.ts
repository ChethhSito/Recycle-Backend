import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AccountManagerDocument = HydratedDocument<AccountManager>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class AccountManager {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user: Types.ObjectId;

    @Prop({ type: String, default: null })
    institution: string;

    @Prop({ type: Types.ObjectId, ref: 'Partner', default: null })
    partner: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Program' }], default: [] })
    managedPrograms: Types.ObjectId[];
}

export const AccountManagerSchema = SchemaFactory.createForClass(AccountManager);
