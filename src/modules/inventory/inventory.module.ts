import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryTransactionService } from './inventory-transaction.service';
import { InventoryRepository } from './repositories/inventory.repository';
import { AdminInventoryController } from './inventory.controller';

@Module({
  controllers: [AdminInventoryController],
  providers: [InventoryService, InventoryTransactionService, InventoryRepository],
  exports: [InventoryService, InventoryTransactionService, InventoryRepository],
})
export class InventoryModule {}
