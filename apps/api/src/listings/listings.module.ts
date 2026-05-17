import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { R2Service } from './r2.service';

@Module({
  controllers: [ListingsController],
  providers: [ListingsService, R2Service],
  exports: [ListingsService],
})
export class ListingsModule {}
