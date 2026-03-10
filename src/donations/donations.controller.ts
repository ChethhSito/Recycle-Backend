import { Controller, Post, Get, Body, UseGuards, Req, Param, Patch, Delete } from '@nestjs/common';
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

    @Post(':id/send-email')
    async sendEmail(@Param('id') id: string) {
        return this.donationsService.sendThankYouEmailById(id);
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

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.donationsService.deleteDonation(id);
    }

    @Patch('user/:userId/toggle-membership')
    async toggleMembership(@Param('userId') userId: string) {
        return this.donationsService.toggleUserMembership(userId);
    }
}
