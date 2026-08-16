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
exports.ProductsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
let ProductsRepository = class ProductsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, onlyActive = true) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = query.limit && query.limit > 0 ? query.limit : 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (onlyActive) {
            where.status = client_1.ProductStatus.ACTIVE;
        }
        else if (query.status) {
            where.status = query.status;
        }
        if (query.category) {
            where.category = { slug: query.category };
        }
        if (query.collection) {
            where.collections = {
                some: { collection: { slug: query.collection } },
            };
        }
        if (query.isFeatured !== undefined) {
            where.isFeatured = query.isFeatured;
        }
        if (query.isNewArrival !== undefined) {
            where.isNewArrival = query.isNewArrival;
        }
        if (query.isBestSeller !== undefined) {
            where.isBestSeller = query.isBestSeller;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined || query.size || query.color) {
            where.variants = {
                some: {
                    ...(onlyActive ? { status: 'ACTIVE' } : {}),
                    ...(query.minPrice !== undefined ? { price: { gte: query.minPrice } } : {}),
                    ...(query.maxPrice !== undefined ? { price: { lte: query.maxPrice } } : {}),
                    ...(query.size ? { size: { equals: query.size, mode: 'insensitive' } } : {}),
                    ...(query.color ? { color: { contains: query.color, mode: 'insensitive' } } : {}),
                },
            };
        }
        let orderBy = { createdAt: 'desc' };
        if (query.sort === 'price_asc') {
            orderBy = { createdAt: 'asc' };
        }
        else if (query.sort === 'name_asc') {
            orderBy = { name: 'asc' };
        }
        else if (query.sort === 'name_desc') {
            orderBy = { name: 'desc' };
        }
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: true,
                    variants: { include: { inventory: true } },
                    images: { orderBy: { sortOrder: 'asc' } },
                    collections: { include: { collection: true } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                variants: { include: { inventory: true } },
                images: { orderBy: { sortOrder: 'asc' } },
                collections: { include: { collection: true } },
            },
        });
    }
    async findBySlug(slug, onlyActive = true) {
        return this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                variants: {
                    where: onlyActive ? { status: 'ACTIVE' } : {},
                    include: { inventory: true },
                },
                images: { orderBy: { sortOrder: 'asc' } },
                collections: { include: { collection: true } },
            },
        });
    }
    async findVariantBySku(sku) {
        return this.prisma.productVariant.findUnique({
            where: { sku },
            include: { inventory: true },
        });
    }
    async create(dto) {
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    shortDescription: dto.shortDescription,
                    description: dto.description,
                    brand: dto.brand || 'UniqueVastra',
                    categoryId: dto.categoryId,
                    status: dto.status || client_1.ProductStatus.DRAFT,
                    isFeatured: dto.isFeatured ?? false,
                    isNewArrival: dto.isNewArrival ?? true,
                    isBestSeller: dto.isBestSeller ?? false,
                    fabricDetails: dto.fabricDetails,
                    careInstructions: dto.careInstructions,
                    fit: dto.fit,
                    seoTitle: dto.seoTitle,
                    seoDescription: dto.seoDescription,
                },
            });
            if (dto.images && dto.images.length > 0) {
                await tx.productImage.createMany({
                    data: dto.images.map((img, index) => ({
                        productId: product.id,
                        url: img.url,
                        thumbnailUrl: img.thumbnailUrl,
                        altText: img.altText,
                        sortOrder: img.sortOrder ?? index,
                        isPrimary: img.isPrimary ?? index === 0,
                        variantId: img.variantId,
                    })),
                });
            }
            for (const vDto of dto.variants) {
                const variant = await tx.productVariant.create({
                    data: {
                        productId: product.id,
                        sku: vDto.sku,
                        size: vDto.size,
                        color: vDto.color,
                        colorCode: vDto.colorCode,
                        price: vDto.price,
                        compareAtPrice: vDto.compareAtPrice,
                        costPrice: vDto.costPrice,
                        status: vDto.status || 'ACTIVE',
                    },
                });
                const inventory = await tx.inventory.create({
                    data: {
                        variantId: variant.id,
                        stock: 0,
                        reservedStock: 0,
                        lowStockThreshold: 5,
                    },
                });
                await tx.stockHistory.create({
                    data: {
                        inventoryId: inventory.id,
                        type: client_1.StockAdjustmentType.CORRECTION,
                        quantity: 0,
                        previousStock: 0,
                        newStock: 0,
                        reason: 'Initial variant inventory record created',
                        referenceType: 'VARIANT_CREATION',
                    },
                });
            }
            if (dto.collectionIds && dto.collectionIds.length > 0) {
                await tx.productCollection.createMany({
                    data: dto.collectionIds.map((cId) => ({
                        productId: product.id,
                        collectionId: cId,
                    })),
                });
            }
            return tx.product.findUnique({
                where: { id: product.id },
                include: {
                    category: true,
                    variants: { include: { inventory: true } },
                    images: { orderBy: { sortOrder: 'asc' } },
                    collections: { include: { collection: true } },
                },
            });
        });
    }
    async update(id, dto) {
        return this.prisma.product.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.slug && { slug: dto.slug }),
                ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
                ...(dto.description && { description: dto.description }),
                ...(dto.brand && { brand: dto.brand }),
                ...(dto.categoryId && { categoryId: dto.categoryId }),
                ...(dto.status && { status: dto.status }),
                ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
                ...(dto.isNewArrival !== undefined && { isNewArrival: dto.isNewArrival }),
                ...(dto.isBestSeller !== undefined && { isBestSeller: dto.isBestSeller }),
                ...(dto.fabricDetails !== undefined && { fabricDetails: dto.fabricDetails }),
                ...(dto.careInstructions !== undefined && { careInstructions: dto.careInstructions }),
                ...(dto.fit !== undefined && { fit: dto.fit }),
                ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
                ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
            },
            include: {
                category: true,
                variants: { include: { inventory: true } },
                images: { orderBy: { sortOrder: 'asc' } },
                collections: { include: { collection: true } },
            },
        });
    }
    async setStatus(id, status) {
        return this.prisma.product.update({
            where: { id },
            data: { status },
        });
    }
    async addVariant(productId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const variant = await tx.productVariant.create({
                data: {
                    productId,
                    sku: dto.sku,
                    size: dto.size,
                    color: dto.color,
                    colorCode: dto.colorCode,
                    price: dto.price,
                    compareAtPrice: dto.compareAtPrice,
                    costPrice: dto.costPrice,
                    status: dto.status || 'ACTIVE',
                },
            });
            const inventory = await tx.inventory.create({
                data: {
                    variantId: variant.id,
                    stock: 0,
                    reservedStock: 0,
                    lowStockThreshold: 5,
                },
            });
            await tx.stockHistory.create({
                data: {
                    inventoryId: inventory.id,
                    type: client_1.StockAdjustmentType.CORRECTION,
                    quantity: 0,
                    previousStock: 0,
                    newStock: 0,
                    reason: 'Initial variant inventory record created',
                    referenceType: 'VARIANT_CREATION',
                },
            });
            return tx.productVariant.findUnique({
                where: { id: variant.id },
                include: { inventory: true },
            });
        });
    }
    async addImage(productId, dto) {
        return this.prisma.$transaction(async (tx) => {
            if (dto.isPrimary) {
                await tx.productImage.updateMany({
                    where: { productId },
                    data: { isPrimary: false },
                });
            }
            return tx.productImage.create({
                data: {
                    productId,
                    url: dto.url,
                    thumbnailUrl: dto.thumbnailUrl,
                    altText: dto.altText,
                    sortOrder: dto.sortOrder || 0,
                    isPrimary: dto.isPrimary || false,
                    variantId: dto.variantId,
                },
            });
        });
    }
    async updateImage(imageId, dto) {
        return this.prisma.productImage.update({
            where: { id: imageId },
            data: dto,
        });
    }
    async deleteImage(imageId) {
        return this.prisma.productImage.delete({
            where: { id: imageId },
        });
    }
    async setPrimaryImage(productId, imageId) {
        return this.prisma.$transaction(async (tx) => {
            await tx.productImage.updateMany({
                where: { productId },
                data: { isPrimary: false },
            });
            return tx.productImage.update({
                where: { id: imageId },
                data: { isPrimary: true },
            });
        });
    }
    async reorderImages(productId, items) {
        return this.prisma.$transaction(items.map((item) => this.prisma.productImage.update({
            where: { id: item.imageId },
            data: { sortOrder: item.sortOrder },
        })));
    }
};
exports.ProductsRepository = ProductsRepository;
exports.ProductsRepository = ProductsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsRepository);
//# sourceMappingURL=products.repository.js.map