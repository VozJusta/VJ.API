import { Request } from 'express';

export interface RequestUser extends Request {
  user: {
    sub: string;
    role: string;
  };
}

export interface tokenTypes {
  sub: string;
  role: 'Citizen' | 'Lawyer';
  email: string;
  fullName: string;
  sessionId: string;
}

export interface TokensPayload {
  sub: string;
  role: 'Citizen' | 'Lawyer';
  email: string;
  fullName: string;
  sessionId: string;
  loggedWithGoogle?: boolean;
  registerCompleted?: boolean;
}
