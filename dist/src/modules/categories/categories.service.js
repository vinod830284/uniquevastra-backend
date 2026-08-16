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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const categories_repository_1 = require("./repositories/categories.repository");
let CategoriesService = class CategoriesService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findAllPublic() {
        return this.repository.findAll(true);
    }
    async findAllAdmin() {
        return this.repository.findAll(false);
    }
    async findBySlug(slug) {
        const category = await this.repository.findBySlug(slug, true);
        if (!category) {
            throw new common_1.NotFoundException(`Category with slug '${slug}' not found`);
        }
        return category;
    }
    async findByIdAdmin(id) {
        const category = await this.repository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category not found`);
        }
        return category;
    }
    async create(dto) {
        const existing = await this.repository.findBySlug(dto.slug, false);
        if (existing) {
            throw new common_1.ConflictException(`Category slug '${dto.slug}' already exists`);
        }
        if (dto.parentId) {
            const parent = await this.repository.findById(dto.parentId);
            if (!parent) {
                throw new common_1.NotFoundException(`Parent category with ID '${dto.parentId}' not found`);
            }
        }
        return this.repository.create(dto);
    }
    async update(id, dto) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Category not found`);
        }
        if (dto.slug && dto.slug !== existing.slug) {
            const slugConflict = await this.repository.findBySlug(dto.slug, false);
            if (slugConflict) {
                throw new common_1.ConflictException(`Category slug '${dto.slug}' already exists`);
            }
        }
        if (dto.parentId) {
            if (dto.parentId === id) {
                throw new common_1.BadRequestException('A category cannot be its own parent');
            }
            await this.validateNoCircularHierarchy(id, dto.parentId);
        }
        return this.repository.update(id, dto);
    }
    async archive(id) {
        const category = await this.repository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category not found`);
        }
        const productCount = category._count?.products || 0;
        const archived = await this.repository.archive(id);
        return {
            message: productCount > 0
                ? `Category archived. Note: ${productCount} products still reference this category.`
                : 'Category archived successfully.',
            category: archived,
        };
    }
    async validateNoCircularHierarchy(targetId, newParentId) {
        let currentParentId = newParentId;
        while (currentParentId) {
            if (currentParentId === targetId) {
                throw new common_1.BadRequestException('Circular relationship detected: Parent category cannot be a descendant of this category');
            }
            const parent = await this.repository.findById(currentParentId);
            currentParentId = parent ? parent.parentId : null;
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [categories_repository_1.CategoriesRepository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map