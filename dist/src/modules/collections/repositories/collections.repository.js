"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
let CollectionsRepository = class CollectionsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(onlyActive = true) {
        return this.prisma.collection.findMany({
            where: onlyActive ? { status: client_1.CollectionStatus.ACTIVE } : {},
            include: {
                _count: { select: { products: true } },
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findById(id) {
        return this.prisma.collection.findUnique({
            where: { id },
            include: {
                products: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        product: {
                            include: {
                                variants: true,
                                images: { orderBy: { sortOrder: 'asc' } },
                            },
                        },
                    },
                },
            },
        });
    }
    async findBySlug(slug, onlyActive = true) {
        return this.prisma.collection.findUnique({
            where: { slug },
            include: {
                products: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        product: {
                            include: {
                                variants: { where: onlyActive ? { status: 'ACTIVE' } : {} },
                                images: { orderBy: { sortOrder: 'asc' } },
                            },
                        },
                    },
                },
            },
        });
    }
    async create(dto) {
        return this.prisma.collection.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                imageUrl: dto.imageUrl,
                bannerImageUrl: dto.bannerImageUrl,
                status: dto.status || client_1.CollectionStatus.DRAFT,
                isFeatured: dto.isFeatured ?? false,
                sortOrder: dto.sortOrder || 0,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
            },
        });
    }
    async update(id, dto) {
        return this.prisma.collection.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.slug && { slug: dto.slug }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
                ...(dto.bannerImageUrl !== undefined && { bannerImageUrl: dto.bannerImageUrl }),
                ...(dto.status && { status: dto.status }),
                ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
                ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
                ...(dto.startDate !== undefined && {
                    startDate: dto.startDate ? new Date(dto.startDate) : null,
                }),
                ...(dto.endDate !== undefined && {
                    endDate: dto.endDate ? new Date(dto.endDate) : null,
                }),
            },
        });
    }
    async archive(id) {
        return this.prisma.collection.update({
            where: { id },
            data: { status: client_1.CollectionStatus.ARCHIVED },
        });
    }
    async addProduct(collectionId, productId, sortOrder = 0) {
        return this.prisma.productCollection.upsert({
            where: {
                productId_collectionId: { productId, collectionId },
            },
            update: { sortOrder },
            create: { productId, collectionId, sortOrder },
        });
    }
    async removeProduct(collectionId, productId) {
        return this.prisma.productCollection.delete({
            where: {
                productId_collectionId: { productId, collectionId },
            },
        });
    }
    async reorderProducts(collectionId, items) {
        return this.prisma.$transaction(items.map((item) => this.prisma.productCollection.update({
            where: {
                productId_collectionId: { productId: item.productId, collectionId },
            },
            data: { sortOrder: item.sortOrder },
        })));
    }
};
exports.CollectionsRepository = CollectionsRepository;
exports.CollectionsRepository = CollectionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CollectionsRepository);
//# sourceMappingURL=collections.repository.js.map