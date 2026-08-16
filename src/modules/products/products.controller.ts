import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { AddProductImageDto, ReorderProductImagesDto } from './dto/image-management.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@ApiTags('Products (Public Catalog)')
@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Query customer product catalog with filters, search, and pagination' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAllPublic(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get single active product detail page by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlugPublic(slug);
  }
}

@ApiTags('Products (Admin)')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER)
@ApiBearerAuth()
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products including draft & archived with cost prices (Admin)' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed product by ID (Admin)' })
  async findById(@Param('id') id: string) {
    return this.productsService.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new product with variants & images (Admin)' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product metadata (Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Validate & publish product to customer catalog (Admin)' })
  async publish(@Param('id') id: string) {
    return this.productsService.publish(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive product (Soft Delete - Admin)' })
  async archive(@Param('id') id: string) {
    return this.productsService.archive(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate product as a new DRAFT with unique SKUs (Admin)' })
  async duplicate(@Param('id') id: string) {
    return this.productsService.duplicate(id);
  }

  @Post(':id/variants')
  @ApiOperation({ summary: 'Add a new variant to product (Admin)' })
  async addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.productsService.addVariant(id, dto);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add an image to product (Admin)' })
  async addImage(@Param('id') id: string, @Body() dto: AddProductImageDto) {
    return this.productsService.addImage(id, dto);
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Delete product image (Admin)' })
  async deleteImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.deleteImage(id, imageId);
  }

  @Patch(':id/images/reorder')
  @ApiOperation({ summary: 'Reorder product images (Admin)' })
  async reorderImages(@Param('id') id: string, @Body() dto: ReorderProductImagesDto) {
    return this.productsService.reorderImages(id, dto);
  }

  @Patch(':id/images/:imageId/primary')
  @ApiOperation({ summary: 'Set primary product image (Admin)' })
  async setPrimaryImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.setPrimaryImage(id, imageId);
  }
}
