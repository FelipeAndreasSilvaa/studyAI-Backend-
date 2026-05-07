import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DocumentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.document.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.document.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
