
import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreatePartnerRequestDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsNotEmpty()
    @IsString()
    message: string;
}
