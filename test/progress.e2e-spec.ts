import request from 'supertest';
import { createTestApp, destroyTestApp, loginAgent, registerClient, registerTrainer, type TestContext } from './support/test-app';

describe('Progress Reports (e2e)', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestApp();
  });

  afterEach(async () => {
    await destroyTestApp(context);
  });

  it('client creates progress report for self', async () => {
    const client = await registerClient(context.app);
    const { agent } = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });

    const response = await agent
      .post('/progress-reports')
      .send({
        date: new Date().toISOString(),
        weight: 77.5,
        waist: 81,
        notes: 'week 1',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      weight: 77.5,
      waist: 81,
      notes: 'week 1',
      client: { id: client.body.id },
    });
  });

  it('client cannot create progress report for another client', async () => {
    const clientA = await registerClient(context.app, {
      email: 'progress_a@test.dev',
      username: 'progress_a',
    });
    const clientB = await registerClient(context.app, {
      email: 'progress_b@test.dev',
      username: 'progress_b',
    });
    const { agent } = await loginAgent(context.app, {
      email: clientA.payload.email as string,
      password: clientA.payload.password as string,
    });

    await agent
      .post('/progress-reports')
      .send({
        clientId: clientB.body.id,
        date: new Date().toISOString(),
        weight: 90,
      })
      .expect(403);
  });

  it('creating report updates client current metrics', async () => {
    const client = await registerClient(context.app, {
      email: 'metrics@test.dev',
      username: 'metrics_client',
    });
    const { agent } = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });

    await agent
      .post('/progress-reports')
      .send({
        date: new Date().toISOString(),
        weight: 65.4,
        bodyFat: 21.1,
        muscleMass: 30.2,
      })
      .expect(201);

    const updatedClient = await context.clientRepository.findOneByOrFail({
      id: client.body.id,
    });

    expect(Number(updatedClient.weight)).toBeCloseTo(65.4);
    expect(Number(updatedClient.body_fat)).toBeCloseTo(21.1);
    expect(Number(updatedClient.muscle_mass)).toBeCloseTo(30.2);
  });

  it('trainer can fetch reports only for own client', async () => {
    const trainerA = await registerTrainer(context.app, {
      email: 'progress_trainer_a@test.dev',
      username: 'progress_trainer_a',
    });
    const trainerB = await registerTrainer(context.app, {
      email: 'progress_trainer_b@test.dev',
      username: 'progress_trainer_b',
    });
    const client = await registerClient(context.app, {
      email: 'progress_owned_client@test.dev',
      username: 'progress_owned_client',
    });

    const trainerAAuth = await loginAgent(context.app, {
      email: trainerA.payload.email as string,
      password: trainerA.payload.password as string,
    });
    await trainerAAuth.agent
      .put(`/trainers/${trainerA.body.id}/assign-client/${client.body.id}`)
      .expect(200);

    const clientAuth = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });
    await clientAuth.agent
      .post('/progress-reports')
      .send({
        date: new Date().toISOString(),
        weight: 80,
      })
      .expect(201);

    await trainerAAuth.agent
      .get(`/progress-reports/client/${client.body.id}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
      });

    const trainerBAuth = await loginAgent(context.app, {
      email: trainerB.payload.email as string,
      password: trainerB.payload.password as string,
    });
    await trainerBAuth.agent
      .get(`/progress-reports/client/${client.body.id}`)
      .expect(403);
  });

  it('trainer can add comment to own client report', async () => {
    const trainer = await registerTrainer(context.app, {
      email: 'comment_trainer@test.dev',
      username: 'comment_trainer',
    });
    const client = await registerClient(context.app, {
      email: 'comment_client@test.dev',
      username: 'comment_client',
    });

    const trainerAuth = await loginAgent(context.app, {
      email: trainer.payload.email as string,
      password: trainer.payload.password as string,
    });
    await trainerAuth.agent
      .put(`/trainers/${trainer.body.id}/assign-client/${client.body.id}`)
      .expect(200);

    const clientAuth = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });
    const reportResponse = await clientAuth.agent
      .post('/progress-reports')
      .send({
        date: new Date().toISOString(),
        weight: 72,
      })
      .expect(201);

    const commentResponse = await trainerAuth.agent
      .post(`/progress-reports/${reportResponse.body.id}/comments`)
      .send({ comment: 'Хорошая динамика' })
      .expect(201);

    expect(commentResponse.body).toMatchObject({
      comment: 'Хорошая динамика',
      trainer: { id: trainer.body.id },
    });
  });

  it('client cannot add comment', async () => {
    const client = await registerClient(context.app, {
      email: 'cannot_comment@test.dev',
      username: 'cannot_comment',
    });
    const { agent } = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });
    const reportResponse = await agent
      .post('/progress-reports')
      .send({
        date: new Date().toISOString(),
        weight: 72,
      })
      .expect(201);

    await agent
      .post(`/progress-reports/${reportResponse.body.id}/comments`)
      .send({ comment: 'Self review' })
      .expect(403);
  });

  it('deleting report removes it from client history', async () => {
    const client = await registerClient(context.app, {
      email: 'delete_report@test.dev',
      username: 'delete_report',
    });
    const { agent } = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });

    const reportResponse = await agent
      .post('/progress-reports')
      .send({
        date: new Date().toISOString(),
        weight: 73,
      })
      .expect(201);

    await agent.delete(`/progress-reports/${reportResponse.body.id}`).expect(200);

    const listResponse = await agent.get('/progress-reports').expect(200);
    expect(listResponse.body).toHaveLength(0);
  });
});

