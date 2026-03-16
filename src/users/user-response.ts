import { Client } from './client.entity';
import { Trainer } from './trainer.entity';

export interface TrainerResponse {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  gender?: string;
  height?: number;
  weight?: number;
  phone?: string;
  birth_date?: Date;
  education?: string;
  institution?: string;
  degree?: string;
  specialization?: string;
  certificate_number?: string;
  photo_urls?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ClientResponse {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  waist_circumference?: number;
  chest_circumference?: number;
  hip_circumference?: number;
  arm_circumference?: number;
  leg_circumference?: number;
  fitness_goal?: string;
  expected_result?: string;
  contraindications?: string;
  diseases?: string;
  limitations?: string;
  training_experience?: string;
  current_diet?: string;
  photo_urls?: string[];
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
  created_at: Date;
  updated_at: Date;
  trainer?: TrainerResponse;
}

export function toTrainerResponse(trainer: Trainer): TrainerResponse {
  return {
    id: trainer.id,
    username: trainer.username,
    email: trainer.email,
    first_name: trainer.first_name,
    last_name: trainer.last_name,
    middle_name: trainer.middle_name,
    gender: trainer.gender,
    height: trainer.height,
    weight: trainer.weight,
    phone: trainer.phone,
    birth_date: trainer.birth_date,
    education: trainer.education,
    institution: trainer.institution,
    degree: trainer.degree,
    specialization: trainer.specialization,
    certificate_number: trainer.certificate_number,
    photo_urls: trainer.photo_urls,
    created_at: trainer.created_at,
    updated_at: trainer.updated_at,
  };
}

export function toClientResponse(client: Client): ClientResponse {
  return {
    id: client.id,
    username: client.username,
    email: client.email,
    first_name: client.first_name,
    last_name: client.last_name,
    waist_circumference: client.waist_circumference,
    chest_circumference: client.chest_circumference,
    hip_circumference: client.hip_circumference,
    arm_circumference: client.arm_circumference,
    leg_circumference: client.leg_circumference,
    fitness_goal: client.fitness_goal,
    expected_result: client.expected_result,
    contraindications: client.contraindications,
    diseases: client.diseases,
    limitations: client.limitations,
    training_experience: client.training_experience,
    current_diet: client.current_diet,
    photo_urls: client.photo_urls,
    weight: client.weight,
    body_fat: client.body_fat,
    muscle_mass: client.muscle_mass,
    created_at: client.created_at,
    updated_at: client.updated_at,
    trainer: client.trainer ? toTrainerResponse(client.trainer) : undefined,
  };
}
