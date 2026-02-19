import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EcoHistoryService } from '../service/eco-history.service';
import { CreateEcoHistoryDto, UpdateEcoHistoryStatusDto } from '../dto/eco-history.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enum/userRole.enum';

@ApiTags('Eco-Histories')
@Controller('eco-histories')
export class EcoHistoryController {
    constructor(private readonly ecoHistoryService: EcoHistoryService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new eco-history (Story)' })
    create(@Body() createDto: CreateEcoHistoryDto, @Req() req) {
        return this.ecoHistoryService.create(createDto, req.user.sub);
    }

    @Get('public')
    @ApiOperation({ summary: 'Get only approved eco-histories' })
    findApproved() {
        return this.ecoHistoryService.findApproved();
    }

    @Get('featured')
    @ApiOperation({ summary: 'Get featured eco-histories for landing' })
    findFeatured() {
        return this.ecoHistoryService.findFeatured();
    }

    @Get('admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.OFFICIAL)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all histories for administration' })
    findAll() {
        return this.ecoHistoryService.findAll();
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.OFFICIAL)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Approve or reject a history' })
    updateStatus(@Param('id') id: string, @Body() updateDto: UpdateEcoHistoryStatusDto) {
        return this.ecoHistoryService.updateStatus(id, updateDto);
    }

    @Patch(':id/featured')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.OFFICIAL)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle featured status' })
    toggleFeatured(@Param('id') id: string) {
        return this.ecoHistoryService.toggleFeatured(id);
    }

    @Patch(':id/like')
    @ApiOperation({ summary: 'Increment or decrement likes' })
    toggleLike(@Param('id') id: string) {
        return this.ecoHistoryService.toggleLike(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a history (Admin only)' })
    remove(@Param('id') id: string) {
        return this.ecoHistoryService.remove(id);
    }
}
