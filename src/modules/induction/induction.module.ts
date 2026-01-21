
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InductionController } from './controller/induction.controller';
import { InductionService } from './service/induction.service';
import { Induction, InductionSchema } from './schema/induction.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Induction.name, schema: InductionSchema }]),
    ],
    controllers: [InductionController],
    providers: [InductionService],
})
export class InductionModule { }
