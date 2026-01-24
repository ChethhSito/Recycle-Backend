import {
    IsString,
    IsEnum,
    IsNumber,
    IsNotEmpty,
    IsOptional,
    Min,
    IsBoolean,
    IsDateString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RewardCategory, PartnerType } from '../enum/reward-category.enum';

export class CreateRewardDto {
    @ApiProperty({ example: 'Botella de Agua Reutilizable', description: 'Nombre del premio' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Botella térmica de 500ml...', description: 'Descripción' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'https://cloudinary.com/...', description: 'URL imagen', required: false })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({ example: 250, description: 'Puntos necesarios' })
    @IsNumber()
    @Min(0)
    points: number;

    @ApiProperty({ enum: RewardCategory, example: RewardCategory.PRODUCTS })
    @IsEnum(RewardCategory)
    category: RewardCategory;

    @ApiProperty({ example: 15, description: 'Stock disponible' })
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ example: 'EcoLife Store', description: 'Patrocinador' })
    @IsString()
    @IsNotEmpty()
    sponsor: string;

    @ApiProperty({ example: '2025-12-31', description: 'Fecha de vencimiento (ISO)' })
    @IsDateString() // Valida que sea fecha válida
    expiryDate: Date;

    @ApiProperty({ example: 'Válido solo una vez...', description: 'Términos y condiciones' })
    @IsString()
    @IsNotEmpty()
    terms: string;

    @ApiProperty({ example: false, description: 'Es convenio corporativo?', required: false })
    @IsBoolean()
    @IsOptional()
    isPartner?: boolean;

    @ApiProperty({ example: 'Yape', description: 'Nombre del Partner', required: false })
    @IsString()
    @IsOptional()
    partnerName?: string;

    @ApiProperty({ enum: PartnerType, example: PartnerType.YAPE, required: false })
    @IsEnum(PartnerType)
    @IsOptional()
    partnerType?: PartnerType;
}