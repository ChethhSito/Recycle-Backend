import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EcoHistoryController } from './controller/eco-history.controller';
import { EcoHistoryService } from './service/eco-history.service';
import { EcoHistory, EcoHistorySchema } from './schema/eco-history.schema';
import { User, UserSchema } from '../users/schema/users.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: EcoHistory.name, schema: EcoHistorySchema },
            { name: User.name, schema: UserSchema }
        ])
    ],
    controllers: [EcoHistoryController],
    providers: [EcoHistoryService],
    exports: [EcoHistoryService]
})
export class EcoHistoryModule { }
