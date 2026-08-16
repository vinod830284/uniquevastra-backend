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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const INITIAL_BANNERS = [
    {
        title: 'URBAN SHADOWS',
        subtitle: 'Oversized luxury streetwear essentials made for everyday expression.',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80',
        badge: 'NEW DROP 2026',
        buttonText: 'EXPLORE DROP',
        position: 'hero_carousel',
        actionType: 'category',
        actionId: 'cat_oversized',
        sortOrder: 1,
        isActive: true,
    },
    {
        title: 'CYBERPUNK CORE',
        subtitle: 'Heavyweight 240 GSM organic French Terry tees & futuristic graphics.',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1000&auto=format&fit=crop&q=80',
        badge: 'LIMITED EDITION',
        buttonText: 'SHOP COLLECTION',
        position: 'hero_carousel',
        actionType: 'category',
        actionId: 'cat_hoodies',
        sortOrder: 2,
        isActive: true,
    },
    {
        title: 'MONOCHROME EDITIONS',
        subtitle: 'Minimalist luxury aesthetic for modern street fashion enthusiasts.',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80',
        badge: 'EXCLUSIVE',
        buttonText: 'VIEW LOOKBOOK',
        position: 'hero_carousel',
        actionType: 'category',
        actionId: 'cat_all',
        sortOrder: 3,
        isActive: true,
    },
];
let BannersService = class BannersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const count = await this.prisma.banner.count();
        if (count === 0) {
            for (const banner of INITIAL_BANNERS) {
                await this.prisma.banner.create({ data: banner });
            }
        }
    }
    async findAllActive(position) {
        return this.prisma.banner.findMany({
            where: {
                isActive: true,
                ...(position ? { position } : {}),
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findAllAdmin(position) {
        return this.prisma.banner.findMany({
            where: position ? { position } : {},
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findOne(id) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner) {
            throw new common_1.NotFoundException(`Banner with ID ${id} not found`);
        }
        return banner;
    }
    async create(createBannerDto) {
        return this.prisma.banner.create({
            data: createBannerDto,
        });
    }
    async update(id, updateBannerDto) {
        await this.findOne(id);
        return this.prisma.banner.update({
            where: { id },
            data: updateBannerDto,
        });
    }
    async reorderBanners(items) {
        const updates = items.map((item) => this.prisma.banner.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
        }));
        await this.prisma.$transaction(updates);
        return { success: true, message: 'Banners reordered successfully' };
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.banner.delete({
            where: { id },
        });
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BannersService);
//# sourceMappingURL=banners.service.js.map