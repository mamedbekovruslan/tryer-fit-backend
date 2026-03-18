import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, type DataSourceOptions } from 'typeorm';
import { newDb } from 'pg-mem';
import request, { type SuperAgentTest } from 'supertest';
import type { Express } from 'express';
import { JwtModule } from '@nestjs/jwt';
import { appEntities } from '../../src/data-source';
import { AuthModule } from '../../src/auth/auth.module';
import { ClientModule } from '../../src/users/client.module';
import { TrainerModule } from '../../src/users/trainer.module';
import { ProgressReportModule } from '../../src/progress/progress-report.module';
import { ChatModule } from '../../src/chat/chat.module';
import { AccessControlModule } from '../../src/auth/access-control.module';
import { TrainerNutritionModule } from '../../src/nutrition/trainer-nutrition.module';
import { ClientNutritionPlanModule } from '../../src/nutrition/client-nutrition-plan.module';
import { TrainerWorkoutModule } from '../../src/workout/trainer-workout.module';
import { Client } from '../../src/users/client.entity';
import { Trainer } from '../../src/users/trainer.entity';
import {
  ClientService,
  type CreateClientDto,
} from '../../src/users/client.service';
import {
  TrainerService,
  type CreateTrainerDto,
} from '../../src/users/trainer.service';
import { AuthService } from '../../src/auth/auth.service';

const JWT_SECRET = 'test_secret_key';

async function createPgMemDataSource(): Promise<DataSource> {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'tryer_fit_test',
  });
  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 15.0',
  });

  const dataSource = (await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: appEntities,
    synchronize: true,
    logging: false,
  } as DataSourceOptions)) as DataSource;

  await dataSource.initialize();
  return dataSource;
}

export interface TestContext {
  app: INestApplication;
  moduleRef: TestingModule;
  dataSource: DataSource;
  clientRepository: Repository<Client>;
  trainerRepository: Repository<Trainer>;
  clientService: ClientService;
  trainerService: TrainerService;
  authService: AuthService;
}

export async function createTestApp(
  _unusedOptions: { withSocketServer?: boolean } = {},
): Promise<TestContext> {
  void _unusedOptions;
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.JWT_EXPIRES_IN = '3600';
  process.env.NODE_ENV = 'test';

  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRootAsync({
        useFactory: () => ({
          type: 'postgres',
          entities: appEntities,
          synchronize: true,
          logging: false,
        }),
        dataSourceFactory: async () => createPgMemDataSource(),
      }),
      JwtModule.register({
        secret: JWT_SECRET,
        signOptions: { expiresIn: 3600 },
      }),
      AccessControlModule,
      ClientModule,
      TrainerModule,
      AuthModule,
      ProgressReportModule,
      ChatModule,
      TrainerNutritionModule,
      ClientNutritionPlanModule,
      TrainerWorkoutModule,
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  await app.init();

  return {
    app,
    moduleRef,
    dataSource: moduleRef.get(DataSource),
    clientRepository: moduleRef.get(getRepositoryToken(Client)),
    trainerRepository: moduleRef.get(getRepositoryToken(Trainer)),
    clientService: moduleRef.get(ClientService),
    trainerService: moduleRef.get(TrainerService),
    authService: moduleRef.get(AuthService),
  };
}

export async function destroyTestApp(context: TestContext): Promise<void> {
  if (!context) {
    return;
  }

  if (context.app) {
    await context.app.close();
  }

  if (context.dataSource?.isInitialized) {
    await context.dataSource.destroy();
  }
}

export function getHttpApp(app: INestApplication): Express {
  return app.getHttpAdapter().getInstance() as Express;
}

export function createAgent(app: INestApplication): SuperAgentTest {
  return request.agent(getHttpApp(app));
}

export async function registerClient(
  app: INestApplication,
  overrides: Partial<CreateClientDto> = {},
) {
  const payload: CreateClientDto = {
    username: `client_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
    email: `client_${Date.now()}_${Math.random().toString(16).slice(2, 6)}@test.dev`,
    password: 'password123',
    first_name: 'Client',
    last_name: 'User',
    ...overrides,
  };

  const response = await request(getHttpApp(app))
    .post('/clients/register')
    .send(payload)
    .expect(201);
  const body = response.body as { id: number };

  return { payload, body };
}

export async function registerTrainer(
  app: INestApplication,
  overrides: Partial<CreateTrainerDto> = {},
) {
  const payload: CreateTrainerDto = {
    username: `trainer_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
    email: `trainer_${Date.now()}_${Math.random().toString(16).slice(2, 6)}@test.dev`,
    password: 'password123',
    first_name: 'Trainer',
    last_name: 'User',
    ...overrides,
  };

  const response = await request(getHttpApp(app))
    .post('/trainers/register')
    .send(payload)
    .expect(201);
  const body = response.body as { id: number };

  return { payload, body };
}

export async function loginAgent(
  app: INestApplication,
  credentials: { email: string; password: string },
) {
  const agent = createAgent(app);
  const response = await agent
    .post('/auth/login')
    .send(credentials)
    .expect(200);
  const body = response.body as { access_token: string; user: unknown };

  return {
    agent,
    response,
    accessToken: body.access_token,
    user: body.user,
  };
}

export async function createClientAccount(
  context: TestContext,
  overrides: Partial<CreateClientDto> = {},
) {
  const payload: CreateClientDto = {
    username: `client_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
    email: `client_${Date.now()}_${Math.random().toString(16).slice(2, 6)}@test.dev`,
    password: 'password123',
    first_name: 'Client',
    last_name: 'User',
    ...overrides,
  };

  const client = await context.clientService.create(payload);
  return { payload, entity: client };
}

export async function createTrainerAccount(
  context: TestContext,
  overrides: Partial<CreateTrainerDto> = {},
) {
  const payload: CreateTrainerDto = {
    username: `trainer_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
    email: `trainer_${Date.now()}_${Math.random().toString(16).slice(2, 6)}@test.dev`,
    password: 'password123',
    first_name: 'Trainer',
    last_name: 'User',
    ...overrides,
  };

  const trainer = await context.trainerService.create(payload);
  return { payload, entity: trainer };
}
