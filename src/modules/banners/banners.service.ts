import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from '../../database/prisma.service';

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

@Injectable()
export class BannersService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.banner.count();
    if (count === 0) {
      for (const banner of INITIAL_BANNERS) {
        await this.prisma.banner.create({ data: banner });
      }
    }
  }

  async findAllActive(position?: string) {
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin(position?: string) {
    return this.prisma.banner.findMany({
      where: position ? { position } : {},
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: createBannerDto,
    });
  }

  async update(id: string, updateBannerDto: UpdateBannerDto) {
    await this.findOne(id);
    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });
  }

  async reorderBanners(items: { id: string; sortOrder: number }[]) {
    const updates = items.map((item) =>
      this.prisma.banner.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    );
    await this.prisma.$transaction(updates);
    return { success: true, message: 'Banners reordered successfully' };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
