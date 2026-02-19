
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreatePartnerRequestDto } from '../dto/create-partner-request.dto';
import { PartnerRequestsService } from '../service/requests.service';

@Controller('partner-requests')
export class PartnerRequestsController {
    constructor(private readonly requestsService: PartnerRequestsService) { }

    @Post()
    create(@Body() createPartnerRequestDto: CreatePartnerRequestDto) {
        return this.requestsService.create(createPartnerRequestDto);
    }

    @Get()
    findAll() {
        return this.requestsService.findAll();
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.requestsService.updateStatus(id, status);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.requestsService.remove(id);
    }
}
