import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryStatus } from '@prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(onlyActive = true) {
    return this.prisma.category.findMany({
      where: onlyActive ? { status: CategoryStatus.ACTIVE } : {},
      include: {
        children: {
          where: onlyActive ? { status: CategoryStatus.ACTIVE } : {},
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });
  }

  async findBySlug(slug: string, onlyActive = true) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: onlyActive ? { status: CategoryStatus.ACTIVE } : {},
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

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async archive(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { status: CategoryStatus.ARCHIVED },
    });
  }
}
