import { IsString, IsNumber, IsNotEmpty, IsHexColor } from 'class-validator';

export class CreateLevelDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    levelNumber: number;

    @IsNumber()
    @IsNotEmpty()
    minPoints: number;

    @IsNumber()
    @IsNotEmpty()
    maxPoints: number;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    longDescription: string;

    @IsString()
    @IsNotEmpty()
    iconName: string;

    @IsString()
    @IsNotEmpty()
    // Valida que sea un color Hexadecimal real (#FFF o #FFFFFF)
    @IsHexColor()
    primaryColor: string;

    @IsString()
    @IsNotEmpty()
    @IsHexColor()
    bgColor: string;
}