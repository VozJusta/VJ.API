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

export interface TokensPayload extends tokenTypes {
  loggedWithGoogle?: boolean;
  registerCompleted?: boolean;
}
