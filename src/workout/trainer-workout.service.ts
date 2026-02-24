import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { Trainer } from '../users/trainer.entity';
import { Client } from '../users/client.entity';

@Injectable()
export class TrainerWorkoutService {
  constructor(
    @InjectRepository(WorkoutCategory)
    private workoutCategoryRepository: Repository<WorkoutCategory>,
    @InjectRepository(WorkoutProgram)
    private workoutProgramRepository: Repository<WorkoutProgram>,
    @InjectRepository(WorkoutDay)
    private workoutDayRepository: Repository<WorkoutDay>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(ClientWorkoutProgram)
    private clientWorkoutProgramRepository: Repository<ClientWorkoutProgram>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  // Workout Categories
  async getTrainerWorkoutCategories(trainerId: number): Promise<WorkoutCategory[]> {
    return await this.workoutCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async createWorkoutCategory(
    trainerId: number,
    createCategoryDto: CreateWorkoutCategoryDto,
  ): Promise<WorkoutCategory> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const category = new WorkoutCategory();
    category.name = createCategoryDto.name;
    category.description = createCategoryDto.description;

    return await this.workoutCategoryRepository.save(category);
  }

  async updateWorkoutCategory(
    trainerId: number,
    categoryId: number,
    updateCategoryDto: UpdateWorkoutCategoryDto,
  ): Promise<WorkoutCategory> {
    const category = await this.workoutCategoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Workout category with ID ${categoryId} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    category.name = updateCategoryDto.name ?? category.name;
    category.description = updateCategoryDto.description ?? category.description;

    return await this.workoutCategoryRepository.save(category);
  }

  async deleteWorkoutCategory(trainerId: number, categoryId: number): Promise<void> {
    const category = await this.workoutCategoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Workout category with ID ${categoryId} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const programsCount = await this.workoutProgramRepository.count({
      where: { workoutCategory: { id: categoryId } },
    });

    if (programsCount > 0) {
      throw new ForbiddenException(
        `Cannot delete workout category with ID ${categoryId} because it has associated workout programs`,
      );
    }

    await this.workoutCategoryRepository.delete(categoryId);
  }

  // Workout Programs
  async getAllWorkoutPrograms(trainerId: number): Promise<WorkoutProgram[]> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    return await this.workoutProgramRepository.find({
      where: { trainer: { id: trainerId } },
      relations: ['workoutCategory', 'trainer'],
      order: { name: 'ASC' },
    });
  }

  async getWorkoutProgramsByCategoryAndTrainer(
    trainerId: number,
    categoryId: number,
  ): Promise<WorkoutProgram[]> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const category = await this.workoutCategoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Workout category with ID ${categoryId} not found`);
    }

    return await this.workoutProgramRepository.find({
      where: {
        workoutCategory: { id: categoryId },
        trainer: { id: trainerId }
      },
      relations: ['workoutCategory', 'trainer'],
      order: { name: 'ASC' },
    });
  }

  async createWorkoutProgram(
    trainerId: number,
    createProgramDto: CreateWorkoutProgramDto,
  ): Promise<WorkoutProgram> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const category = await this.workoutCategoryRepository.findOne({
      where: { id: createProgramDto.workoutCategoryId },
    });
    if (!category) {
      throw new NotFoundException(`Workout category with ID ${createProgramDto.workoutCategoryId} not found`);
    }

    const program = new WorkoutProgram();
    program.name = createProgramDto.name;
    program.description = createProgramDto.description;
    program.workoutCategory = category;
    program.trainer = trainer;

    return await this.workoutProgramRepository.save(program);
  }

  async updateWorkoutProgram(
    trainerId: number,
    programId: number,
    updateProgramDto: UpdateWorkoutProgramDto,
  ): Promise<WorkoutProgram> {
    const program = await this.workoutProgramRepository.findOne({
      where: { id: programId },
      relations: ['workoutCategory', 'trainer'],
    });
    if (!program) {
      throw new NotFoundException(`Workout program with ID ${programId} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    if (program.trainer && program.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to update this workout program`);
    }

    if (updateProgramDto.workoutCategoryId) {
      const category = await this.workoutCategoryRepository.findOne({
        where: { id: updateProgramDto.workoutCategoryId },
      });
      if (!category) {
        throw new NotFoundException(`Workout category with ID ${updateProgramDto.workoutCategoryId} not found`);
      }
      program.workoutCategory = category;
    }

    program.name = updateProgramDto.name ?? program.name;
    program.description = updateProgramDto.description ?? program.description;

    return await this.workoutProgramRepository.save(program);
  }

  async getWorkoutProgramById(trainerId: number, programId: number): Promise<WorkoutProgram> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const program = await this.workoutProgramRepository.findOne({
      where: { id: programId },
      relations: ['workoutCategory', 'trainer'],
    });
    if (!program) {
      throw new NotFoundException(`Workout program with ID ${programId} not found`);
    }

    return program;
  }

  async deleteWorkoutProgram(trainerId: number, programId: number): Promise<void> {
    const program = await this.workoutProgramRepository.findOne({
      where: { id: programId },
      relations: ['workoutCategory', 'trainer'],
    });
    if (!program) {
      throw new NotFoundException(`Workout program with ID ${programId} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    if (program.trainer && program.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to delete this workout program`);
    }

    const daysCount = await this.workoutDayRepository.count({
      where: { workoutProgram: { id: programId } },
    });

    if (daysCount > 0) {
      throw new ForbiddenException(
        `Cannot delete workout program with ID ${programId} because it has associated workout days`,
      );
    }

    await this.workoutProgramRepository.delete(programId);
  }

  // Workout Days
  async getWorkoutDaysByProgramAndTrainer(
    trainerId: number,
    programId: number,
  ): Promise<WorkoutDay[]> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const program = await this.workoutProgramRepository.findOne({
      where: { id: programId },
      relations: ['workoutCategory', 'trainer'],
    });
    if (!program) {
      throw new NotFoundException(`Workout program with ID ${programId} not found`);
    }

    if (program.trainer && program.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to access this workout program`);
    }

