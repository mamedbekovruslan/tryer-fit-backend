import { createTestApp, destroyTestApp, loginAgent, registerClient, registerTrainer, type TestContext } from './support/test-app';

describe('Chat (e2e)', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestApp();
  });

  afterEach(async () => {
    await destroyTestApp(context);
  });

  it('client can send message only to assigned trainer', async () => {
    const trainerAllowed = await registerTrainer(context.app, {
      email: 'chat_trainer_allowed@test.dev',
      username: 'chat_trainer_allowed',
    });
    const trainerDenied = await registerTrainer(context.app, {
      email: 'chat_trainer_denied@test.dev',
      username: 'chat_trainer_denied',
    });
    const client = await registerClient(context.app, {
      email: 'chat_client@test.dev',
      username: 'chat_client',
    });

    const trainerAuth = await loginAgent(context.app, {
      email: trainerAllowed.payload.email as string,
      password: trainerAllowed.payload.password as string,
    });
    await trainerAuth.agent
      .put(`/trainers/${trainerAllowed.body.id}/assign-client/${client.body.id}`)
      .expect(200);

    const clientAuth = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });

    await clientAuth.agent
      .post('/chat/messages')
      .send({
        receiverId: trainerAllowed.body.id,
        senderType: 'client',
        message: 'hello coach',
      })
      .expect(201);

    await clientAuth.agent
      .post('/chat/messages')
      .send({
        receiverId: trainerDenied.body.id,
        senderType: 'client',
        message: 'hello stranger',
      })
      .expect(403);
  });

  it('trainer can send message only to own client', async () => {
    const trainerAllowed = await registerTrainer(context.app, {
      email: 'owner_trainer@test.dev',
      username: 'owner_trainer',
    });
    const trainerDenied = await registerTrainer(context.app, {
      email: 'other_trainer@test.dev',
      username: 'other_trainer',
    });
    const client = await registerClient(context.app, {
      email: 'owned_client@test.dev',
      username: 'owned_client',
    });

    const trainerAllowedAuth = await loginAgent(context.app, {
      email: trainerAllowed.payload.email as string,
      password: trainerAllowed.payload.password as string,
    });
    await trainerAllowedAuth.agent
      .put(`/trainers/${trainerAllowed.body.id}/assign-client/${client.body.id}`)
      .expect(200);

    await trainerAllowedAuth.agent
      .post('/chat/messages')
      .send({
        receiverId: client.body.id,
        senderType: 'trainer',
        message: 'assigned hello',
      })
      .expect(201);

    const trainerDeniedAuth = await loginAgent(context.app, {
      email: trainerDenied.payload.email as string,
      password: trainerDenied.payload.password as string,
    });
    await trainerDeniedAuth.agent
      .post('/chat/messages')
      .send({
        receiverId: client.body.id,
        senderType: 'trainer',
        message: 'not allowed',
      })
      .expect(403);
  });

  it('conversation returns only dialog messages', async () => {
    const trainer = await registerTrainer(context.app, {
      email: 'dialog_trainer@test.dev',
      username: 'dialog_trainer',
    });
    const clientA = await registerClient(context.app, {
      email: 'dialog_client_a@test.dev',
      username: 'dialog_client_a',
    });
    const clientB = await registerClient(context.app, {
      email: 'dialog_client_b@test.dev',
      username: 'dialog_client_b',
    });

    const trainerAuth = await loginAgent(context.app, {
      email: trainer.payload.email as string,
      password: trainer.payload.password as string,
    });
    await trainerAuth.agent
      .put(`/trainers/${trainer.body.id}/assign-client/${clientA.body.id}`)
      .expect(200);
    await trainerAuth.agent
      .put(`/trainers/${trainer.body.id}/assign-client/${clientB.body.id}`)
      .expect(200);

    await trainerAuth.agent
      .post('/chat/messages')
      .send({
        receiverId: clientA.body.id,
        senderType: 'trainer',
        message: 'message A',
      })
      .expect(201);
    await trainerAuth.agent
      .post('/chat/messages')
      .send({
        receiverId: clientB.body.id,
        senderType: 'trainer',
        message: 'message B',
      })
      .expect(201);

    const clientAAuth = await loginAgent(context.app, {
      email: clientA.payload.email as string,
      password: clientA.payload.password as string,
    });
    const response = await clientAAuth.agent
      .get(`/chat/messages/${trainer.body.id}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].message).toBe('message A');
  });

  it('mark as read updates unread state', async () => {
    const trainer = await registerTrainer(context.app, {
      email: 'read_trainer@test.dev',
      username: 'read_trainer',
    });
    const client = await registerClient(context.app, {
      email: 'read_client@test.dev',
      username: 'read_client',
    });

    const trainerAuth = await loginAgent(context.app, {
      email: trainer.payload.email as string,
      password: trainer.payload.password as string,
    });
    await trainerAuth.agent
      .put(`/trainers/${trainer.body.id}/assign-client/${client.body.id}`)
      .expect(200);
    await trainerAuth.agent
      .post('/chat/messages')
      .send({
        receiverId: client.body.id,
        senderType: 'trainer',
        message: 'unread message',
      })
      .expect(201);

    const clientAuth = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });

    await clientAuth.agent
      .get(`/chat/messages/unread/${trainer.body.id}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
      });

    await clientAuth.agent
      .patch(`/chat/messages/${trainer.body.id}/read`)
      .expect(200);

    await clientAuth.agent
      .get(`/chat/messages/unread/${trainer.body.id}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(0);
      });
  });

  it('get user chats returns last message and unread count', async () => {
    const trainer = await registerTrainer(context.app, {
      email: 'summary_trainer@test.dev',
      username: 'summary_trainer',
    });
    const client = await registerClient(context.app, {
      email: 'summary_client@test.dev',
      username: 'summary_client',
    });

    const trainerAuth = await loginAgent(context.app, {
      email: trainer.payload.email as string,
      password: trainer.payload.password as string,
    });
    await trainerAuth.agent
      .put(`/trainers/${trainer.body.id}/assign-client/${client.body.id}`)
      .expect(200);
    await trainerAuth.agent
      .post('/chat/messages')
      .send({
        receiverId: client.body.id,
        senderType: 'trainer',
        message: 'latest message',
      })
      .expect(201);

    const clientAuth = await loginAgent(context.app, {
      email: client.payload.email as string,
      password: client.payload.password as string,
    });
    const response = await clientAuth.agent.get('/chat/chats').expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      userId: trainer.body.id,
      unreadCount: 1,
      lastMessage: {
        message: 'latest message',
      },
    });
  });
});
