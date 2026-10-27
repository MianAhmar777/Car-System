import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ContractStatus } from '@prisma/client';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('generate/:bookingId')
  async generateContract(@Param('bookingId') bookingId: string) {
    return this.contractsService.generateContractForBooking(bookingId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async getAllContracts(@Query('status') status?: ContractStatus) {
    return this.contractsService.findAllContracts(status);
  }

  @Get(':id')
  async getContract(@Param('id') id: string, @GetUser() user: any) {
    return this.contractsService.findContractById(id, user);
  }

  @Post(':id/sign-online')
  async signContractOnline(
    @Param('id') contractId: string,
    @GetUser('id') userId: string,
    @Body('signatureData') signatureData: string,
    @Req() req: Request,
  ) {
    if (!signatureData) throw new BadRequestException('Signature data is required.');
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.contractsService.signContractOnline(contractId, userId, signatureData, ip, userAgent);
  }

  @Post(':id/upload-signed')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSignedContract(
    @Param('id') contractId: string,
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Signed PDF file is required.');
    return this.contractsService.uploadSignedContractDocument(contractId, userId, file);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async reviewContract(
    @Param('id') contractId: string,
    @GetUser('id') reviewerId: string,
    @Body('approved') approved: boolean,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.contractsService.reviewContract(contractId, reviewerId, approved, rejectionReason);
  }
}
