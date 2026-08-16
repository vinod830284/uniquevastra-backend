import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsRepository } from './repositories/coupons.repository';
import { PublicCartCouponController, AdminCouponsController } from './coupons.controller';

@Module({
  controllers: [PublicCartCouponController, AdminCouponsController],
  providers: [CouponsService, CouponsRepository],
  exports: [CouponsService, CouponsRepository],
})
export class CouponsModule {}
