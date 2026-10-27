import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InspectionsService } from './inspections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  @UseInterceptors(FilesInterceptor('photos', 10))
  async createInspection(
    @GetUser('id') inspectorId: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.inspectionsService.createInspection(inspectorId, {
      ...body,
      photoFiles: files ? files.map((f) => ({ originalname: f.originalname, buffer: f.buffer, mimetype: f.mimetype })) : [],
    });
  }

  @Get('booking/:bookingId')
  async getBookingInspections(@Param('bookingId') bookingId: string) {
    return this.inspectionsService.getInspectionsForBooking(bookingId);
  }
}
