import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserRole } from '../enum/userRole.enum';

export class CreateUserDto {
    @ApiProperty({ example: '12345678', description: 'DNI of the user' })
    dni: string;

    @ApiProperty({ example: 'John', description: 'First name' })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name' })
    lastName: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email address' })
    email: string;

    @ApiProperty({ example: 'hashedpassword', description: 'Password hash' })
    passwordHash: string;

    @ApiProperty({ example: '987654321', description: 'Phone number', required: false })
    phone?: string;

    @ApiProperty({ enum: UserRole, default: UserRole.CITIZEN, description: 'User role' })
    role: UserRole;

    @ApiProperty({ example: '2000-01-01', description: 'Birth date', required: false })
    birthDate?: Date;

    @ApiProperty({ example: 'Av. Principal 123', description: 'Address', required: false })
    addressText?: string;

    @ApiProperty({ example: 'Lima', description: 'District', required: false })
    district?: string;

    @ApiProperty({ example: 'Lima', description: 'Province', required: false })
    province?: string;

    @ApiProperty({ example: 'Lima', description: 'Department', required: false })
    department?: string;

    @ApiProperty({ description: 'GeoJSON location', required: false })
    location?: { type: string; coordinates: number[] };
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }