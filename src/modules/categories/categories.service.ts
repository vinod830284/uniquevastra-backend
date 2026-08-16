import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private repository: CategoriesRepository) {}

  async findAllPublic() {
    return this.repository.findAll(true);
  }

  async findAllAdmin() {
    return this.repository.findAll(false);
  }

  async findBySlug(slug: string) {
    const category = await this.repository.findBySlug(slug, true);
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  async findByIdAdmin(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.repository.findBySlug(dto.slug, false);
    if (existing) {
      throw new ConflictException(`Category slug '${dto.slug}' already exists`);
    }

    if (dto.parentId) {
      const parent = await this.repository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent category with ID '${dto.parentId}' not found`);
      }
    }

    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Category not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugConflict = await this.repository.findBySlug(dto.slug, false);
      if (slugConflict) {
        throw new ConflictException(`Category slug '${dto.slug}' already exists`);
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      await this.validateNoCircularHierarchy(id, dto.parentId);
    }

    return this.repository.update(id, dto);
  }

  async archive(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    const productCount = category._count?.products || 0;
    const archived = await this.repository.archive(id);

    return {
      message:
        productCount > 0
          ? `Category archived. Note: ${productCount} products still reference this category.`
          : 'Category archived successfully.',
      category: archived,
    };
  }

  private async validateNoCircularHierarchy(targetId: string, newParentId: string): Promise<void> {
    let currentParentId: string | null = newParentId;

    while (currentParentId) {
      if (currentParentId === targetId) {
        throw new BadRequestException(
          'Circular relationship detected: Parent category cannot be a descendant of this category',
        );
      }
      const parent = await this.repository.findById(currentParentId);
      currentParentId = parent ? parent.parentId : null;
    }
  }
}
