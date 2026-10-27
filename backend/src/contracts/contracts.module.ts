import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService, PdfGeneratorService],
  exports: [ContractsService],
})
export class ContractsModule {}
