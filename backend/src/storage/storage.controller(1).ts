import { Controller, Get, Param, Res, HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('file/:bucket/*path')
  async serveFile(
    @Param('bucket') bucket: string,
    @Param('path') filePath: string | string[],
    @Res() res: Response,
  ) {
    try {
      const pathString = Array.isArray(filePath) ? filePath.join('/') : (filePath || (res.req.params as any)[0] || '');
      const buffer = await this.storageService.getFileBuffer(bucket, pathString);
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      throw new NotFoundException('File not found or access denied.');
    }
  }
}
