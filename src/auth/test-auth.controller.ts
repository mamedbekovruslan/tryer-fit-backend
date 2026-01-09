import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

interface LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class TestAuthController {
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // Временный ответ для тестирования
    return {
      access_token: 'test_token',
      user: {
        id: 1,
        email: loginDto.email,
        username: 'test_user',
        user_type: 'client' as const,
      },
    };
  }
}