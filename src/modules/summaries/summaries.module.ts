import { Module } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { AiModule } from 'src/common/ai/ai.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [AiModule, PrismaModule],
  controllers: [SummariesController],
  providers: [SummariesService],
})
export class SummariesModule {}
