import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'Login successful.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @ApiOperation({ summary: 'User registration' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }
}