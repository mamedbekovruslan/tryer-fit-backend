import request from 'supertest';
import {
  createTestApp,
  destroyTestApp,
  getHttpApp,
  loginAgent,
  registerClient,
  registerTrainer,
  type TestContext,
} from './support/test-app';

describe('Auth and Access (e2e)', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestApp();
  });

  afterEach(async () => {
    await destroyTestApp(context);
  });

  it('POST /auth/login returns cookie and user payload for client', async () => {
    const { payload } = await registerClient(context.app);

    const response = await request(getHttpApp(context.app))
      .post('/auth/login')
      .send({ email: payload.email, password: payload.password })
      .expect(200);

    expect(response.body.access_token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: payload.email,
      username: payload.username,
      user_type: 'client',
    });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=')]),
    );
  });

  it('POST /auth/login returns cookie and user payload for trainer', async () => {
    const { payload } = await registerTrainer(context.app);

    const response = await request(getHttpApp(context.app))
      .post('/auth/login')
      .send({ email: payload.email, password: payload.password })
      .expect(200);

    expect(response.body.access_token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: payload.email,
      username: payload.username,
      user_type: 'trainer',
    });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=')]),
    );
  });

  it('POST /auth/login rejects invalid password', async () => {
    const { payload } = await registerClient(context.app);

    await request(getHttpApp(context.app))
      .post('/auth/login')
      .send({ email: payload.email, password: 'wrong-password' })
      .expect(401);
  });

  it('POST /auth/login is rate limited after repeated failures', async () => {
    const { payload } = await registerClient(context.app, {
      username: 'throttled_client',
      email: 'throttled_client@test.dev',
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(getHttpApp(context.app))
        .post('/auth/login')
        .send({ email: payload.email, password: 'wrong-password' })
        .expect(401);
    }

    await request(getHttpApp(context.app))
      .post('/auth/login')
      .send({ email: payload.email, password: 'wrong-password' })
      .expect(429);
  });

  it('POST /auth/logout clears auth cookie', async () => {
    const { payload } = await registerClient(context.app);
    const { agent } = await loginAgent(context.app, {
      email: payload.email,
      password: payload.password,
    });

    const response = await agent.post('/auth/logout').expect(200);

    expect(response.body).toEqual({ success: true });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=;')]),
    );
  });

  it('GET /auth/profile requires auth', async () => {
    await request(getHttpApp(context.app)).get('/auth/profile').expect(401);
  });

  it('GET /auth/profile returns authenticated user', async () => {
    const { payload } = await registerTrainer(context.app);
    const { agent } = await loginAgent(context.app, {
      email: payload.email,
      password: payload.password,
    });

    const response = await agent.get('/auth/profile').expect(200);

    expect(response.body).toMatchObject({
      email: payload.email,
      user_type: 'trainer',
      sub: expect.any(Number),
    });
  });

  it('client cannot access another client data', async () => {
    const firstClient = await registerClient(context.app, {
      username: 'client_a',
      email: 'client_a@test.dev',
    });
    const secondClient = await registerClient(context.app, {
      username: 'client_b',
      email: 'client_b@test.dev',
    });

    const { agent } = await loginAgent(context.app, {
      email: firstClient.payload.email as string,
      password: firstClient.payload.password as string,
    });

    await agent
      .post('/progress-reports')
      .send({
        clientId: secondClient.body.id,
        date: new Date().toISOString(),
        weight: 80,
      })
      .expect(403);
  });

  it('trainer cannot update another trainer profile', async () => {
    const trainerA = await registerTrainer(context.app, {
      username: 'trainer_a',
      email: 'trainer_a@test.dev',
    });
    const trainerB = await registerTrainer(context.app, {
      username: 'trainer_b',
      email: 'trainer_b@test.dev',
    });

    const { agent } = await loginAgent(context.app, {
      email: trainerA.payload.email as string,
      password: trainerA.payload.password as string,
    });

    await agent
      .put(`/trainers/${trainerB.body.id}`)
      .send({ first_name: 'Hacked' })
      .expect(403);
  });

  it('trainer can access only own clients', async () => {
    const trainerA = await registerTrainer(context.app, {
      username: 'trainer_owner',
      email: 'trainer_owner@test.dev',
    });
    const trainerB = await registerTrainer(context.app, {
      username: 'trainer_other',
      email: 'trainer_other@test.dev',
    });
    const client = await registerClient(context.app, {
      username: 'assigned_client',
      email: 'assigned_client@test.dev',
    });

    const trainerAAuth = await loginAgent(context.app, {
      email: trainerA.payload.email as string,
      password: trainerA.payload.password as string,
    });

    await trainerAAuth.agent
      .put(`/trainers/${trainerA.body.id}/assign-client/${client.body.id}`)
      .expect(200);

    const trainerBAuth = await loginAgent(context.app, {
      email: trainerB.payload.email as string,
      password: trainerB.payload.password as string,
    });

    await trainerBAuth.agent
      .get(`/trainers/${trainerA.body.id}/clients`)
      .expect(403);
  });

  it('client cannot call trainer-only endpoints', async () => {
    const client = await registerClient(context.app);
    const { agent } = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });

    await agent.get('/trainers').expect(403);
  });

  it('trainer cannot call client-only endpoints', async () => {
    const trainer = await registerTrainer(context.app);
    const { agent } = await loginAgent(context.app, {
      email: trainer.payload.email as string,
      password: trainer.payload.password as string,
    });

    await agent.put('/clients/profile').send({ first_name: 'Nope' }).expect(403);
  });
});
