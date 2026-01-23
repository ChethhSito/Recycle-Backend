import { Controller, Get, Param, Post, Body, Patch, Delete } from "@nestjs/common";
import { ProgramsService } from "../service/program.service";
import { CreateProgramDto } from "../dto/create-program.dto";
import { UpdateProgramDto } from "../dto/update-program.dto";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProgramType } from "../enum/progra-type.enum";
import { Program } from "../schema/program.schema";

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) { }

    // Ruta: GET /programs
    @Get()
    @ApiOperation({ summary: 'Listar todos los programas' })
    async findAll() {
        return this.programsService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo programa ambiental' })
    @ApiBody({ type: CreateProgramDto })
    @ApiResponse({ status: 201, description: 'Programa creado exitosamente', type: Program })
    async create(@Body() createProgramDto: CreateProgramDto) {
        return this.programsService.create(createProgramDto);
    }
    // Ruta: GET /programs/:programType
    @Get(':programType')
    @ApiOperation({ summary: 'Listar todos los programas por tipo' })
    @ApiParam({ name: 'programType', description: 'Tipo de programa' })
    async findAllProgramType(@Param('programType') programType: ProgramType) {
        return this.programsService.findAllProgramType(programType);
    }
    // Ruta: PATCH /programs/:id
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un programa' })
    @ApiParam({ name: 'id', description: 'ID del programa' })
    @ApiBody({ type: UpdateProgramDto })
    async update(@Param('id') id: string, @Body() program: UpdateProgramDto) {
        return this.programsService.update(id, program);
    }
    // Ruta: DELETE /programs/:id
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un programa' })
    @ApiParam({ name: 'id', description: 'ID del programa' })
    async delete(@Param('id') id: string) {
        return this.programsService.remove(id);
    }
    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de un programa' })
    findOne(@Param('id') id: string) {
        return this.programsService.findOne(id);
    }
}

