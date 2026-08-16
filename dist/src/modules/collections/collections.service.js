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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const collections_repository_1 = require("./repositories/collections.repository");
let CollectionsService = class CollectionsService {
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
        const collection = await this.repository.findBySlug(slug, true);
        if (!collection) {
            throw new common_1.NotFoundException(`Collection with slug '${slug}' not found`);
        }
        return collection;
    }
    async findByIdAdmin(id) {
        const collection = await this.repository.findById(id);
        if (!collection) {
            throw new common_1.NotFoundException(`Collection not found`);
        }
        return collection;
    }
    async create(dto) {
        const existing = await this.repository.findBySlug(dto.slug, false);
        if (existing) {
            throw new common_1.ConflictException(`Collection slug '${dto.slug}' already exists`);
        }
        this.validateDates(dto.startDate, dto.endDate);
        return this.repository.create(dto);
    }
    async update(id, dto) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(`Collection not found`);
        }
        if (dto.slug && dto.slug !== existing.slug) {
            const slugConflict = await this.repository.findBySlug(dto.slug, false);
            if (slugConflict) {
                throw new common_1.ConflictException(`Collection slug '${dto.slug}' already exists`);
            }
        }
        const startDate = dto.startDate !== undefined ? dto.startDate : existing.startDate?.toISOString();
        const endDate = dto.endDate !== undefined ? dto.endDate : existing.endDate?.toISOString();
        this.validateDates(startDate, endDate);
        return this.repository.update(id, dto);
    }
    async archive(id) {
        const collection = await this.repository.findById(id);
        if (!collection) {
            throw new common_1.NotFoundException(`Collection not found`);
        }
        return this.repository.archive(id);
    }
    async addProduct(collectionId, dto) {
        const collection = await this.repository.findById(collectionId);
        if (!collection) {
            throw new common_1.NotFoundException(`Collection not found`);
        }
        return this.repository.addProduct(collectionId, dto.productId, dto.sortOrder || 0);
    }
    async removeProduct(collectionId, productId) {
        return this.repository.removeProduct(collectionId, productId);
    }
    async reorderProducts(collectionId, dto) {
        return this.repository.reorderProducts(collectionId, dto.items);
    }
    validateDates(startDate, endDate) {
        if (startDate && endDate) {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            if (start > end) {
                throw new common_1.BadRequestException('Collection start date must be before or equal to end date');
            }
        }
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [collections_repository_1.CollectionsRepository])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map