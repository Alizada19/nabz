import { Role } from '@prisma/client';
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
