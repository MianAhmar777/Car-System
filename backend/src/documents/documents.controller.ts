import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { DocumentType, VerificationStatus } from '@prisma/client';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @GetUser('id') userId: string,
    @Body('documentType') documentType: DocumentType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }
    if (!documentType) {
      throw new BadRequestException('Document type is required (CNIC, PASSPORT, DRIVING_LICENSE, PROOF_OF_ADDRESS).');
    }
    return this.documentsService.uploadCustomerDocument(userId, documentType, file);
  }

  @Get('my-documents')
  async getMyDocuments(@GetUser('id') userId: string) {
    return this.documentsService.getUserDocuments(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async getAllDocuments(@Query('status') status?: VerificationStatus) {
    return this.documentsService.getAllDocuments(status);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async verifyDocument(
    @Param('id') id: string,
    @GetUser('id') reviewerId: string,
    @Body('approved') approved: boolean,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.documentsService.verifyDocument(id, reviewerId, approved, rejectionReason);
  }
}
