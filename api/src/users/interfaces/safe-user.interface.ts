import { Role } from '@prisma/client';

/**
 * Public-safe user representation. Never includes password or refreshToken.
 * Exact coordinates are intentionally omitted from any externally-facing DTO;
 * only `location` (a human-readable place name / city) is exposed.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  location: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
