import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '@prisma/client';

@ApiTags('Payments (Customer)')
@Controller()
export class PublicPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders/:orderId/payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment order attempt for customer order' })
  async createPayment(
    @CurrentUser('userId') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(userId, orderId, dto);
  }

  @Post('orders/:orderId/payment/retry')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retry payment for unpaid customer order' })
  async retryPayment(
    @CurrentUser('userId') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(userId, orderId, dto);
  }

  @Post('payments/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment provider signature and confirm order' })
  async verifyPayment(
    @CurrentUser('userId') userId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(userId, dto);
  }

  @Get('orders/:orderId/payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment attempt history for an order' })
  async getOrderPayments(
    @CurrentUser('userId') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.getOrderPayments(userId, orderId);
  }

  @Post('payments/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Public payment provider webhook receiver (Razorpay/HMAC verified)' })
  @ApiHeader({ name: 'x-razorpay-signature', required: false })
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    const rawBody = JSON.stringify(payload);
    return this.paymentsService.handleWebhook(rawBody, signature || '', payload);
  }
}

@ApiTags('Payments (Admin)')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MANAGER)
@ApiBearerAuth()
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Query payment attempts with filters and pagination (Admin)' })
  async findAll(@Query() query: PaymentQueryDto) {
    return this.paymentsService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment detail & audit events by ID (Admin)' })
  async findById(@Param('id') id: string) {
    return this.paymentsService.findByIdAdmin(id);
  }
}
