import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: (process.env.DB_HOST as string) || 'localhost',
      port: parseInt(process.env.DB_PORT as string, 10) || 5432,
      username: (process.env.DB_USERNAME as string) || 'postgres',
      password: (process.env.DB_PASSWORD as string) || 'password',
      database: (process.env.DB_NAME as string) || 'tryerfit',
      entities: [User],
      synchronize: false, // Отключаем синхронизацию, чтобы не изменять существующую схему
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
