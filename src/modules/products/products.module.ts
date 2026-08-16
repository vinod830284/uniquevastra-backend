import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { PublicProductsController, AdminProductsController } from './products.controller';

@Module({
  controllers: [PublicProductsController, AdminProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
