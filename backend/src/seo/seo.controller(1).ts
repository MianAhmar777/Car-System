import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { SeoService } from './seo.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('robots.txt')
  async getRobotsTxt(@Res() res: Response) {
    const content = await this.seoService.getRobotsTxt();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(content);
  }

  @Get('sitemap.xml')
  async getSitemapXml(@Res() res: Response) {
    const xml = await this.seoService.getSitemapXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  }

  @Get('overview')
  async getSeoOverview() {
    return this.seoService.getSeoOverview();
  }
}
