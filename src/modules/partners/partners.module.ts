
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnersController } from './controller/partners.controller';
import { PartnersService } from './service/partners.service';
import { Partner, PartnerSchema } from './schema/partner.schema';
import { PartnerRequest, PartnerRequestSchema } from './schema/partner-request.schema';
import { PartnerRequestsController } from './controller/requests.controller';
import { PartnerRequestsService } from './service/requests.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Partner.name, schema: PartnerSchema },
            { name: PartnerRequest.name, schema: PartnerRequestSchema }
        ]),
    ],
    controllers: [PartnersController, PartnerRequestsController],
    providers: [PartnersService, PartnerRequestsService],
})
export class PartnersModule { }
