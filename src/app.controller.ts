import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): { status: string; timestamp: Date } {
    return {
      status: 'OK',
      timestamp: new Date(),
    };
  }

  @Get('test')
  getTest(): { message: string } {
    return {
      message: 'Server is running correctly',
    };
  }
}
