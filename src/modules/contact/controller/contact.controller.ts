import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from '../service/contact.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enum/userRole.enum';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post()
    @ApiOperation({ summary: 'Submit a new contact form' })
    create(@Body() createContactDto: CreateContactDto) {
        return this.contactService.create(createContactDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all contact requests (Admin/Manager)' })
    findAll() {
        return this.contactService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a single contact request' })
    findOne(@Param('id') id: string) {
        return this.contactService.findOne(id);
    }

    @Patch(':id/read')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark a contact request as read' })
    markAsRead(@Param('id') id: string) {
        return this.contactService.markAsRead(id);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a contact request (Admin only)' })
    remove(@Param('id') id: string) {
        return this.contactService.delete(id);
    }
}
