import { Module } from '@nestjs/common';
import { BaleService } from './bale.service';

@Module({
  providers: [BaleService],
  exports: [BaleService],
})
export class BaleModule {}
