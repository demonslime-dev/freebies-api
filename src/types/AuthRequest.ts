import { User } from '@prisma/client';

export type LoginRequest = Pick<User, 'email' | 'password'>

export type RegisterRequest = Pick<User, 'name' | 'email' | 'password'>
