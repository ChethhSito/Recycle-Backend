import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EcoHistoryStatus } from '../enum/eco-history-status.enum';
import { User } from '../../users/schema/users.schema';

export type EcoHistoryDocument = HydratedDocument<EcoHistory>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class EcoHistory {
    @Prop({ required: true })
    message: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId | User;

    @Prop({ required: false })
    photoUrl?: string;

    @Prop({
        enum: EcoHistoryStatus,
        default: EcoHistoryStatus.PENDING
    })
    status: string;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ default: 0 })
    likes: number;
}

export const EcoHistorySchema = SchemaFactory.createForClass(EcoHistory);
