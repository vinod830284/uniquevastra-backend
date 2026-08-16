import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { CartController } from './cart.controller';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
