import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEcoHistoryDto {
    @ApiProperty({ example: 'Hoy reciclé 5 botellas de plástico!' })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty({ example: 'https://mi-foto.com/eco.jpg', required: false })
    @IsOptional()
    @IsString()
    photoUrl?: string;
}

export class UpdateEcoHistoryStatusDto {
    @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    @IsNotEmpty()
    status: string;
}
