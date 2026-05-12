// src/modules/quizzes/quizzes.service.ts

import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
  } from "@nestjs/common";
  
  import { PrismaService } from "../../prisma/prisma.service";
  import { AiService } from "../../common/ai/services/ai.service";
  
  @Injectable()
  export class QuizzesService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly aiService: AiService,
    ) {}
  
    /**
     * Gera um quiz automaticamente a partir do texto extraído do documento.
     */
    async generateQuiz(
      documentId: string,
      userId: string,
      questionCount = 10,
    ) {
      // 1. Buscar documento
      const document = await this.prisma.document.findFirst({
        where: {
          id: documentId,
          userId,
        },
        select: {
          id: true,
          title: true,
          extractedText: true,
        },
      });
  
      if (!document) throw new NotFoundException("Documento não encontrado.");
  
      if (!document.extractedText) throw new NotFoundException("O texto do documento ainda não foi processado.",);
      
  
      // 2. Limitar o conteúdo para reduzir custo e latência
      const content = document.extractedText.slice(0, 12000);
  
      // 3. Prompt estruturado
      const prompt = `
        Você é um especialista em educação.
        
        Com base no texto abaixo, gere um quiz com ${questionCount} questões de múltipla escolha.
        
        Retorne EXCLUSIVAMENTE um JSON válido no formato:
        
        {
            "title": "Quiz sobre <tema>",
            "description": "Descrição curta do quiz",
            "questions": [
            {
                "question": "Pergunta?",
                "explanation": "Explicação da resposta correta.",
                "alternatives": [
                { "text": "Alternativa A", "isCorrect": false },
                { "text": "Alternativa B", "isCorrect": true },
                { "text": "Alternativa C", "isCorrect": false },
                { "text": "Alternativa D", "isCorrect": false }
                ]
            }
            ]
        }
        
        Regras obrigatórias:
        - Gere exatamente ${questionCount} questões.
        - Cada questão deve ter exatamente 4 alternativas.
        - Apenas 1 alternativa deve ter "isCorrect": true.
        - Toda questão deve conter "explanation".
        - Não use markdown.
        - Não use crases.
        - Retorne apenas JSON.
        
        Título do documento: ${document.title}
        
        Texto:
        ${content}
        `;
  
      // 4. Chamar IA (Groq via AiService)
      const rawResponse = await this.aiService.generate([
        {
          role: "user",
          content: prompt,
        },
      ]);
  
      if (!rawResponse) {
        throw new InternalServerErrorException(
          "A IA não retornou nenhum conteúdo.",
        );
      }
  
      // 5. Limpar markdown caso a IA retorne ```json
      const cleanedResponse = String(rawResponse)
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
  
      // 6. Parsear JSON
      let quizData: any;
  
      try {
        quizData = JSON.parse(cleanedResponse);
      } catch (error) {
        console.error("Erro ao converter JSON do quiz:", cleanedResponse);
  
        throw new InternalServerErrorException( "A IA retornou um JSON inválido.",);
      }
  
      // 7. Validação básica
      if ( !quizData || !quizData.title || !Array.isArray(quizData.questions)) throw new InternalServerErrorException("Estrutura do quiz inválida.",);
      
  
      // 8. Persistir no banco
      const quiz = await this.prisma.quiz.create({
        data: {
          title: quizData.title,
          description: quizData.description ?? null,
          documentId,
          userId,
          questions: {
            create: quizData.questions.map((question: any) => ({
              question: question.question,
              explanation: question.explanation ?? null,
              alternatives: {
                create: question.alternatives.map(
                  (alternative: any) => ({
                    text: alternative.text,
                    isCorrect: Boolean(
                      alternative.isCorrect,
                    ),
                  }),
                ),
              },
            })),
          },
        },
        include: {
          document: {
            select: {
              id: true,
              title: true,
            },
          },
          questions: {
            include: {
              alternatives: true,
            },
          },
        },
      });
  
      return quiz;
    }
  
    /**
     * Lista todos os quizzes do usuário.
     */
    async findAllByUser(userId: string) {
      return this.prisma.quiz.findMany({
        where: {
          userId,
        },
        include: {
          document: {
            select: {
              id: true,
              title: true,
            },
          },
          questions: {
            include: {
              alternatives: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  
    /**
     * Busca um quiz por ID.
     */
    async findById(id: string, userId: string) {
      const quiz = await this.prisma.quiz.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          document: {
            select: {
              id: true,
              title: true,
            },
          },
          questions: {
            include: {
              alternatives: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
  
      if (!quiz) {
        throw new NotFoundException(
          "Quiz não encontrado.",
        );
      }
  
      return quiz;
    }
  
    /**
     * Remove um quiz.
     */
    async delete(id: string, userId: string) {
      const quiz = await this.prisma.quiz.findFirst({
        where: {
          id,
          userId,
        },
        select: {
          id: true,
        },
      });
  
      if (!quiz) {
        throw new NotFoundException(
          "Quiz não encontrado.",
        );
      }
  
      await this.prisma.quiz.delete({
        where: {
          id,
        },
      });
  
      return {
        message: "Quiz removido com sucesso.",
      };
    }
  }