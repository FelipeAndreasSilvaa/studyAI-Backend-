import { Injectable, NotFoundException } from '@nestjs/common';

import { DocumentsRepository } from './repository/documents.repository';

import { PdfService } from '../../common/ai/services/pdf.service';

import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async listDocuments(userId: string) {
    return this.documentsRepository.findByUserId(userId);
  }

  async uploadDocument(userId: string, file: Express.Multer.File) {
    // salva documento banco
    const document = await this.documentsRepository.create({
      userId,

      title: file.originalname,

      fileUrl: file.path,

      status: 'PROCESSING',
    });

    // extrai texto
    const text = await this.pdfService.extractText(file.path);

    console.log(text);

    return document;
  }

  async deleteDocument(
    userId: string,
    documentId: string,
  ) {
    const document =
      await this.prisma.document.findFirst({
        where: {
          id: documentId,
  
          userId,
        },
      });
  
    if (!document) {
      throw new NotFoundException(
        'Documento não encontrado',
      );
    }
  
    // remove arquivo físico
    if (fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }
  
    // remove banco
    await this.prisma.document.delete({
      where: {
        id: documentId,
      },
    });
  
    return {
      success: true,
    };
  }
}