    return await this.workoutDayRepository.find({
      where: { workoutProgram: { id: programId } },
      relations: ['workoutProgram', 'exercises'],
      order: { dayOrder: 'ASC' },
    });
  }

  async createWorkoutDay(
    trainerId: number,
    createDayDto: CreateWorkoutDayDto,
  ): Promise<WorkoutDay> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const program = await this.workoutProgramRepository.findOne({
      where: { id: createDayDto.workoutProgramId },
      relations: ['workoutCategory', 'trainer'],
    });
    if (!program) {
      throw new NotFoundException(`Workout program with ID ${createDayDto.workoutProgramId} not found`);
    }

    if (program.trainer && program.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to add days to this workout program`);
    }

    const day = new WorkoutDay();
    day.name = createDayDto.name;
    day.description = createDayDto.description;
    day.dayOrder = createDayDto.dayOrder ?? 0;
    day.workoutProgram = program;

    return await this.workoutDayRepository.save(day);
  }

  async updateWorkoutDay(
    trainerId: number,
    dayId: number,
    updateDayDto: UpdateWorkoutDayDto,
  ): Promise<WorkoutDay> {
    const day = await this.workoutDayRepository.findOne({
      where: { id: dayId },
      relations: ['workoutProgram'],
    });
    if (!day) {
      throw new NotFoundException(`Workout day with ID ${dayId} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    if (day.workoutProgram.trainer && day.workoutProgram.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to update this workout day`);
    }

    if (updateDayDto.workoutProgramId) {
      const program = await this.workoutProgramRepository.findOne({
        where: { id: updateDayDto.workoutProgramId },
        relations: ['workoutCategory', 'trainer'],
      });
      if (!program) {
        throw new NotFoundException(`Workout program with ID ${updateDayDto.workoutProgramId} not found`);
      }

      if (program.trainer && program.trainer.id !== trainerId) {
        throw new ForbiddenException(`You don't have permission to use this workout program`);
      }
      day.workoutProgram = program;
    }

    day.name = updateDayDto.name ?? day.name;
    day.description = updateDayDto.description ?? day.description;
    day.dayOrder = updateDayDto.dayOrder ?? day.dayOrder;

    return await this.workoutDayRepository.save(day);
  }

  async deleteWorkoutDay(trainerId: number, dayId: number): Promise<void> {
    const day = await this.workoutDayRepository.findOne({
      where: { id: dayId },
      relations: ['workoutProgram'],
    });
    if (!day) {
      throw new NotFoundException(`Workout day with ID ${dayId} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    if (day.workoutProgram.trainer && day.workoutProgram.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to delete this workout day`);
    }

    await this.workoutDayRepository.delete(dayId);
  }

  // Exercises
  async getExercisesByDayAndTrainer(
    trainerId: number,
    dayId: number,
  ): Promise<Exercise[]> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const day = await this.workoutDayRepository.findOne({
      where: { id: dayId },
      relations: ['workoutProgram'],
    });
    if (!day) {
      throw new NotFoundException(`Workout day with ID ${dayId} not found`);
    }

    if (day.workoutProgram.trainer && day.workoutProgram.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to access these exercises`);
    }

    return await this.exerciseRepository.find({
      where: { workoutDay: { id: dayId } },
      relations: ['workoutDay'],
      order: { exerciseOrder: 'ASC' },
    });
  }

  async createExercise(
    trainerId: number,
    createExerciseDto: CreateExerciseDto,
  ): Promise<Exercise> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const day = await this.workoutDayRepository.findOne({
      where: { id: createExerciseDto.workoutDayId },
      relations: ['workoutProgram'],
    });
    if (!day) {
      throw new NotFoundException(`Workout day with ID ${createExerciseDto.workoutDayId} not found`);
    }

    if (day.workoutProgram.trainer && day.workoutProgram.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to add exercises to this workout day`);
    }

    const exercise = new Exercise();
    exercise.name = createExerciseDto.name;
    exercise.description = createExerciseDto.description;
    exercise.sets = createExerciseDto.sets;
    exercise.reps = createExerciseDto.reps;
    exercise.weight = createExerciseDto.weight;
    exercise.restTime = createExerciseDto.restTime;
    exercise.exerciseOrder = createExerciseDto.exerciseOrder ?? 0;
    exercise.workoutDay = day;

    return await this.exerciseRepository.save(exercise);
  }

  async updateExercise(
    trainerId: number,
    exerciseId: number,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
      relations: ['workoutDay'],
    });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    if (exercise.workoutDay.workoutProgram.trainer && 
        exercise.workoutDay.workoutProgram.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to update this exercise`);
    }

    if (updateExerciseDto.workoutDayId) {
      const day = await this.workoutDayRepository.findOne({
        where: { id: updateExerciseDto.workoutDayId },
        relations: ['workoutProgram'],
      });
      if (!day) {
        throw new NotFoundException(`Workout day with ID ${updateExerciseDto.workoutDayId} not found`);
      }

      if (day.workoutProgram.trainer && day.workoutProgram.trainer.id !== trainerId) {
        throw new ForbiddenException(`You don't have permission to use this workout day`);
      }
      exercise.workoutDay = day;
    }

    exercise.name = updateExerciseDto.name ?? exercise.name;
    exercise.description = updateExerciseDto.description ?? exercise.description;
    exercise.sets = updateExerciseDto.sets ?? exercise.sets;
    exercise.reps = updateExerciseDto.reps ?? exercise.reps;
    exercise.weight = updateExerciseDto.weight ?? exercise.weight;
    exercise.restTime = updateExerciseDto.restTime ?? exercise.restTime;
    exercise.exerciseOrder = updateExerciseDto.exerciseOrder ?? exercise.exerciseOrder;

    return await this.exerciseRepository.save(exercise);
  }

  async deleteExercise(trainerId: number, exerciseId: number): Promise<void> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
      relations: ['workoutDay'],
    });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    if (exercise.workoutDay.workoutProgram.trainer && 
        exercise.workoutDay.workoutProgram.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to delete this exercise`);
    }

    await this.exerciseRepository.delete(exerciseId);
  }

  // Client Workout Programs
  async assignWorkoutProgramToClient(
    trainerId: number,
    createDto: CreateClientWorkoutProgramDto,
  ): Promise<ClientWorkoutProgram> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const client = await this.clientRepository.findOne({ where: { id: createDto.clientId } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${createDto.clientId} not found`);
    }

    // Verify client belongs to this trainer
    if (client.trainer && client.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to assign programs to this client`);
    }

    const program = await this.workoutProgramRepository.findOne({
      where: { id: createDto.workoutProgramId },
      relations: ['trainer'],
    });
    if (!program) {
      throw new NotFoundException(`Workout program with ID ${createDto.workoutProgramId} not found`);
    }

    // Verify program belongs to this trainer
    if (program.trainer && program.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to assign this program`);
    }

    const clientProgram = new ClientWorkoutProgram();
    clientProgram.client = client;
    clientProgram.workoutProgram = program;
    clientProgram.isActive = createDto.isActive ?? true;

    return await this.clientWorkoutProgramRepository.save(clientProgram);
  }

  async getActiveClientWorkoutPrograms(clientId: number): Promise<ClientWorkoutProgram[]> {
    return await this.clientWorkoutProgramRepository.find({
      where: { 
        client: { id: clientId },
        isActive: true 
      },
      relations: ['client', 'workoutProgram'],
    });
  }

  async getClientWorkoutPrograms(trainerId: number, clientId: number): Promise<ClientWorkoutProgram[]> {
    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    return await this.clientWorkoutProgramRepository.find({
      where: { client: { id: clientId } },
      relations: ['client', 'workoutProgram'],
    });
  }

  async updateClientWorkoutProgram(
    trainerId: number,
    id: number,
    updateDto: UpdateClientWorkoutProgramDto,
  ): Promise<ClientWorkoutProgram> {
    const clientProgram = await this.clientWorkoutProgramRepository.findOne({
      where: { id },
      relations: ['client', 'workoutProgram'],
    });
    if (!clientProgram) {
      throw new NotFoundException(`Client workout program with ID ${id} not found`);
    }

    const trainer = await this.trainerRepository.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    if (clientProgram.client.trainer && clientProgram.client.trainer.id !== trainerId) {
      throw new ForbiddenException(`You don't have permission to update this client program`);
    }

    clientProgram.isActive = updateDto.isActive ?? clientProgram.isActive;

    return await this.clientWorkoutProgramRepository.save(clientProgram);
  }
}
