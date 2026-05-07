import { Injectable } from '@nestjs/common';

import { GroqProvider } from '../providers/groq-llm.provider';

@Injectable()
export class LlmFactory {
  constructor(
    private readonly groqProvider: GroqProvider,
  ) {}

  get(provider = 'groq') {
    switch (provider) {
      case 'groq':
      default:
        return this.groqProvider;
    }
  }
}