// src/modules/users/controller/users.controller.ts
import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Request, Req, Patch } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/users.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Register a new user (Standard)' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    // --- OJO: Estos endpoints deberían estar protegidos en el futuro ---
    // No quieres que cualquiera pueda ver todos los usuarios.
    // Más adelante le agregaremos @UseGuards(JwtAuthGuard)

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user profile' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data') // 👈 Le dice a Swagger que es subida de archivo
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary', // 👈 Esto hace que aparezca el botón "Seleccionar archivo"
                },
            },
        },
    })
    async uploadAvatar(
        @Req() req,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.usersService.updateAvatar(req.user.sub, file);
    }

    // ======================================================
    // 👇 2. ENDPOINT QUE TE FALTABA: ACTUALIZAR PERFIL (Texto)
    // ======================================================
    @UseGuards(AuthGuard('jwt'))
    @Patch('profile') // La ruta será: PATCH /users/profile
    @ApiOperation({ summary: 'Update user profile (Name & Phone)' })
    @ApiResponse({ status: 200, description: 'User profile updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateProfile(
        @Req() req,
        @Body() body: UpdateProfileDto // Recibimos nombre y cel
    ) {
        // req.user.sub viene del Token JWT
        return this.usersService.updateProfile(req.user.sub, body);
    }
}