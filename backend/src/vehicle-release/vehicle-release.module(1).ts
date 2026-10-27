import { Module } from '@nestjs/common';
import { VehicleReleaseService } from './vehicle-release.service';
import { VehicleReleaseController } from './vehicle-release.controller';

@Module({
  controllers: [VehicleReleaseController],
  providers: [VehicleReleaseService],
  exports: [VehicleReleaseService],
})
export class VehicleReleaseModule {}
