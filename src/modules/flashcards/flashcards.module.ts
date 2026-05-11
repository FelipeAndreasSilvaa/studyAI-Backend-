import { Module } from '@nestjs/common';

import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';

import { PrismaModule } from 'src/prisma/prisma.module';
import { AiModule } from 'src/common/ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
})
export class FlashcardsModule {}