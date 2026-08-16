import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (AdminRole | 'CUSTOMER')[]) => SetMetadata(ROLES_KEY, roles);
