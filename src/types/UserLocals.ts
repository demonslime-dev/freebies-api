import { User } from '@prisma/client';

export interface UserLocals {
    user: Omit<User, 'password'>;
}
