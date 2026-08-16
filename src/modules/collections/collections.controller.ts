import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddCollectionProductDto, ReorderCollectionProductsDto } from './dto/collection-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@ApiTags('Collections (Public Catalog)')
@Controller('collections')
export class PublicCollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active collections for customer catalog' })
  async findAll() {
    return this.collectionsService.findAllPublic();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get active collection and its products by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.collectionsService.findBySlug(slug);
  }
}

@ApiTags('Collections (Admin)')
@Controller('admin/collections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER)
@ApiBearerAuth()
export class AdminCollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all collections including drafts & archived (Admin)' })
  async findAll() {
    return this.collectionsService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection by ID (Admin)' })
  async findById(@Param('id') id: string) {
    return this.collectionsService.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create collection (Admin)' })
  async create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update collection (Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, dto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive collection (Admin)' })
  async archive(@Param('id') id: string) {
    return this.collectionsService.archive(id);
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Add product to collection (Admin)' })
  async addProduct(@Param('id') collectionId: string, @Body() dto: AddCollectionProductDto) {
    return this.collectionsService.addProduct(collectionId, dto);
  }

  @Delete(':id/products/:productId')
  @ApiOperation({ summary: 'Remove product from collection (Admin)' })
  async removeProduct(
    @Param('id') collectionId: string,
    @Param('productId') productId: string,
  ) {
    return this.collectionsService.removeProduct(collectionId, productId);
  }

  @Patch(':id/products/reorder')
  @ApiOperation({ summary: 'Reorder products within collection (Admin)' })
  async reorderProducts(
    @Param('id') collectionId: string,
    @Body() dto: ReorderCollectionProductsDto,
  ) {
    return this.collectionsService.reorderProducts(collectionId, dto);
  }
}
