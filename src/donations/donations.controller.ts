import { Controller, Post, Get, Body, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('donations')
@UseGuards(AuthGuard('jwt'))
export class DonationsController {
    constructor(private readonly donationsService: DonationsService) { }

    @Post()
    async create(@Req() req, @Body() body: any) {
        return this.donationsService.createDonation(req.user.sub, body);
    }

    @Get()
    async findAll() {
        return this.donationsService.findAll();
    }

    @Patch(':id/approve')
    async approve(@Param('id') id: string) {
        return this.donationsService.approveDonation(id);
    }

    @Patch(':id/reject')
    async reject(@Param('id') id: string) {
        return this.donationsService.rejectDonation(id);
    }
}
