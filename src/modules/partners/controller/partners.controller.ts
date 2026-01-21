
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PartnersService } from '../service/partners.service';
import { CreatePartnerDto } from '../dto/create-partner.dto';
import { UpdatePartnerDto } from '../dto/update-partner.dto';
import { Partner } from '../schema/partner.schema';

@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
    constructor(private readonly partnersService: PartnersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new partner' })
    @ApiResponse({ status: 201, description: 'The partner has been successfully created.', type: Partner })
    @ApiBody({ type: CreatePartnerDto })
    create(@Body() createPartnerDto: CreatePartnerDto) {
        return this.partnersService.create(createPartnerDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all partners' })
    @ApiResponse({ status: 200, description: 'List of all partners.', type: [Partner] })
    findAll() {
        return this.partnersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a partner by ID' })
    @ApiResponse({ status: 200, description: 'The partner found.', type: Partner })
    findOne(@Param('id') id: string) {
        return this.partnersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a partner' })
    @ApiResponse({ status: 200, description: 'The partner has been successfully updated.', type: Partner })
    @ApiBody({ type: UpdatePartnerDto })
    update(@Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
        return this.partnersService.update(id, updatePartnerDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a partner' })
    @ApiResponse({ status: 200, description: 'The partner has been successfully deleted.', type: Partner })
    remove(@Param('id') id: string) {
        return this.partnersService.remove(id);
    }
}
