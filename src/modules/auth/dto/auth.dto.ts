import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/users.dto';

export class LoginDto {
    @ApiProperty({ example: 'john@example.com', description: 'Email address' })
    email: string;

    @ApiProperty({ example: 'hashedpassword', description: 'Password' })
    password: string;
}

export class RegisterDto extends CreateUserDto { }