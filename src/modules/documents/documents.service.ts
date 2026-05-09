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

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
  ) {
    // 1. Criar documento
    const document =
      await this.documentsRepository.create({
        userId,
        title: file.originalname,
        fileUrl: file.path,
        status: 'PROCESSING',
      });
  
    try {
      // 2. Extrair texto do PDF
      const text =
        await this.pdfService.extractText(file.path);
  
      // 3. Salvar texto extraído
      await this.prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          extractedText: text,
        },
      });
  
      // 4. Gerar chunks
      const chunkSize = 1000;
      const chunkOverlap = 200;
  
      const chunks: string[] = [];
  
      for (
        let i = 0;
        i < text.length;
        i += chunkSize - chunkOverlap
      ) {
        chunks.push(
          text.slice(i, i + chunkSize),
        );
      }
  
      // 5. Salvar chunks
      await this.prisma.documentChunk.createMany({
        data: chunks.map((chunk, index) => ({
          documentId: document.id,
          chunkText: chunk,
          index
        })),
      });
  
      // 6. Atualizar status
      await this.prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          status: 'READY',
        },
      });
  
      // 7. Retornar documento atualizado
      return this.prisma.document.findUnique({
        where: {
          id: document.id,
        },
        include: {
          chunks: true,
        },
      });
    } catch (error) {
      // Se algo falhar, marca como FAILED
      await this.prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          status: 'FAILED',
        },
      });
  
      throw error;
    }
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


  async findOne(
    userId: string,
    documentId: string,
  ) {
    return this.prisma.document.findFirst({
      where: {
        id: documentId,

        userId,
      },
    });
  }

}
