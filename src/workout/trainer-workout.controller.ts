import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainerWorkoutService } from './trainer-workout.service';
import { CreateWorkoutCategoryDto } from './dto/create-workout-category.dto';
import { UpdateWorkoutCategoryDto } from './dto/update-workout-category.dto';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';
import { UpdateWorkoutProgramDto } from './dto/update-workout-program.dto';
import { CreateWorkoutDayDto } from './dto/create-workout-day.dto';
import { UpdateWorkoutDayDto } from './dto/update-workout-day.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { CreateClientWorkoutProgramDto } from './dto/create-client-workout-program.dto';
import { UpdateClientWorkoutProgramDto } from './dto/update-client-workout-program.dto';
import {
  ClientWorkoutProgramResponse,
  ExerciseResponse,
  WorkoutCategoryResponse,
  WorkoutDayResponse,
  WorkoutProgramResponse,
  toClientWorkoutProgramResponse,
  toExerciseResponse,
  toWorkoutCategoryResponse,
  toWorkoutDayResponse,
  toWorkoutProgramResponse,
} from './workout-response';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller('trainer/workout')
@UseGuards(JwtAuthGuard)
export class TrainerWorkoutController {
  constructor(private readonly trainerWorkoutService: TrainerWorkoutService) {}

  @Get('categories')
  async getTrainerWorkoutCategories(
    @Req() req: AuthenticatedRequest,
  ): Promise<WorkoutCategoryResponse[]> {
    const trainerId = req.user.userId;
    const categories =
      await this.trainerWorkoutService.getTrainerWorkoutCategories(trainerId);
    return categories.map(toWorkoutCategoryResponse);
  }

  @Post('categories')
  async createWorkoutCategory(
    @Req() req: AuthenticatedRequest,
    @Body() createCategoryDto: CreateWorkoutCategoryDto,
  ): Promise<WorkoutCategoryResponse> {
    const trainerId = req.user.userId;
    const category = await this.trainerWorkoutService.createWorkoutCategory(
      trainerId,
      createCategoryDto,
    );
    return toWorkoutCategoryResponse(category);
  }

  @Put('categories/:id')
  async updateWorkoutCategory(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateWorkoutCategoryDto,
  ): Promise<WorkoutCategoryResponse> {
    const trainerId = req.user.userId;
    const category = await this.trainerWorkoutService.updateWorkoutCategory(
      trainerId,
      id,
      updateCategoryDto,
    );
    return toWorkoutCategoryResponse(category);
  }

  @Delete('categories/:id')
  async deleteWorkoutCategory(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const trainerId = req.user.userId;
    await this.trainerWorkoutService.deleteWorkoutCategory(trainerId, id);
  }

  @Get('programs')
  async getAllWorkoutPrograms(
    @Req() req: AuthenticatedRequest,
  ): Promise<WorkoutProgramResponse[]> {
    const trainerId = req.user.userId;
    const programs =
      await this.trainerWorkoutService.getAllWorkoutPrograms(trainerId);
    return programs.map(toWorkoutProgramResponse);
  }

