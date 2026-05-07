import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  async createChat(userId: string, title?: string) {
    return this.prisma.chat.create({
      data: {
        userId,
        title,
      },
    });
  }

  async findChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        userId,
      },

      orderBy: {
        updatedAt: 'desc',
      },

      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },

          take: 1,

          select: {
            content: true,
          },
        },
      },
    });
  }

  async findChatById(userId: string, chatId: string) {
    return this.prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },

      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async touchChat(chatId: string) {
    return this.prisma.chat.update({
      where: {
        id: chatId,
      },

      data: {
        updatedAt: new Date(),
      },
    });
  }

  async deleteChat(chatId: string) {
    return this.prisma.chat.delete({
      where: {
        id: chatId,
      },
    });
  }

  async createMessage(data: any) {
    return this.prisma.message.create({
      data,
    });
  }

  async getMessages(chatId: string) {
    return this.prisma.message.findMany({
      where: {
        chatId,
      },

      orderBy: {
        createdAt: 'asc',
      },

      take: 15,
    });
  }
}
