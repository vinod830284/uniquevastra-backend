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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const products_repository_1 = require("./repositories/products.repository");
const product_response_dto_1 = require("./dto/product-response.dto");
const pricing_util_1 = require("../../common/utils/pricing.util");
const client_1 = require("@prisma/client");
let ProductsService = class ProductsService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findAllPublic(query) {
        const result = await this.repository.findAll(query, true);
        return {
            items: result.items.map((item) => product_response_dto_1.PublicProductResponseDto.fromEntity(item)),
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
    async findAllAdmin(query) {
        const result = await this.repository.findAll(query, false);
        return {
            items: result.items.map((item) => product_response_dto_1.AdminProductResponseDto.fromEntity(item)),
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
    async findBySlugPublic(slug) {
        const product = await this.repository.findBySlug(slug, true);
        if (!product || product.status !== client_1.ProductStatus.ACTIVE) {
            throw new common_1.NotFoundException(`Product with slug '${slug}' not found`);
        }
        return product_response_dto_1.PublicProductResponseDto.fromEntity(product);
    }
    async findByIdAdmin(id) {
        const product = await this.repository.findById(id);
        if (!product) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        return product_response_dto_1.AdminProductResponseDto.fromEntity(product);
    }
    async create(dto) {
        const existingSlug = await this.repository.findBySlug(dto.slug, false);
        if (existingSlug) {
            throw new common_1.ConflictException(`Product slug '${dto.slug}' already exists`);
        }
        for (const vDto of dto.variants) {
            pricing_util_1.PricingUtil.validatePricing(vDto);
            const existingSku = await this.repository.findVariantBySku(vDto.sku);
            if (existingSku) {
                throw new common_1.ConflictException(`SKU '${vDto.sku}' already exists`);
            }
        }
        const created = await this.repository.create(dto);
        return product_response_dto_1.AdminProductResponseDto.fromEntity(created);
    }
    async update(id, dto) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        if (dto.slug && dto.slug !== existing.slug) {
            const slugConflict = await this.repository.findBySlug(dto.slug, false);
            if (slugConflict) {
                throw new common_1.ConflictException(`Product slug '${dto.slug}' already exists`);
            }
        }
        const updated = await this.repository.update(id, dto);
        return product_response_dto_1.AdminProductResponseDto.fromEntity(updated);
    }
    async publish(id) {
        const product = await this.repository.findById(id);
        if (!product) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        const errors = [];
        if (!product.name || product.name.trim() === '') {
            errors.push('Product name is required');
        }
        if (!product.categoryId) {
            errors.push('Product category is required');
        }
        if (!product.variants || product.variants.length === 0) {
            errors.push('Product must have at least one variant before publishing');
        }
        else {
            const activeVariants = product.variants.filter((v) => v.status === 'ACTIVE');
            if (activeVariants.length === 0) {
                errors.push('Product must have at least one ACTIVE variant');
            }
        }
        if (!product.images || product.images.length === 0) {
            errors.push('Product must have at least one product image before publishing');
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Cannot publish product due to incomplete metadata',
                errors,
            });
        }
        const published = await this.repository.setStatus(id, client_1.ProductStatus.ACTIVE);
        return {
            message: 'Product published successfully to customer catalog',
            status: published.status,
        };
    }
    async archive(id) {
        const product = await this.repository.findById(id);
        if (!product) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        const archived = await this.repository.setStatus(id, client_1.ProductStatus.ARCHIVED);
        return {
            message: 'Product archived successfully',
            status: archived.status,
        };
    }
    async duplicate(id) {
        const source = await this.repository.findById(id);
        if (!source) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        const timestamp = Date.now().toString().slice(-6);
        const newSlug = `${source.slug}-copy-${timestamp}`;
        const duplicateDto = {
            name: `${source.name} (Copy)`,
            slug: newSlug,
            shortDescription: source.shortDescription || undefined,
            description: source.description,
            brand: source.brand,
            categoryId: source.categoryId,
            status: client_1.ProductStatus.DRAFT,
            isFeatured: false,
            isNewArrival: false,
            isBestSeller: false,
            fabricDetails: source.fabricDetails || undefined,
            careInstructions: source.careInstructions || undefined,
            fit: source.fit || undefined,
            seoTitle: source.seoTitle || undefined,
            seoDescription: source.seoDescription || undefined,
            images: source.images.map((img) => ({
                url: img.url,
                thumbnailUrl: img.thumbnailUrl || undefined,
                altText: img.altText || undefined,
                sortOrder: img.sortOrder,
                isPrimary: img.isPrimary,
            })),
            variants: source.variants.map((v) => ({
                sku: `${v.sku}-COPY-${timestamp}`,
                size: v.size,
                color: v.color,
                colorCode: v.colorCode || undefined,
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
                costPrice: v.costPrice ? Number(v.costPrice) : undefined,
                status: v.status,
            })),
        };
        const created = await this.repository.create(duplicateDto);
        return product_response_dto_1.AdminProductResponseDto.fromEntity(created);
    }
    async addVariant(productId, dto) {
        const product = await this.repository.findById(productId);
        if (!product) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        pricing_util_1.PricingUtil.validatePricing(dto);
        const existingSku = await this.repository.findVariantBySku(dto.sku);
        if (existingSku) {
            throw new common_1.ConflictException(`SKU '${dto.sku}' already exists`);
        }
        return this.repository.addVariant(productId, dto);
    }
    async addImage(productId, dto) {
        const product = await this.repository.findById(productId);
        if (!product) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        return this.repository.addImage(productId, dto);
    }
    async deleteImage(productId, imageId) {
        const product = await this.repository.findById(productId);
        if (!product) {
            throw new common_1.NotFoundException(`Product not found`);
        }
        return this.repository.deleteImage(imageId);
    }
    async reorderImages(productId, dto) {
        return this.repository.reorderImages(productId, dto.items);
    }
    async setPrimaryImage(productId, imageId) {
        return this.repository.setPrimaryImage(productId, imageId);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_repository_1.ProductsRepository])
], ProductsService);
//# sourceMappingURL=products.service.js.map