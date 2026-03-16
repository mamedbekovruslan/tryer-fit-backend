import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Response as NestResponse,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response as ExpressResponse } from 'express';
import type { AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @NestResponse({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authService.login(loginDto);
    this.authService.setAuthCookie(response, result.access_token);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@NestResponse({ passthrough: true }) response: ExpressResponse) {
    this.authService.clearAuthCookie(response);
    return { success: true };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
