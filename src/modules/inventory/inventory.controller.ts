import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { ReleaseStockDto } from './dto/release-stock.dto';
import { UpdateThresholdDto } from './dto/update-threshold.dto';
import { BulkAdjustDto } from './dto/bulk-adjust.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '@prisma/client';

@ApiTags('Inventory Management (Admin)')
@Controller('admin/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER)
@ApiBearerAuth()
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get total inventory summary metrics' })
  async getSummary() {
    return this.inventoryService.getSummary();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get list of variants in low stock' })
  async getLowStock(@Query() query: InventoryQueryDto) {
    return this.inventoryService.getLowStock(query);
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Get list of variants completely out of stock' })
  async getOutOfStock(@Query() query: InventoryQueryDto) {
    return this.inventoryService.getOutOfStock(query);
  }

  @Get()
  @ApiOperation({ summary: 'Query inventory list with filters, search, and pagination' })
  async findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAllAdmin(query);
  }

  @Post('bulk-adjust')
  @ApiOperation({ summary: 'Perform bulk stock adjustment transactionally (Admin)' })
  async bulkAdjust(
    @Body() dto: BulkAdjustDto,
    @CurrentUser('userId') adminUserId: string,
  ) {
    return this.inventoryService.bulkAdjust(dto, adminUserId);
  }

  @Get(':variantId')
  @ApiOperation({ summary: 'Get single variant inventory status & calculations' })
  async findByVariantId(@Param('variantId') variantId: string) {
    return this.inventoryService.findByVariantId(variantId);
  }

  @Post(':variantId/adjust')
  @ApiOperation({ summary: 'Adjust variant stock (STOCK_IN, STOCK_OUT, CORRECTION, DAMAGE)' })
  async adjustStock(
    @Param('variantId') variantId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser('userId') adminUserId: string,
  ) {
    return this.inventoryService.adjustStock(variantId, dto, adminUserId);
  }

  @Post(':variantId/reserve')
  @ApiOperation({ summary: 'Reserve stock for checkout (Admin / System)' })
  async reserveStock(
    @Param('variantId') variantId: string,
    @Body() dto: ReserveStockDto,
    @CurrentUser('userId') adminUserId: string,
  ) {
    return this.inventoryService.reserveStock(
      variantId,
      dto.quantity,
      dto.reason || 'Admin reservation',
      adminUserId,
    );
  }

  @Post(':variantId/release')
  @ApiOperation({ summary: 'Release reserved stock (Admin / System)' })
  async releaseStock(
    @Param('variantId') variantId: string,
    @Body() dto: ReleaseStockDto,
    @CurrentUser('userId') adminUserId: string,
  ) {
    return this.inventoryService.releaseStock(
      variantId,
      dto.quantity,
      dto.reason || 'Admin reservation release',
      adminUserId,
    );
  }

  @Get(':variantId/history')
  @ApiOperation({ summary: 'Get stock audit history for a variant' })
  async getHistory(@Param('variantId') variantId: string) {
    return this.inventoryService.getHistory(variantId);
  }

  @Patch(':variantId/threshold')
  @ApiOperation({ summary: 'Update low stock alert threshold for a variant' })
  async updateThreshold(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateThresholdDto,
  ) {
    return this.inventoryService.updateThreshold(variantId, dto.threshold);
  }
}
