import type { TrainerResponse } from '../users/user-response';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    user_type: 'client' | 'trainer';
    trainer?: TrainerResponse;
  };
}
