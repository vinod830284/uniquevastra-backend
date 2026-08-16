import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CollectionsRepository } from './repositories/collections.repository';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddCollectionProductDto, ReorderCollectionProductsDto } from './dto/collection-product.dto';

@Injectable()
export class CollectionsService {
  constructor(private repository: CollectionsRepository) {}

  async findAllPublic() {
    return this.repository.findAll(true);
  }

  async findAllAdmin() {
    return this.repository.findAll(false);
  }

  async findBySlug(slug: string) {
    const collection = await this.repository.findBySlug(slug, true);
    if (!collection) {
      throw new NotFoundException(`Collection with slug '${slug}' not found`);
    }
    return collection;
  }

  async findByIdAdmin(id: string) {
    const collection = await this.repository.findById(id);
    if (!collection) {
      throw new NotFoundException(`Collection not found`);
    }
    return collection;
  }

  async create(dto: CreateCollectionDto) {
    const existing = await this.repository.findBySlug(dto.slug, false);
    if (existing) {
      throw new ConflictException(`Collection slug '${dto.slug}' already exists`);
    }

    this.validateDates(dto.startDate, dto.endDate);

    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateCollectionDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Collection not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugConflict = await this.repository.findBySlug(dto.slug, false);
      if (slugConflict) {
        throw new ConflictException(`Collection slug '${dto.slug}' already exists`);
      }
    }

    const startDate = dto.startDate !== undefined ? dto.startDate : existing.startDate?.toISOString();
    const endDate = dto.endDate !== undefined ? dto.endDate : existing.endDate?.toISOString();
    this.validateDates(startDate, endDate);

    return this.repository.update(id, dto);
  }

  async archive(id: string) {
    const collection = await this.repository.findById(id);
    if (!collection) {
      throw new NotFoundException(`Collection not found`);
    }
    return this.repository.archive(id);
  }

  async addProduct(collectionId: string, dto: AddCollectionProductDto) {
    const collection = await this.repository.findById(collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection not found`);
    }
    return this.repository.addProduct(collectionId, dto.productId, dto.sortOrder || 0);
  }

  async removeProduct(collectionId: string, productId: string) {
    return this.repository.removeProduct(collectionId, productId);
  }

  async reorderProducts(collectionId: string, dto: ReorderCollectionProductsDto) {
    return this.repository.reorderProducts(collectionId, dto.items);
  }

  private validateDates(startDate?: string | null, endDate?: string | null): void {
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      if (start > end) {
        throw new BadRequestException('Collection start date must be before or equal to end date');
      }
    }
  }
}
