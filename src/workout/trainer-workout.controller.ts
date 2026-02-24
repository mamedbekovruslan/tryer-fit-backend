import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainerWorkoutService } from './trainer-workout.service';
import { WorkoutCategory } from './workout-category.entity';
import { WorkoutProgram } from './workout-program.entity';
import { WorkoutDay } from './workout-day.entity';
import { Exercise } from './exercise.entity';
import { ClientWorkoutProgram } from './client-workout-program.entity';
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

@Controller('trainer/workout')
@UseGuards(JwtAuthGuard)
export class TrainerWorkoutController {
  constructor(private readonly trainerWorkoutService: TrainerWorkoutService) {}

  // Workout Categories
  @Get('categories')
  async getTrainerWorkoutCategories(@Req() req): Promise<WorkoutCategory[]> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.getTrainerWorkoutCategories(trainerId);
  }

  @Post('categories')
  async createWorkoutCategory(
    @Req() req,
    @Body() createCategoryDto: CreateWorkoutCategoryDto,
  ): Promise<WorkoutCategory> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.createWorkoutCategory(trainerId, createCategoryDto);
  }

  @Put('categories/:id')
  async updateWorkoutCategory(
    @Req() req,
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateWorkoutCategoryDto,
  ): Promise<WorkoutCategory> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.updateWorkoutCategory(
      trainerId,
      parseInt(id.toString()),
      updateCategoryDto,
    );
  }

  @Delete('categories/:id')
  async deleteWorkoutCategory(@Req() req, @Param('id') id: number): Promise<void> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.deleteWorkoutCategory(trainerId, parseInt(id.toString()));
  }

  // Workout Programs
  @Get('programs')
  async getAllWorkoutPrograms(@Req() req): Promise<WorkoutProgram[]> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.getAllWorkoutPrograms(trainerId);
  }

  @Get('categories/:categoryId/programs')
  async getWorkoutProgramsByCategory(
    @Req() req,
    @Param('categoryId') categoryId: number,
  ): Promise<WorkoutProgram[]> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.getWorkoutProgramsByCategoryAndTrainer(
      trainerId,
      parseInt(categoryId.toString()),
    );
  }

  @Post('programs')
  async createWorkoutProgram(
    @Req() req,
    @Body() createProgramDto: CreateWorkoutProgramDto,
  ): Promise<WorkoutProgram> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.createWorkoutProgram(trainerId, createProgramDto);
  }

  @Put('programs/:id')
  async updateWorkoutProgram(
    @Req() req,
    @Param('id') id: number,
    @Body() updateProgramDto: UpdateWorkoutProgramDto,
  ): Promise<WorkoutProgram> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.updateWorkoutProgram(
      trainerId,
      parseInt(id.toString()),
      updateProgramDto,
    );
  }

  @Delete('programs/:id')
  async deleteWorkoutProgram(@Req() req, @Param('id') id: number): Promise<void> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.deleteWorkoutProgram(trainerId, parseInt(id.toString()));
  }

  @Get('programs/:id')
  async getWorkoutProgramById(@Req() req, @Param('id') id: number): Promise<WorkoutProgram> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.getWorkoutProgramById(trainerId, parseInt(id.toString()));
  }

  // Workout Days
  @Get('programs/:programId/days')
  async getWorkoutDaysByProgram(
    @Req() req,
    @Param('programId') programId: number,
  ): Promise<WorkoutDay[]> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.getWorkoutDaysByProgramAndTrainer(
      trainerId,
      parseInt(programId.toString()),
    );
  }

  @Post('days')
  async createWorkoutDay(
    @Req() req,
    @Body() createDayDto: CreateWorkoutDayDto,
  ): Promise<WorkoutDay> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.createWorkoutDay(trainerId, createDayDto);
  }

  @Put('days/:id')
  async updateWorkoutDay(
    @Req() req,
    @Param('id') id: number,
    @Body() updateDayDto: UpdateWorkoutDayDto,
  ): Promise<WorkoutDay> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.updateWorkoutDay(
      trainerId,
      parseInt(id.toString()),
      updateDayDto,
    );
  }

  @Delete('days/:id')
  async deleteWorkoutDay(@Req() req, @Param('id') id: number): Promise<void> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.deleteWorkoutDay(trainerId, parseInt(id.toString()));
  }

  // Exercises
  @Get('days/:dayId/exercises')
  async getExercisesByDay(
    @Req() req,
    @Param('dayId') dayId: number,
  ): Promise<Exercise[]> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.getExercisesByDayAndTrainer(
      trainerId,
      parseInt(dayId.toString()),
    );
  }

  @Post('exercises')
  async createExercise(
    @Req() req,
    @Body() createExerciseDto: CreateExerciseDto,
  ): Promise<Exercise> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.createExercise(trainerId, createExerciseDto);
  }

  @Put('exercises/:id')
  async updateExercise(
    @Req() req,
    @Param('id') id: number,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.updateExercise(
      trainerId,
      parseInt(id.toString()),
      updateExerciseDto,
    );
  }

  @Delete('exercises/:id')
  async deleteExercise(@Req() req, @Param('id') id: number): Promise<void> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.deleteExercise(trainerId, parseInt(id.toString()));
  }

  // Client Workout Programs
  @Post('client-programs')
  async assignWorkoutProgramToClient(
    @Req() req,
    @Body() createDto: CreateClientWorkoutProgramDto,
  ): Promise<ClientWorkoutProgram> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.assignWorkoutProgramToClient(trainerId, createDto);
  }

  @Get('clients/:clientId/programs')
  async getClientWorkoutPrograms(
    @Req() req,
    @Param('clientId') clientId: number,
  ): Promise<ClientWorkoutProgram[]> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.getClientWorkoutPrograms(
      trainerId,
      parseInt(clientId.toString()),
    );
  }

  @Put('client-programs/:id')
  async updateClientWorkoutProgram(
    @Req() req,
    @Param('id') id: number,
    @Body() updateDto: UpdateClientWorkoutProgramDto,
  ): Promise<ClientWorkoutProgram> {
    const trainerId = req.user.userId;
    return await this.trainerWorkoutService.updateClientWorkoutProgram(
      trainerId,
      parseInt(id.toString()),
      updateDto,
    );
  }
}
