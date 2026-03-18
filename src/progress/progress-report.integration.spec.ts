import { ProgressReportController } from './progress-report.controller';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { TrainerController } from '../users/trainer.controller';
import {
  createClientAccount,
  createTestApp,
  createTrainerAccount,
  destroyTestApp,
  type TestContext,
} from '../../test/support/test-app';

describe('ProgressReport integration', () => {
  let context: TestContext;
  let progressReportController: ProgressReportController;
  let trainerController: TrainerController;

  beforeEach(async () => {
    context = await createTestApp();
    progressReportController = context.moduleRef.get(ProgressReportController);
    trainerController = context.moduleRef.get(TrainerController);
  });

  afterEach(async () => {
    await destroyTestApp(context);
  });

  it('client creates progress report for self', async () => {
    const client = await createClientAccount(context);

    const report = await progressReportController.create(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      {
        date: new Date('2026-03-18T10:00:00.000Z'),
        weight: 77.5,
        waist: 81,
        notes: 'week 1',
      },
    );

    expect(report).toMatchObject({
      weight: 77.5,
      waist: 81,
      notes: 'week 1',
      client: { id: client.entity.id },
    });
  });

  it('client cannot create progress report for another client', async () => {
    const clientA = await createClientAccount(context, {
      email: 'progress_a@test.dev',
      username: 'progress_a',
    });
    const clientB = await createClientAccount(context, {
      email: 'progress_b@test.dev',
      username: 'progress_b',
    });

    await expect(
      progressReportController.create(
        createRequest({
          sub: clientA.entity.id,
          userId: clientA.entity.id,
          email: clientA.entity.email,
          user_type: 'client',
        }),
        {
          clientId: clientB.entity.id,
          date: new Date('2026-03-18T10:00:00.000Z'),
          weight: 90,
        },
      ),
    ).rejects.toThrow('You can only create progress reports for yourself');
  });

  it('creating report updates client current metrics', async () => {
    const client = await createClientAccount(context, {
      email: 'metrics@test.dev',
      username: 'metrics_client',
    });

    await progressReportController.create(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      {
        date: new Date('2026-03-18T10:00:00.000Z'),
        weight: 65.4,
        bodyFat: 21.1,
        muscleMass: 30.2,
      },
    );

    const updatedClient = await context.clientRepository.findOneByOrFail({
      id: client.entity.id,
    });

    expect(Number(updatedClient.weight)).toBeCloseTo(65.4);
    expect(Number(updatedClient.body_fat)).toBeCloseTo(21.1);
    expect(Number(updatedClient.muscle_mass)).toBeCloseTo(30.2);
  });

  it('trainer can fetch reports only for own client', async () => {
    const trainerA = await createTrainerAccount(context, {
      email: 'progress_trainer_a@test.dev',
      username: 'progress_trainer_a',
    });
    const trainerB = await createTrainerAccount(context, {
      email: 'progress_trainer_b@test.dev',
      username: 'progress_trainer_b',
    });
    const client = await createClientAccount(context, {
      email: 'progress_owned_client@test.dev',
      username: 'progress_owned_client',
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

    await progressReportController.create(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      {
        date: new Date('2026-03-18T10:00:00.000Z'),
        weight: 80,
      },
    );

    const ownReports = await progressReportController.findAllByTrainerForClient(
      createRequest({
        sub: trainerA.entity.id,
        userId: trainerA.entity.id,
        email: trainerA.entity.email,
        user_type: 'trainer',
      }),
      String(client.entity.id),
    );
    expect(ownReports).toHaveLength(1);

    await expect(
      progressReportController.findAllByTrainerForClient(
        createRequest({
          sub: trainerB.entity.id,
          userId: trainerB.entity.id,
          email: trainerB.entity.email,
          user_type: 'trainer',
        }),
        String(client.entity.id),
      ),
    ).rejects.toThrow('Client is not assigned to this trainer');
  });

  it('trainer can add comment to own client report', async () => {
    const trainer = await createTrainerAccount(context, {
      email: 'comment_trainer@test.dev',
      username: 'comment_trainer',
    });
    const client = await createClientAccount(context, {
      email: 'comment_client@test.dev',
      username: 'comment_client',
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

    const report = await progressReportController.create(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      {
        date: new Date('2026-03-18T10:00:00.000Z'),
        weight: 72,
      },
    );

    const comment = await progressReportController.addComment(
      createRequest({
        sub: trainer.entity.id,
        userId: trainer.entity.id,
        email: trainer.entity.email,
        user_type: 'trainer',
      }),
      String(report.id),
      { comment: 'Хорошая динамика' },
    );

    expect(comment).toMatchObject({
      comment: 'Хорошая динамика',
      trainer: { id: trainer.entity.id },
    });
  });

  it('client cannot add comment', async () => {
    const client = await createClientAccount(context, {
      email: 'cannot_comment@test.dev',
      username: 'cannot_comment',
    });

    const report = await progressReportController.create(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      {
        date: new Date('2026-03-18T10:00:00.000Z'),
        weight: 72,
      },
    );

    await expect(
      progressReportController.addComment(
        createRequest({
          sub: client.entity.id,
          userId: client.entity.id,
          email: client.entity.email,
          user_type: 'client',
        }),
        String(report.id),
        { comment: 'Self review' },
      ),
    ).rejects.toThrow('Only trainers can add comments');
  });

  it('deleting report removes it from client history', async () => {
    const client = await createClientAccount(context, {
      email: 'delete_report@test.dev',
      username: 'delete_report',
    });

    const report = await progressReportController.create(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      {
        date: new Date('2026-03-18T10:00:00.000Z'),
        weight: 73,
      },
    );

    await progressReportController.remove(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
      String(report.id),
    );

    const list = await progressReportController.findAll(
      createRequest({
        sub: client.entity.id,
        userId: client.entity.id,
        email: client.entity.email,
        user_type: 'client',
      }),
    );
    expect(list).toHaveLength(0);
  });
});

function createRequest(
  user: AuthenticatedRequest['user'],
): AuthenticatedRequest {
  return { user } as AuthenticatedRequest;
}
