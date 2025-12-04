import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MaterialService } from '../service/material.service';
import { CreateMaterialDto, UpdateMaterialDto } from '../dto/material.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Material')
@Controller('material')
export class MaterialController {
    constructor(private readonly materialService: MaterialService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new material' })
    @ApiResponse({ status: 201, description: 'The material has been successfully created.' })
    create(@Body() createMaterialDto: CreateMaterialDto) {
        return this.materialService.create(createMaterialDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all materials' })
    findAll() {
        return this.materialService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a material by id' })
    findOne(@Param('id') id: string) {
        return this.materialService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a material' })
    update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDto) {
        return this.materialService.update(id, updateMaterialDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a material' })
    remove(@Param('id') id: string) {
        return this.materialService.remove(id);
    }
}
