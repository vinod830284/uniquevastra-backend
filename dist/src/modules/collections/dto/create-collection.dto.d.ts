import { CollectionStatus } from '@prisma/client';
export declare class CreateCollectionDto {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    bannerImageUrl?: string;
    status?: CollectionStatus;
    isFeatured?: boolean;
    sortOrder?: number;
    startDate?: string;
    endDate?: string;
}
