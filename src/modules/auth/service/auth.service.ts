import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/service/users.service';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const users = await this.usersService.findAll();
        const user = users.find(u => u.email === email);
        if (user && user.passwordHash === pass) {
            const { passwordHash, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.passwordHash);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return {
            message: 'Login successful',
            user,
            // In a real app, return JWT access_token here
            access_token: 'mock_token_123456'
        };
    }

    async register(registerDto: RegisterDto) {
        return this.usersService.create(registerDto);
    }
}
