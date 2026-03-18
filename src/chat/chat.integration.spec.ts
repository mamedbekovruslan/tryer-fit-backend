import { ChatController } from './chat.controller';
import { TrainerController } from '../users/trainer.controller';
import { SenderType } from './chat-message.entity';
import type { AuthenticatedRequest } from '../auth/auth.types';
import {
  createClientAccount,
  createTestApp,
  createTrainerAccount,
  destroyTestApp,
  type TestContext,
} from '../../test/support/test-app';

describe('Chat integration', () => {
  let context: TestContext;
  let chatController: ChatController;
  let trainerController: TrainerController;

  beforeEach(async () => {
    context = await createTestApp();
    chatController = context.moduleRef.get(ChatController);
    trainerController = context.moduleRef.get(TrainerController);
  });

  afterEach(async () => {
    await destroyTestApp(context);
  });

  it('client can send message only to assigned trainer', async () => {
    const trainerAllowed = await createTrainerAccount(context, {
      email: 'chat_trainer_allowed@test.dev',
      username: 'chat_trainer_allowed',
    });
    const trainerDenied = await createTrainerAccount(context, {
      email: 'chat_trainer_denied@test.dev',
      username: 'chat_trainer_denied',
    });
    const client = await createClientAccount(context, {
      email: 'chat_client@test.dev',
      username: 'chat_client',
    });

    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainerAllowed.entity.id,
        userId: trainerAllowed.entity.id,
        email: trainerAllowed.entity.email,
        user_type: 'trainer',
      }),
      String(trainerAllowed.entity.id),
      String(client.entity.id),
    );

    const allowedMessage = await chatController.sendMessage(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      {
        receiverId: trainerAllowed.entity.id,
        senderType: SenderType.CLIENT,
        message: 'hello coach',
      },
    );
    expect(allowedMessage).toMatchObject({
      receiverId: trainerAllowed.entity.id,
      senderId: client.entity.id,
      message: 'hello coach',
    });

    await expect(
      chatController.sendMessage(
        createRequest({
          sub: client.entity.id,
          userId: client.entity.id,
          email: client.entity.email,
          user_type: 'client',
        }),
        {
          receiverId: trainerDenied.entity.id,
          senderType: SenderType.CLIENT,
          message: 'hello stranger',
        },
      ),
    ).rejects.toThrow('Вы можете писать только своему закреплённому тренеру');
  });

  it('trainer can send message only to own client', async () => {
    const trainerAllowed = await createTrainerAccount(context, {
      email: 'owner_trainer@test.dev',
      username: 'owner_trainer',
    });
    const trainerDenied = await createTrainerAccount(context, {
      email: 'other_trainer@test.dev',
      username: 'other_trainer',
    });
    const client = await createClientAccount(context, {
      email: 'owned_client@test.dev',
      username: 'owned_client',
    });

    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainerAllowed.entity.id,
        userId: trainerAllowed.entity.id,
        email: trainerAllowed.entity.email,
        user_type: 'trainer',
      }),
      String(trainerAllowed.entity.id),
      String(client.entity.id),
    );

    const allowedMessage = await chatController.sendMessage(
      createRequest({
        sub: trainerAllowed.entity.id,
        userId: trainerAllowed.entity.id,
        email: trainerAllowed.entity.email,
        user_type: 'trainer',
      }),
      {
        receiverId: client.entity.id,
        senderType: SenderType.TRAINER,
        message: 'assigned hello',
      },
    );
    expect(allowedMessage).toMatchObject({
      receiverId: client.entity.id,
      senderId: trainerAllowed.entity.id,
      message: 'assigned hello',
    });

    await expect(
      chatController.sendMessage(
        createRequest({
          sub: trainerDenied.entity.id,
          userId: trainerDenied.entity.id,
          email: trainerDenied.entity.email,
          user_type: 'trainer',
        }),
        {
          receiverId: client.entity.id,
          senderType: SenderType.TRAINER,
          message: 'not allowed',
        },
      ),
    ).rejects.toThrow('Вы можете писать только своим клиентам');
  });

  it('conversation returns only dialog messages', async () => {
    const trainer = await createTrainerAccount(context, {
      email: 'dialog_trainer@test.dev',
      username: 'dialog_trainer',
    });
    const clientA = await createClientAccount(context, {
      email: 'dialog_client_a@test.dev',
      username: 'dialog_client_a',
    });
    const clientB = await createClientAccount(context, {
      email: 'dialog_client_b@test.dev',
      username: 'dialog_client_b',
    });

    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      String(trainer.entity.id),
      String(clientA.entity.id),
    );
    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      String(trainer.entity.id),
      String(clientB.entity.id),
    );

    await chatController.sendMessage(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      {
        receiverId: clientA.entity.id,
        senderType: SenderType.TRAINER,
        message: 'message A',
      },
    );
    await chatController.sendMessage(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      {
        receiverId: clientB.entity.id,
        senderType: SenderType.TRAINER,
        message: 'message B',
      },
    );

    const conversation = await chatController.getConversation(
      createRequest({
        sub: clientA.entity.id,
        userId: clientA.entity.id,
        email: clientA.entity.email,
        user_type: 'client',
      }),
      trainer.entity.id,
    );

    expect(conversation).toHaveLength(1);
    expect(conversation[0].message).toBe('message A');
  });

  it('client cannot read chat with trainer that is not assigned', async () => {
    const trainerAllowed = await createTrainerAccount(context, {
      email: 'read_allowed_trainer@test.dev',
      username: 'read_allowed_trainer',
    });
    const trainerDenied = await createTrainerAccount(context, {
      email: 'read_denied_trainer@test.dev',
      username: 'read_denied_trainer',
    });
    const client = await createClientAccount(context, {
      email: 'read_guard_client@test.dev',
      username: 'read_guard_client',
    });

    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainerAllowed.entity.id,
        userId: trainerAllowed.entity.id,
        email: trainerAllowed.entity.email,
        user_type: 'trainer',
      }),
      String(trainerAllowed.entity.id),
      String(client.entity.id),
    );

    await expect(
      chatController.getConversation(
        createRequest({
          sub: client.entity.id,
          userId: client.entity.id,
          email: client.entity.email,
          user_type: 'client',
        }),
        trainerDenied.entity.id,
      ),
    ).rejects.toThrow(
      'Clients can only access chat with their assigned trainer',
    );
  });

  it('trainer cannot read chat for client that is not assigned to them', async () => {
    const trainerAllowed = await createTrainerAccount(context, {
      email: 'owning_trainer@test.dev',
      username: 'owning_trainer',
    });
    const trainerDenied = await createTrainerAccount(context, {
      email: 'foreign_trainer@test.dev',
      username: 'foreign_trainer',
    });
    const client = await createClientAccount(context, {
      email: 'foreign_client@test.dev',
      username: 'foreign_client',
    });

    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainerAllowed.entity.id,
        userId: trainerAllowed.entity.id,
        email: trainerAllowed.entity.email,
        user_type: 'trainer',
      }),
      String(trainerAllowed.entity.id),
      String(client.entity.id),
    );

    await expect(
      chatController.getUnreadMessages(
        createRequest({
          sub: trainerDenied.entity.id,
          userId: trainerDenied.entity.id,
          email: trainerDenied.entity.email,
          user_type: 'trainer',
        }),
        client.entity.id,
      ),
    ).rejects.toThrow('Client is not assigned to this trainer');
  });

  it('mark as read updates unread state', async () => {
    const trainer = await createTrainerAccount(context, {
      email: 'read_trainer@test.dev',
      username: 'read_trainer',
    });
    const client = await createClientAccount(context, {
      email: 'read_client@test.dev',
      username: 'read_client',
    });

    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      String(trainer.entity.id),
      String(client.entity.id),
    );
    await chatController.sendMessage(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      {
        receiverId: client.entity.id,
        senderType: SenderType.TRAINER,
        message: 'unread message',
      },
    );

    const unreadBefore = await chatController.getUnreadMessages(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      trainer.entity.id,
    );
    expect(unreadBefore).toHaveLength(1);

    await chatController.markMessagesAsRead(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      trainer.entity.id,
    );

    const unreadAfter = await chatController.getUnreadMessages(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      trainer.entity.id,
    );
    expect(unreadAfter).toHaveLength(0);
  });

  it('get user chats returns last message and unread count', async () => {
    const trainer = await createTrainerAccount(context, {
      email: 'summary_trainer@test.dev',
      username: 'summary_trainer',
    });
    const client = await createClientAccount(context, {
      email: 'summary_client@test.dev',
      username: 'summary_client',
    });

    await trainerController.assignClientToTrainer(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      String(trainer.entity.id),
      String(client.entity.id),
    );
    await chatController.sendMessage(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      {
        receiverId: client.entity.id,
        senderType: SenderType.TRAINER,
        message: 'latest message',
      },
    );

    const chats = await chatController.getUserChats(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
    );

    expect(chats).toHaveLength(1);
    expect(chats[0]).toMatchObject({
      userId: trainer.entity.id,
      unreadCount: 1,
      lastMessage: {
        message: 'latest message',
      },
    });
  });
});

function createRequest(
  user: AuthenticatedRequest['user'],
): AuthenticatedRequest {
  return { user } as AuthenticatedRequest;
}
