import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class HomeController {
  @Get('home')
  @UseGuards(JwtAuthGuard)
  getHome() {
    return { message: 'Welcome to the home page!' };
  }
}
