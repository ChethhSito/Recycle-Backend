import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginUserDto {
    @ApiProperty({ example: 'juan@gmail.com', description: 'Email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password', description: 'Password' })
    @IsString()
    @MinLength(6)
    password: string;
}