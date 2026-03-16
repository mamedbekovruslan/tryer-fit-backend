import { WorkoutCategory } from './workout-category.entity';
import { WorkoutProgram } from './workout-program.entity';
import { WorkoutDay } from './workout-day.entity';
import { Exercise } from './exercise.entity';
import { ClientWorkoutProgram } from './client-workout-program.entity';
import {
  ClientResponse,
  toClientResponse,
  TrainerResponse,
  toTrainerResponse,
} from '../users/user-response';

export interface WorkoutCategoryResponse {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseResponse {
  id: number;
  name: string;
  description?: string;
  sets?: number;
  reps?: string;
  weight?: string;
  restTime?: string;
  exerciseOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutDayResponse {
  id: number;
  name: string;
  description?: string;
  dayOrder: number;
  exercises?: ExerciseResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutProgramResponse {
  id: number;
  name: string;
  description?: string;
  workoutCategory?: WorkoutCategoryResponse;
  trainer?: TrainerResponse;
  workoutDays?: WorkoutDayResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientWorkoutProgramResponse {
  id: number;
  client?: ClientResponse;
  workoutProgram?: WorkoutProgramResponse;
  isActive: boolean;
  assignedAt: Date;
  updatedAt: Date;
}

export function toWorkoutCategoryResponse(
  category: WorkoutCategory,
): WorkoutCategoryResponse {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function toExerciseResponse(exercise: Exercise): ExerciseResponse {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    restTime: exercise.restTime,
    exerciseOrder: exercise.exerciseOrder,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
  };
}

export function toWorkoutDayResponse(day: WorkoutDay): WorkoutDayResponse {
  return {
    id: day.id,
    name: day.name,
    description: day.description,
    dayOrder: day.dayOrder,
    exercises: day.exercises?.map(toExerciseResponse),
    createdAt: day.createdAt,
    updatedAt: day.updatedAt,
  };
}

export function toWorkoutProgramResponse(
  program: WorkoutProgram,
): WorkoutProgramResponse {
  return {
    id: program.id,
    name: program.name,
    description: program.description,
    workoutCategory: program.workoutCategory
      ? toWorkoutCategoryResponse(program.workoutCategory)
      : undefined,
    trainer: program.trainer ? toTrainerResponse(program.trainer) : undefined,
    workoutDays: program.workoutDays?.map(toWorkoutDayResponse),
    createdAt: program.createdAt,
    updatedAt: program.updatedAt,
  };
}

export function toClientWorkoutProgramResponse(
  program: ClientWorkoutProgram,
): ClientWorkoutProgramResponse {
  return {
    id: program.id,
    client: program.client ? toClientResponse(program.client) : undefined,
    workoutProgram: program.workoutProgram
      ? toWorkoutProgramResponse(program.workoutProgram)
      : undefined,
    isActive: program.isActive,
    assignedAt: program.assignedAt,
    updatedAt: program.updatedAt,
  };
}
