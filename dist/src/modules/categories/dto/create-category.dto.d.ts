import { CategoryStatus } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    status?: CategoryStatus;
    sortOrder?: number;
}
