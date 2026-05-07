import { Injectable } from '@nestjs/common';

import { groqModel } from './groq.provider';

@Injectable()
export class GroqProvider {
  async generate(messages: any[]) {
    const response =
      await groqModel.invoke(messages);

    return response.content as string;
  }
}