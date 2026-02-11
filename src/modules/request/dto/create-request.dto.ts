import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
// 👇 Asegúrate que la ruta '../schema/requests.schema' sea la correcta
import { MaterialType } from '../schema/requests.schema';

export class CreateRequestDto {

    @IsEnum(MaterialType, { message: 'El tipo de material no es válido' })
    type: string;

    @IsNumber()
    quantity: number;

    @IsString()
    unit: string;

    @IsObject()
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    };

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    description?: string;
}