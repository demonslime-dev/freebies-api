import { ApiResponse } from '@/types/ApiResponse.js';
import { User } from '@prisma/client';

export type AuthResponse = ApiResponse<{ accessToken: string, user: Omit<User, 'password'> }>
