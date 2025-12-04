import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { RecyclingService } from '../service/recycling.service';
import { CreateRecyclingDto, UpdateRecyclingDto } from '../dto/recycling.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Recycling')
@Controller('recycling')
export class RecyclingController {
    constructor(private readonly recyclingService: RecyclingService) { }

    @Post()
    @ApiOperation({ summary: 'Create a recycling transaction' })
    @ApiResponse({ status: 201, description: 'The transaction has been successfully created.' })
    create(@Body() createRecyclingDto: CreateRecyclingDto) {
        return this.recyclingService.create(createRecyclingDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all recycling transactions' })
    findAll() {
        return this.recyclingService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a transaction by id' })
    findOne(@Param('id') id: string) {
        return this.recyclingService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a transaction' })
    update(@Param('id') id: string, @Body() updateRecyclingDto: UpdateRecyclingDto) {
        return this.recyclingService.update(id, updateRecyclingDto);
    }
}