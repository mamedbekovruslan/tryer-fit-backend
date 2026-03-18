import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { SenderType } from './chat-message.entity';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let jwtService: jest.Mocked<JwtService>;
  let chatService: jest.Mocked<ChatService>;
  let sendMessageMock: jest.Mock;
  let toRoom: jest.Mock;
  let emitToRoom: jest.Mock;
  let server: Pick<Server, 'to'>;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    sendMessageMock = jest.fn();
    chatService = {
      sendMessage: sendMessageMock,
      markMessagesAsRead: jest.fn(),
    } as unknown as jest.Mocked<ChatService>;

    toRoom = jest.fn();
    emitToRoom = jest.fn();
    server = {
      to: toRoom.mockReturnValue({
        emit: emitToRoom,
      }),
    };

    gateway = new ChatGateway(jwtService, chatService);
    (gateway as unknown as { server: Pick<Server, 'to'> }).server = server;
  });

  it('websocket connection rejects invalid token', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const { socket, disconnect, emit } = createMockSocket({
      auth: { token: 'invalid-token' },
    });

    gateway.handleConnection(socket);

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(emit).not.toHaveBeenCalledWith('connected', expect.anything());
  });

  it('websocket sendMessage emits receiveMessage to receiver', async () => {
    const { socket: trainerSocket, emit } = createMockSocket({
      id: 'trainer-socket',
      data: { userId: 10, userType: 'trainer' },
    });
    const clientSocketId = 'client-socket';

    gateway['connectedClients'].set(20, clientSocketId);
    sendMessageMock.mockResolvedValue({
      id: 99,
      senderId: 10,
      receiverId: 20,
      senderType: SenderType.TRAINER,
      message: 'ws hello',
      isRead: false,
      createdAt: new Date('2026-03-18T10:00:00.000Z'),
    } as never);

    const result = await gateway.handleSendMessage(trainerSocket, {
      receiverId: 20,
      senderType: SenderType.TRAINER,
      message: 'ws hello',
    });

    expect(sendMessageMock).toHaveBeenCalledWith(10, {
      receiverId: 20,
      senderType: SenderType.TRAINER,
      message: 'ws hello',
    });
    expect(toRoom).toHaveBeenCalledWith(clientSocketId);
    expect(emitToRoom).toHaveBeenCalledWith(
      'receiveMessage',
      expect.objectContaining({
        id: 99,
        senderId: 10,
        receiverId: 20,
        senderType: SenderType.TRAINER,
        message: 'ws hello',
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      'messageSent',
      expect.objectContaining({
        id: 99,
        senderId: 10,
        receiverId: 20,
      }),
    );
    expect(result).toMatchObject({
      id: 99,
      senderId: 10,
      receiverId: 20,
      message: 'ws hello',
    });
  });
});

function createMockSocket(
  overrides: {
    id?: string;
    auth?: Record<string, unknown>;
    data?: Record<string, unknown>;
  } = {},
): { socket: Socket; emit: jest.Mock; disconnect: jest.Mock } {
  const emit = jest.fn();
  const disconnect = jest.fn();

  return {
    socket: {
      id: overrides.id ?? 'socket-id',
      data: overrides.data ?? {},
      handshake: {
        auth: overrides.auth ?? {},
        query: {},
        headers: {},
      },
      emit,
      disconnect,
    } as unknown as Socket,
    emit,
    disconnect,
  };
}
