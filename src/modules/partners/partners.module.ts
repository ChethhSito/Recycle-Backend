
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnersController } from './controller/partners.controller';
import { PartnersService } from './service/partners.service';
import { Partner, PartnerSchema } from './schema/partner.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Partner.name, schema: PartnerSchema }]),
    ],
    controllers: [PartnersController],
    providers: [PartnersService],
})
export class PartnersModule { }
