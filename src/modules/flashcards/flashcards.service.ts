import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from 'src/common/ai/services/ai.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Flashcard } from '@prisma/client';

@Injectable()
export class FlashcardsService {
    constructor(private readonly aiService: AiService, private readonly prisma: PrismaService) {}

    async generate(documentId: string, userId: string){
         // 1. Buscar documento e chunks
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                userId
            },
            include: {
                chunks: {
                    orderBy:{
                        index: 'asc'
                    }
                }
            }
        })

        if(!document) throw new NotFoundException('Documento não encontrado')
        if(!document.chunks.length)  throw new NotFoundException('Documento sem chunks processados')

        // 2. Concatenar conteúdo
        const content = document.chunks
        .map((chunk) => chunk.chunkText)
        .join('\n\n');

            // 3. Prompt para IA
    const messages = [
        {
          role: 'system',
          content: `
            Você é um especialista em estudos.

            Gere entre 10 e 15 flashcards.

            Retorne APENAS um JSON válido.

            Não escreva explicações.
            Não use markdown.
            Não use \`\`\`json.

            Formato:

            [
              {
                "question": "Pergunta",
                "answer": "Resposta"
              }
            ]
            `,
        },
        {
          role: 'user',
          content,
        },
      ];

      // 4. Gerar resposta da IA
      const response = await this.aiService.generate(messages)

       // 5. Converter JSON
       let parsed: any[];

       if (typeof response === 'string') {
         const start = response.indexOf('[');
         const end = response.lastIndexOf(']') + 1;
       
         if (start === -1 || end === 0) {
           throw new Error(
             'A IA não retornou um JSON válido.',
           );
         }
       
         const jsonString = response.slice(start, end);
       
         parsed = JSON.parse(jsonString);
       } else {
         parsed = response;
       }
        
        // 6. Remover flashcards antigos
        await this.prisma.flashcard.deleteMany({
            where: {
              documentId,
              userId,
            },
          });

        // 7. Salvar novos flashcards
        const created: Flashcard[] = [];

        for (const card of parsed) {
        const flashcard =
            await this.prisma.flashcard.create({
            data: {
                userId,
                documentId,
                question: card.question,
                answer: card.answer,
            },
            });

      created.push(flashcard);
    }
      // 8. Retornar
      return created;
  }

  async findAllByUser(userId: string) {
    return this.prisma.flashcard.findMany({
      where: {
        userId,
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });
  }

}
