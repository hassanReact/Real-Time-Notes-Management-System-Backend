import { Request } from 'express';
import { User } from '@prisma/client';

// Request interface with user - JWT authentication ke baad user object milta hai
export interface RequestWithUser extends Request {
  user: User; // Logged in user ka data
}