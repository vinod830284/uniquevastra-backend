import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@ApiTags('Categories (Public Catalog)')
@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get active category tree for customer catalog' })
  async findAll() {
    return this.categoriesService.findAllPublic();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get active category and its products by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}

@ApiTags('Categories (Admin)')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER)
@ApiBearerAuth()
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories including drafts & archived (Admin)' })
  async findAll() {
    return this.categoriesService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID (Admin)' })
  async findById(@Param('id') id: string) {
    return this.categoriesService.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new category (Admin)' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category (Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive category (Admin)' })
  async archive(@Param('id') id: string) {
    return this.categoriesService.archive(id);
  }
}
