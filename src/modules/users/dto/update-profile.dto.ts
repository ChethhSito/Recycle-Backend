import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Juan Pérez',
        required: false
    })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({
        description: 'Número de celular',
        example: '999888777',
        required: false
    })
    @IsOptional()
    @IsString()
    phone?: string;
}