import { TrainerController } from '../users/trainer.controller';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { TrainerWorkoutController } from './trainer-workout.controller';
import { WorkoutController } from './workout.controller';
import {
  createClientAccount,
  createTestApp,
  createTrainerAccount,
  destroyTestApp,
  type TestContext,
} from '../../test/support/test-app';

describe('Workout integration', () => {
  let context: TestContext;
  let trainerWorkoutController: TrainerWorkoutController;
  let workoutController: WorkoutController;
  let trainerController: TrainerController;

  beforeEach(async () => {
    context = await createTestApp();
    trainerWorkoutController = context.moduleRef.get(TrainerWorkoutController);
    workoutController = context.moduleRef.get(WorkoutController);
    trainerController = context.moduleRef.get(TrainerController);
  });

  afterEach(async () => {
    await destroyTestApp(context);
  });

  it('trainer creates workout category', async () => {
    const trainer = await createTrainerAccount(context);

    const category = await trainerWorkoutController.createWorkoutCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Strength',
        description: 'Power blocks',
      },
    );

    expect(category).toMatchObject({
      name: 'Strength',
      description: 'Power blocks',
    });
  });

  it('trainer creates workout program', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerWorkoutController.createWorkoutCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Hypertrophy' },
    );

    const program = await trainerWorkoutController.createWorkoutProgram(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Upper Lower',
        description: '4-day split',
        workoutCategoryId: category.id,
      },
    );

    expect(program).toMatchObject({
      name: 'Upper Lower',
      workoutCategory: {
        id: category.id,
      },
      trainer: {
        id: trainer.entity.id,
      },
    });
  });

  it('trainer creates workout day', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerWorkoutController.createWorkoutCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Conditioning' },
    );
    const program = await trainerWorkoutController.createWorkoutProgram(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Metcon',
        workoutCategoryId: category.id,
      },
    );

    const day = await trainerWorkoutController.createWorkoutDay(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Day 1',
        description: 'Push focus',
        dayOrder: 1,
        workoutProgramId: program.id,
      },
    );

    expect(day).toMatchObject({
      name: 'Day 1',
      dayOrder: 1,
    });
  });

  it('trainer creates exercise', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerWorkoutController.createWorkoutCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Exercise category' },
    );
    const program = await trainerWorkoutController.createWorkoutProgram(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Exercise program',
        workoutCategoryId: category.id,
      },
    );
    const day = await trainerWorkoutController.createWorkoutDay(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Exercise day',
        workoutProgramId: program.id,
      },
    );

    const exercise = await trainerWorkoutController.createExercise(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Bench press',
        sets: 4,
        reps: '8',
        weight: '80kg',
        restTime: '90s',
        workoutDayId: day.id,
        exerciseOrder: 1,
      },
    );

    expect(exercise).toMatchObject({
      name: 'Bench press',
      sets: 4,
      reps: '8',
    });
  });

  it('trainer assigns program to own client', async () => {
    const trainer = await createTrainerAccount(context);
    const client = await createClientAccount(context);
    const category = await trainerWorkoutController.createWorkoutCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Assignment category' },
    );
    const program = await trainerWorkoutController.createWorkoutProgram(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Assignment program',
        workoutCategoryId: category.id,
      },
    );

    await trainerController.assignClientToTrainer(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      String(trainer.entity.id),
      String(client.entity.id),
    );

    const assigned =
      await trainerWorkoutController.assignWorkoutProgramToClient(
        createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
        {
          clientId: client.entity.id,
          workoutProgramId: program.id,
          isActive: true,
        },
      );

    expect(assigned).toMatchObject({
      client: {
        id: client.entity.id,
      },
      workoutProgram: {
        id: program.id,
      },
      isActive: true,
    });
  });

  it('client can fetch only own active workout programs', async () => {
    const trainer = await createTrainerAccount(context);
    const ownerClient = await createClientAccount(context);
    const otherClient = await createClientAccount(context, {
      email: 'workout_other@test.dev',
      username: 'workout_other',
    });
    const category = await trainerWorkoutController.createWorkoutCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Active fetch category' },
    );
    const program = await trainerWorkoutController.createWorkoutProgram(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Active fetch program',
        workoutCategoryId: category.id,
      },
    );

    await trainerController.assignClientToTrainer(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      String(trainer.entity.id),
      String(ownerClient.entity.id),
    );
    await trainerWorkoutController.assignWorkoutProgramToClient(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        clientId: ownerClient.entity.id,
        workoutProgramId: program.id,
        isActive: true,
      },
    );

    const ownPrograms = await workoutController.getActiveClientWorkoutPrograms(
      createRequest(ownerClient.entity.id, ownerClient.entity.email, 'client'),
      ownerClient.entity.id,
    );
    expect(ownPrograms).toHaveLength(1);

    await expect(
      workoutController.getActiveClientWorkoutPrograms(
        createRequest(
          otherClient.entity.id,
          otherClient.entity.email,
          'client',
        ),
        ownerClient.entity.id,
      ),
    ).rejects.toThrow('You can only access your own workout programs');
  });

  it('cannot delete program with attached days', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerWorkoutController.createWorkoutCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Delete protected category' },
    );
    const program = await trainerWorkoutController.createWorkoutProgram(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Delete protected program',
        workoutCategoryId: category.id,
      },
    );
    await trainerWorkoutController.createWorkoutDay(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Protected day',
        workoutProgramId: program.id,
      },
    );

    await expect(
      trainerWorkoutController.deleteWorkoutProgram(
        createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
        program.id,
      ),
    ).rejects.toThrow('because it has associated workout days');
  });

  it('cannot delete category with attached programs', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerWorkoutController.createWorkoutCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Category protected by program' },
    );
    await trainerWorkoutController.createWorkoutProgram(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Existing program',
        workoutCategoryId: category.id,
      },
    );

    await expect(
      trainerWorkoutController.deleteWorkoutCategory(
        createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
        category.id,
      ),
    ).rejects.toThrow('because it has associated workout programs');
  });
});

function createRequest(
  userId: number,
  email: string,
  userType: 'client' | 'trainer',
): AuthenticatedRequest {
  return {
    user: {
      sub: userId,
      userId,
      email,
      user_type: userType,
    },
  } as AuthenticatedRequest;
}
