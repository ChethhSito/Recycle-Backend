import { Module } from "@nestjs/common";
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { RecyclingTransactionSchema } from './schema/recycling-transaction.schema';
import { MaterialSchema } from 'src/modules/material/schema/material.schema';
import { UserSchema } from 'src/modules/users/schema/users.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'RecyclingTransaction', schema: RecyclingTransactionSchema },
            { name: 'Material', schema: MaterialSchema },
            { name: 'User', schema: UserSchema },
        ]),
    ],
})
export class RecyclingModule { }