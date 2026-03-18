import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AccessControlService } from './access-control.service';
import { ClientController } from '../users/client.controller';
import { TrainerController } from '../users/trainer.controller';
import type { AuthenticatedRequest } from './auth.types';
import {
  createClientAccount,
  createTestApp,
  createTrainerAccount,
  destroyTestApp,
  type TestContext,
} from '../../test/support/test-app';

describe('Auth and Access integration', () => {
  let context: TestContext;
  let authController: AuthController;
  let accessControlService: AccessControlService;
  let clientController: ClientController;
  let trainerController: TrainerController;

  beforeEach(async () => {
    context = await createTestApp();
    authController = context.moduleRef.get(AuthController);
    accessControlService = context.moduleRef.get(AccessControlService);
    clientController = context.moduleRef.get(ClientController);
    trainerController = context.moduleRef.get(TrainerController);
  });

  afterEach(async () => {
    await destroyTestApp(context);
  });

  it('login returns cookie and user payload for client', async () => {
    const { payload, entity } = await createClientAccount(context);
    const response = createMockResponse();

    const result = await authController.login(
      {
        email: payload.email,
        password: payload.password,
      },
      response,
    );

    expect(result.access_token).toEqual(expect.any(String));
    expect(result.user).toMatchObject({
      id: entity.id,
      email: payload.email,
      username: payload.username,
      user_type: 'client',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'token',
      result.access_token,
      expect.objectContaining({
        httpOnly: true,
        path: '/',
      }),
    );
  });

  it('login returns cookie and user payload for trainer', async () => {
    const { payload, entity } = await createTrainerAccount(context);
    const response = createMockResponse();

    const result = await authController.login(
      {
        email: payload.email,
        password: payload.password,
      },
      response,
    );

    expect(result.access_token).toEqual(expect.any(String));
    expect(result.user).toMatchObject({
      id: entity.id,
      email: payload.email,
      username: payload.username,
      user_type: 'trainer',
    });
    expect(response.cookie).toHaveBeenCalledTimes(1);
  });

  it('login rejects invalid password', async () => {
    const { payload } = await createClientAccount(context);

    await expect(
      authController.login(
        {
          email: payload.email,
          password: 'wrong-password',
        },
        createMockResponse(),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logout clears auth cookie', () => {
    const response = createMockResponse();

    expect(authController.logout(response)).toEqual({ success: true });
    expect(response.clearCookie).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
      }),
    );
  });

  it('getProfile returns authenticated user', () => {
    const req = createRequest({
      sub: 99,
      userId: 99,
      email: 'trainer@test.dev',
      user_type: 'trainer',
    });

    expect(authController.getProfile(req)).toEqual(req.user);
  });

  it('client cannot access another client data', () => {
    expect(() =>
      accessControlService.assertOwnClient(
        {
          sub: 1,
          userId: 1,
          email: 'client_a@test.dev',
          user_type: 'client',
        },
        2,
      ),
    ).toThrow('Clients can only access their own data');
  });

  it('client cannot fetch another client profile by id', async () => {
    const firstClient = await createClientAccount(context, {
      email: 'fetch_client_a@test.dev',
      username: 'fetch_client_a',
    });
    const secondClient = await createClientAccount(context, {
      email: 'fetch_client_b@test.dev',
      username: 'fetch_client_b',
    });

    await expect(
      clientController.findOne(
        createRequest({
          sub: firstClient.entity.id,
          userId: firstClient.entity.id,
          email: firstClient.entity.email,
          user_type: 'client',
        }),
        String(secondClient.entity.id),
      ),
    ).rejects.toThrow('Clients can only access their own data');
  });

  it('trainer cannot update another trainer profile', async () => {
    const trainerA = await createTrainerAccount(context, {
      email: 'trainer_a@test.dev',
      username: 'trainer_a',
    });
    const trainerB = await createTrainerAccount(context, {
      email: 'trainer_b@test.dev',
      username: 'trainer_b',
    });

    await expect(
      trainerController.update(
        createRequest({
          sub: trainerA.entity.id,
          userId: trainerA.entity.id,
          email: trainerA.entity.email,
          user_type: 'trainer',
        }),
        String(trainerB.entity.id),
        { first_name: 'Hacked' },
      ),
    ).rejects.toThrow('Trainers can only update their own profile');
  });

  it('trainer can access only own clients', async () => {
    const trainerA = await createTrainerAccount(context, {
      email: 'owner@test.dev',
      username: 'owner',
    });
    const trainerB = await createTrainerAccount(context, {
      email: 'other@test.dev',
      username: 'other',
    });
    const client = await createClientAccount(context, {
      email: 'owned_client@test.dev',
      username: 'owned_client',
    });

    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainerA.entity.id,
        userId: trainerA.entity.id,
        email: trainerA.entity.email,
        user_type: 'trainer',
      }),
      String(trainerA.entity.id),
      String(client.entity.id),
    );

    const ownClients = await trainerController.getClients(
      createRequest({
        sub: trainerA.entity.id,
        userId: trainerA.entity.id,
        email: trainerA.entity.email,
        user_type: 'trainer',
      }),
      String(trainerA.entity.id),
    );
    expect(ownClients).toHaveLength(1);

    await expect(
      trainerController.getClients(
        createRequest({
          sub: trainerB.entity.id,
          userId: trainerB.entity.id,
          email: trainerB.entity.email,
          user_type: 'trainer',
        }),
        String(trainerA.entity.id),
      ),
    ).rejects.toThrow('Trainers can only access their own clients');
  });

  it('client cannot call trainer-only endpoints', async () => {
    const client = await createClientAccount(context);

    await expect(
      trainerController.findAll(
        createRequest({
          sub: client.entity.id,
          userId: client.entity.id,
          email: client.entity.email,
          user_type: 'client',
        }),
      ),
    ).rejects.toThrow('Only trainers can access trainers list');
  });

  it('trainer cannot call client-only endpoints', async () => {
    const trainer = await createTrainerAccount(context);

    await expect(
      clientController.updateProfile(
        createRequest({
          sub: trainer.entity.id,
          userId: trainer.entity.id,
          email: trainer.entity.email,
          user_type: 'trainer',
        }),
        { first_name: 'Nope' },
      ),
    ).rejects.toThrow('Only clients can update their profile');
  });
});

function createMockResponse() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as never;
}

function createRequest(
  user: AuthenticatedRequest['user'],
): AuthenticatedRequest {
  return { user } as AuthenticatedRequest;
}
