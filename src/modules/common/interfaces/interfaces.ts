import { Request } from 'express';
import { Personality } from 'generated/prisma/enums';

export interface RequestUser extends Request {
  user: {
    sub: string;
    role: string;
    sessionId: string;
    email?: string;
    fullName?: string;
    loggedWithGoogle?: boolean;
    registerCompleted?: boolean;
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

export interface GenerateReportJob {
  simulationId: string;
}