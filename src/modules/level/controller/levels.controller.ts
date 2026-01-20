import { Controller, Get } from '@nestjs/common';
import { LevelsService } from '../service/levels.service';

@Controller('levels')
export class LevelsController {
    constructor(private readonly levelsService: LevelsService) { }

    // Ruta: GET /levels
    @Get()
    async findAll() {
        return this.levelsService.findAll();
    }
}