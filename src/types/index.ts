export enum Role {
  COORDINATOR = 'COORDINATOR',
  STUDENT = 'STUDENT',
}

export interface SessionPayload {
  sub: string;
  role: Role;
  isMaster: boolean;
  mfaVerified: boolean;
  mfaRequired?: boolean;
  iat?: number;
  exp?: number;
}
