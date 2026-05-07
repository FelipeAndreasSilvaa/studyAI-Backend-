import { Module } from '@nestjs/common';

import { LlmFactory } from './factories/llm.factory';
import { GroqProvider } from './providers/groq-llm.provider';
import { AiService } from './services/ai.service';
import { PdfService } from './services/pdf.service';

@Module({
  providers: [AiService, LlmFactory, GroqProvider, PdfService],
  exports: [AiService, PdfService],
})
export class AiModule {}
