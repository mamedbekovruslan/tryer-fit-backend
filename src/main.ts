import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow requests from the frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',  // Next.js default development port
      'http://localhost:3001',  // In case frontend runs on same port as backend
      'http://localhost:8000',  // Common alternative ports
      'http://localhost:8080',
      process.env.FRONTEND_URL,  // Allow environment variable override
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  });

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
