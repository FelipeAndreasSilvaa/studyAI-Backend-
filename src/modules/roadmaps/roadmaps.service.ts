import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  
  import { PrismaService } from '../../prisma/prisma.service';
  import { AiService } from '../../common/ai/services/ai.service';
  
  @Injectable()
  export class RoadmapsService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly aiService: AiService,
    ) {}
  
    async generate(goal: string, userId: string) {
      const prompt = `
  Crie um roadmap de estudos para o seguinte objetivo:
  
  "${goal}"
  
  Retorne APENAS JSON válido no formato:
  
  {
    "title": "Título do roadmap",
    "steps": [
      {
        "title": "Nome da etapa",
        "description": "Descrição detalhada",
        "duration": "1 semana"
      }
    ]
  }
  
  Regras:
  - Gere entre 5 e 10 etapas.
  - Organize do básico ao avançado.
  - Seja prático e objetivo.
  - Não use markdown.
  - Retorne apenas JSON.
  `;
  
      const rawResponse = await this.aiService.generate([
        {
          role: 'user',
          content: prompt,
        },
      ]);
  
      const cleanedResponse = String(rawResponse)
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
  
      let data: any;
  
      try {
        data = JSON.parse(cleanedResponse);
      } catch {
        throw new InternalServerErrorException(
          'A IA retornou um JSON inválido.',
        );
      }
  
      if (!data?.title || !Array.isArray(data.steps)) {
        throw new InternalServerErrorException(
          'Estrutura do roadmap inválida.',
        );
      }
  
      const roadmap = await this.prisma.roadmap.create({
        data: {
          title: data.title,
          goal,
          userId,
          steps: {
            create: data.steps.map((step: any, index: number) => ({
              title: step.title,
              description: step.description,
              duration: step.duration,
              order: index,
              status: index === 0 ? 'ACTIVE' : 'PENDING',
            })),
          },
        },
        include: {
          steps: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
  
      return roadmap;
    }
  
    async findAllByUser(userId: string) {
      return this.prisma.roadmap.findMany({
        where: {
          userId,
        },
        include: {
          steps: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
  
    async findById(id: string, userId: string) {
      const roadmap = await this.prisma.roadmap.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          steps: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
  
      if (!roadmap) {
        throw new NotFoundException('Roadmap não encontrado.');
      }
  
      return roadmap;
    }
  }