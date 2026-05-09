import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AiService } from 'src/common/ai/services/ai.service';



@Injectable()
export class SummariesService {
  constructor(private readonly prisma: PrismaService, private readonly aiService: AiService) {}
  async generate(
    documentId: string,
    userId: string,) {

    // 1. Buscar documento e chunks
      const documents = await this.prisma.document.findFirst({
        where: {
          id: documentId,
          userId
        },
        include: {
          chunks: {
            orderBy: {
              index: 'asc',
            }
          }
        }
      })



      if (!documents) {
        throw new NotFoundException(
          'Documento não encontrado',
        );
      }
  
      if (!documents.chunks.length) {
        throw new NotFoundException(
          'Documento sem chunks processados',
        );
      }

       // 2. Concatenar conteúdo
       const content = documents.chunks
       .map((chunk) => chunk.chunkText)
       .join('\n\n');

       // 3. Montar mensagens para IA
    const messages = [
      {
        role: 'system',
        content: `
          Você é um especialista em estudos.

          Crie um resumo claro, organizado e didático.

          Estruture em Markdown:

          # Resumo
          ## Conceitos principais
          ## Pontos importantes
          ## Conclusão
                  `,
      },
      {
        role: 'user',
        content,
      },
    ];

        // 4. Gerar resumo
        const generatedSummary =
        await this.aiService.generate(messages);
  
      // 5. Salvar no banco
      const summary =
        await this.prisma.summary.create({
          data: {
            documentId,
            content: generatedSummary,
            status: 'COMPLETED',
          },
        });
  
      // 6. Retornar resultado
      return summary;
    }

  }
