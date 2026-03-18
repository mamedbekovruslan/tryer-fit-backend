import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ClientNutritionPlanController } from './client-nutrition-plan.controller';
import { ClientNutritionPlanService } from './client-nutrition-plan.service';
import { TrainerNutritionController } from './trainer-nutrition.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import {
  createClientAccount,
  createTestApp,
  createTrainerAccount,
  destroyTestApp,
  type TestContext,
} from '../../test/support/test-app';

describe('Nutrition integration', () => {
  let context: TestContext;
  let trainerNutritionController: TrainerNutritionController;
  let clientNutritionPlanController: ClientNutritionPlanController;
  let clientNutritionPlanService: ClientNutritionPlanService;

  beforeEach(async () => {
    context = await createTestApp();
    trainerNutritionController = context.moduleRef.get(
      TrainerNutritionController,
    );
    clientNutritionPlanController = context.moduleRef.get(
      ClientNutritionPlanController,
    );
    clientNutritionPlanService = context.moduleRef.get(
      ClientNutritionPlanService,
    );
  });

  afterEach(async () => {
    await destroyTestApp(context);
  });

  it('trainer creates nutrition category', async () => {
    const trainer = await createTrainerAccount(context);

    const category = await trainerNutritionController.createNutritionCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Mass gain',
        description: 'High calorie plan',
      },
    );

    expect(category).toMatchObject({
      name: 'Mass gain',
      description: 'High calorie plan',
    });
  });

  it('trainer creates nutrition plan in category', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerNutritionController.createNutritionCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Cutting',
      },
    );

    const plan = await trainerNutritionController.createNutritionPlan(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Week 1',
        description: 'Plan for week 1',
        nutritionCategoryId: category.id,
      },
    );

    expect(plan).toMatchObject({
      name: 'Week 1',
      nutritionCategory: {
        id: category.id,
      },
      trainer: {
        id: trainer.entity.id,
      },
    });
  });

  it('trainer creates nutrition day in plan', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerNutritionController.createNutritionCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Maintenance' },
    );
    const plan = await trainerNutritionController.createNutritionPlan(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Plan A',
        nutritionCategoryId: category.id,
      },
    );

    const day = await trainerNutritionController.createNutritionDay(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Day 1',
        description: 'Breakfast focus',
        nutritionPlanId: plan.id,
      },
    );

    expect(day).toMatchObject({
      name: 'Day 1',
      nutritionPlan: {
        id: plan.id,
      },
    });
  });

  it('cannot delete category with attached plans', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerNutritionController.createNutritionCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Protected category' },
    );
    await trainerNutritionController.createNutritionPlan(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Protected plan',
        nutritionCategoryId: category.id,
      },
    );

    await expect(
      trainerNutritionController.deleteNutritionCategory(
        createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
        category.id,
      ),
    ).rejects.toThrow('because it has associated nutrition plans');
  });

  it('cannot delete plan with attached days', async () => {
    const trainer = await createTrainerAccount(context);
    const category = await trainerNutritionController.createNutritionCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Category with days' },
    );
    const plan = await trainerNutritionController.createNutritionPlan(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Plan with days',
        nutritionCategoryId: category.id,
      },
    );
    await trainerNutritionController.createNutritionDay(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Day X',
        nutritionPlanId: plan.id,
      },
    );

    await expect(
      trainerNutritionController.deleteNutritionPlan(
        createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
        plan.id,
      ),
    ).rejects.toThrow('because it has associated nutrition days');
  });

  it('client active nutrition plans endpoint requires auth', () => {
    const activeMethod = Object.getOwnPropertyDescriptor(
      ClientNutritionPlanController.prototype,
      'findByClientAndActive',
    )?.value as object | undefined;
    const guards = activeMethod
      ? (Reflect.getMetadata(GUARDS_METADATA, activeMethod) as unknown[])
      : [];

    expect(guards).toContain(JwtAuthGuard);
  });

  it('client cannot access another client nutrition plans', async () => {
    const trainer = await createTrainerAccount(context);
    const ownerClient = await createClientAccount(context, {
      email: 'owner_client@test.dev',
      username: 'owner_client',
      trainer_id: trainer.entity.id,
    });
    const otherClient = await createClientAccount(context, {
      email: 'other_client@test.dev',
      username: 'other_client',
    });

    const category = await trainerNutritionController.createNutritionCategory(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      { name: 'Client plans category' },
    );
    const plan = await trainerNutritionController.createNutritionPlan(
      createRequest(trainer.entity.id, trainer.entity.email, 'trainer'),
      {
        name: 'Assigned nutrition',
        nutritionCategoryId: category.id,
      },
    );
    await clientNutritionPlanService.create({
      clientId: ownerClient.entity.id,
      nutritionPlanId: plan.id,
      isActive: true,
    });

    await expect(
      clientNutritionPlanController.findByClientAndActive(
        createRequest(
          otherClient.entity.id,
          otherClient.entity.email,
          'client',
        ),
        ownerClient.entity.id,
      ),
    ).rejects.toThrow('Clients can only access their own data');
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
