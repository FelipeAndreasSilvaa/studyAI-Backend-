export interface LlmProvider {
    generate(messages: any[]): Promise<string>;
  }