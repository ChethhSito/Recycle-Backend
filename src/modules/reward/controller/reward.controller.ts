import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RewardsService } from '../service/reward.service';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { UpdateRewardDto } from '../dto/update-reward.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RewardCategory } from '../enum/reward-category.enum';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
    constructor(private readonly rewardsService: RewardsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un premio' })
    create(@Body() createRewardDto: CreateRewardDto) {
        return this.rewardsService.create(createRewardDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar premios (filtro opcional por categoría)' })
    @ApiQuery({ name: 'category', enum: RewardCategory, required: false })
    findAll(@Query('category') category?: RewardCategory) {
        return this.rewardsService.findAll(category);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un premio por ID' })
    findOne(@Param('id') id: string) {
        return this.rewardsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar premio' })
    update(@Param('id') id: string, @Body() updateRewardDto: UpdateRewardDto) {
        return this.rewardsService.update(id, updateRewardDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar premio (Soft Delete)' })
    remove(@Param('id') id: string) {
        return this.rewardsService.remove(id);
    }
}