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
exports.CategoriesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
const client_1 = require("@prisma/client");
let CategoriesRepository = class CategoriesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(onlyActive = true) {
        return this.prisma.category.findMany({
            where: onlyActive ? { status: client_1.CategoryStatus.ACTIVE } : {},
            include: {
                children: {
                    where: onlyActive ? { status: client_1.CategoryStatus.ACTIVE } : {},
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findById(id) {
        return this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                _count: { select: { products: true } },
            },
        });
    }
    async findBySlug(slug, onlyActive = true) {
        return this.prisma.category.findUnique({
            where: { slug },
            include: {
                children: {
                    where: onlyActive ? { status: client_1.CategoryStatus.ACTIVE } : {},
                },
                products: {
                    where: onlyActive ? { status: 'ACTIVE' } : {},
                    include: {
                        variants: { where: onlyActive ? { status: 'ACTIVE' } : {} },
                        images: { orderBy: { sortOrder: 'asc' } },
                    },
                },
            },
        });
    }
    async create(dto) {
        return this.prisma.category.create({
            data: dto,
        });
    }
    async update(id, dto) {
        return this.prisma.category.update({
            where: { id },
            data: dto,
        });
    }
    async archive(id) {
        return this.prisma.category.update({
            where: { id },
            data: { status: client_1.CategoryStatus.ARCHIVED },
        });
    }
};
exports.CategoriesRepository = CategoriesRepository;
exports.CategoriesRepository = CategoriesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesRepository);
//# sourceMappingURL=categories.repository.js.map