  @Get('categories/:categoryId/programs')
  async getWorkoutProgramsByCategory(
    @Req() req: AuthenticatedRequest,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<WorkoutProgramResponse[]> {
    const trainerId = req.user.userId;
    const programs =
      await this.trainerWorkoutService.getWorkoutProgramsByCategoryAndTrainer(
        trainerId,
        categoryId,
      );
    return programs.map(toWorkoutProgramResponse);
  }

  @Post('programs')
  async createWorkoutProgram(
    @Req() req: AuthenticatedRequest,
    @Body() createProgramDto: CreateWorkoutProgramDto,
  ): Promise<WorkoutProgramResponse> {
    const trainerId = req.user.userId;
    const program = await this.trainerWorkoutService.createWorkoutProgram(
      trainerId,
      createProgramDto,
    );
    return toWorkoutProgramResponse(program);
  }

  @Put('programs/:id')
  async updateWorkoutProgram(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramDto: UpdateWorkoutProgramDto,
  ): Promise<WorkoutProgramResponse> {
    const trainerId = req.user.userId;
    const program = await this.trainerWorkoutService.updateWorkoutProgram(
      trainerId,
      id,
      updateProgramDto,
    );
    return toWorkoutProgramResponse(program);
  }

  @Delete('programs/:id')
  async deleteWorkoutProgram(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const trainerId = req.user.userId;
    await this.trainerWorkoutService.deleteWorkoutProgram(trainerId, id);
  }

  @Get('programs/:id')
  async getWorkoutProgramById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WorkoutProgramResponse> {
    const trainerId = req.user.userId;
    const program = await this.trainerWorkoutService.getWorkoutProgramById(
      trainerId,
      id,
    );
    return toWorkoutProgramResponse(program);
  }

  @Get('programs/:programId/days')
  async getWorkoutDaysByProgram(
    @Req() req: AuthenticatedRequest,
    @Param('programId', ParseIntPipe) programId: number,
  ): Promise<WorkoutDayResponse[]> {
    const trainerId = req.user.userId;
    const days =
      await this.trainerWorkoutService.getWorkoutDaysByProgramAndTrainer(
        trainerId,
        programId,
      );
    return days.map(toWorkoutDayResponse);
  }

  @Post('days')
  async createWorkoutDay(
    @Req() req: AuthenticatedRequest,
    @Body() createDayDto: CreateWorkoutDayDto,
  ): Promise<WorkoutDayResponse> {
    const trainerId = req.user.userId;
    const day = await this.trainerWorkoutService.createWorkoutDay(
      trainerId,
      createDayDto,
    );
    return toWorkoutDayResponse(day);
  }

  @Put('days/:id')
  async updateWorkoutDay(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDayDto: UpdateWorkoutDayDto,
  ): Promise<WorkoutDayResponse> {
    const trainerId = req.user.userId;
    const day = await this.trainerWorkoutService.updateWorkoutDay(
      trainerId,
      id,
      updateDayDto,
    );
    return toWorkoutDayResponse(day);
  }

  @Delete('days/:id')
  async deleteWorkoutDay(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const trainerId = req.user.userId;
    await this.trainerWorkoutService.deleteWorkoutDay(trainerId, id);
  }

  @Get('days/:dayId/exercises')
  async getExercisesByDay(
    @Req() req: AuthenticatedRequest,
    @Param('dayId', ParseIntPipe) dayId: number,
  ): Promise<ExerciseResponse[]> {
    const trainerId = req.user.userId;
    const exercises =
      await this.trainerWorkoutService.getExercisesByDayAndTrainer(
        trainerId,
        dayId,
      );
    return exercises.map(toExerciseResponse);
  }

  @Post('exercises')
  async createExercise(
    @Req() req: AuthenticatedRequest,
    @Body() createExerciseDto: CreateExerciseDto,
  ): Promise<ExerciseResponse> {
    const trainerId = req.user.userId;
    const exercise = await this.trainerWorkoutService.createExercise(
      trainerId,
      createExerciseDto,
    );
    return toExerciseResponse(exercise);
  }

  @Put('exercises/:id')
  async updateExercise(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ): Promise<ExerciseResponse> {
    const trainerId = req.user.userId;
    const exercise = await this.trainerWorkoutService.updateExercise(
      trainerId,
      id,
      updateExerciseDto,
    );
    return toExerciseResponse(exercise);
  }

  @Delete('exercises/:id')
  async deleteExercise(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const trainerId = req.user.userId;
    await this.trainerWorkoutService.deleteExercise(trainerId, id);
  }

  @Post('client-programs')
  async assignWorkoutProgramToClient(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateClientWorkoutProgramDto,
  ): Promise<ClientWorkoutProgramResponse> {
    const trainerId = req.user.userId;
    const program =
      await this.trainerWorkoutService.assignWorkoutProgramToClient(
        trainerId,
        createDto,
      );
    return toClientWorkoutProgramResponse(program);
  }

  @Get('clients/:clientId/programs')
  async getClientWorkoutPrograms(
    @Req() req: AuthenticatedRequest,
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ClientWorkoutProgramResponse[]> {
    const trainerId = req.user.userId;
    const programs = await this.trainerWorkoutService.getClientWorkoutPrograms(
      trainerId,
      clientId,
    );
    return programs.map(toClientWorkoutProgramResponse);
  }

  @Put('client-programs/:id')
  async updateClientWorkoutProgram(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateClientWorkoutProgramDto,
  ): Promise<ClientWorkoutProgramResponse> {
    const trainerId = req.user.userId;
    const program = await this.trainerWorkoutService.updateClientWorkoutProgram(
      trainerId,
      id,
      updateDto,
    );
    return toClientWorkoutProgramResponse(program);
  }
}
