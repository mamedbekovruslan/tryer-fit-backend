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
    trainer?: any; // Информация о тренере для клиентов
  };
}