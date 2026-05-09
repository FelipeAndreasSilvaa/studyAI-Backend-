import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  Delete,
  Param,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req) {
    return this.documentsService.listDocuments(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.documentsService.uploadDocument(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    return this.documentsService.deleteDocument(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.id, id);
  }
}
