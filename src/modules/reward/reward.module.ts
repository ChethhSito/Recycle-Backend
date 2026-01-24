import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsService } from './service/reward.service';
import { RewardsController } from './controller/reward.controller';
import { Reward, RewardSchema } from './schema/reward.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
    ],
    controllers: [RewardsController],
    providers: [RewardsService],
    exports: [RewardsService]
})
export class RewardsModule { }