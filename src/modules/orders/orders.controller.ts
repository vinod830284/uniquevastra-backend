import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '@prisma/client';

@ApiTags('Checkout & Orders (Customer)')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PublicOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout/preview')
  @ApiOperation({ summary: 'Preview checkout calculation (without creating order or reserving stock)' })
  async previewCheckout(
    @CurrentUser('userId') userId: string,
    @Body('addressId') addressId?: string,
    @Body('couponCode') couponCode?: string,
  ) {
    return this.ordersService.previewCheckout(userId, addressId, couponCode);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Checkout and create a new order from active cart' })
  @ApiHeader({ name: 'idempotency-key', required: false, description: 'Optional key to prevent duplicate checkouts' })
  async createOrder(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.ordersService.createOrder(userId, dto, idempotencyKey);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get list of authenticated customer orders' })
  async findUserOrders(
    @CurrentUser('userId') userId: string,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findUserOrders(userId, query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get detailed customer order by ID' })
  async findUserOrderDetail(
    @CurrentUser('userId') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.findUserOrderDetail(userId, orderId);
  }

  @Post('orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel an eligible customer order (releases inventory reservation)' })
  async cancelOrder(
    @CurrentUser('userId') userId: string,
    @Param('id') orderId: string,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(userId, orderId, reason);
  }
}

@ApiTags('Orders (Admin)')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER)
@ApiBearerAuth()
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Query all customer orders with filters and search (Admin)' })
  async findAllAdmin(@Query() query: OrderQueryDto) {
    return this.ordersService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full admin order detail including status history (Admin)' })
  async findByIdAdmin(@Param('id') orderId: string) {
    return this.ordersService.findByIdAdmin(orderId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status with state machine transition validation (Admin)' })
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('userId') adminUserId: string,
  ) {
    return this.ordersService.updateStatusAdmin(orderId, dto, adminUserId);
  }
}
