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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Cart Coupons (Customer)')
@Controller('cart/coupon')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PublicCartCouponController {
  constructor(
    private readonly couponsService: CouponsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Apply coupon code to active customer cart' })
  async applyCoupon(
    @CurrentUser('userId') userId: string,
    @Body() dto: ApplyCouponDto,
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty. Add items before applying coupon.');
    }

    const subtotal = cart.items.reduce((acc, item) => {
      const price = Number(item.variant.price);
      return acc + price * item.quantity;
    }, 0);

    const validation = await this.couponsService.validateCoupon(dto.code, userId, subtotal);

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: validation.coupon.code },
    });

    return {
      message: `Coupon '${validation.coupon.code}' applied successfully`,
      coupon: {
        code: validation.coupon.code,
        type: validation.coupon.type,
        value: Number(validation.coupon.value),
        discountAmount: validation.discountAmount,
      },
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Remove applied coupon code from cart' })
  async removeCoupon(@CurrentUser('userId') userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { couponCode: null },
      });
    }
    return { message: 'Coupon removed from cart' };
  }
}

@ApiTags('Coupons (Admin)')
@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER)
@ApiBearerAuth()
export class AdminCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @ApiOperation({ summary: 'List all promotional coupons with pagination (Admin)' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.couponsService.findAllAdmin(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon details by ID (Admin)' })
  async findById(@Param('id') id: string) {
    return this.couponsService.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new coupon (Admin)' })
  async create(@Body() dto: CreateCouponDto) {
    return this.couponsService.createCoupon(dto);
  }

  @Patch(':id/disable')
  @ApiOperation({ summary: 'Disable coupon (Admin)' })
  async disable(@Param('id') id: string) {
    return this.couponsService.disableCoupon(id);
  }

  @Patch(':id/enable')
  @ApiOperation({ summary: 'Enable coupon (Admin)' })
  async enable(@Param('id') id: string) {
    return this.couponsService.enableCoupon(id);
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get audit usage history for a coupon (Admin)' })
  async getUsage(@Param('id') id: string) {
    return this.couponsService.getUsages(id);
  }
}
