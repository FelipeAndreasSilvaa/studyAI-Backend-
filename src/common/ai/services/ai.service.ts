import { Injectable } from '@nestjs/common';

import { LlmFactory } from '../factories/llm.factory';

@Injectable()
export class AiService {
  constructor(
    private readonly llmFactory: LlmFactory,
  ) {}

  async generate(messages: any[]) {
    const provider =
      this.llmFactory.get();

    return provider.generate(messages);
  }
}