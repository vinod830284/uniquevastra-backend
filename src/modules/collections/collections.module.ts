import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsRepository } from './repositories/collections.repository';
import { PublicCollectionsController, AdminCollectionsController } from './collections.controller';

@Module({
  controllers: [PublicCollectionsController, AdminCollectionsController],
  providers: [CollectionsService, CollectionsRepository],
  exports: [CollectionsService, CollectionsRepository],
})
export class CollectionsModule {}
