import { Injectable, NotFoundException } from '@nestjs/common';

import { AiService } from '../../common/ai/services/ai.service';

import { ChatRepository } from '../chat/repositories/chat.repository';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly aiService: AiService,

    private readonly chatRepository: ChatRepository,
  ) {}

  async createChat(userId: string) {
    return this.chatRepository.createChat(userId);
  }

  async listChats(userId: string) {
    const chats = await this.chatRepository.findChats(userId);

    return chats.map((chat) => ({
      id: chat.id,
      title: chat.title ?? chat.messages[0]?.content ?? 'Nova conversa',
      lastMessage: chat.messages[0]?.content ?? null,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));
  }

  async getChat(userId: string, chatId: string) {
    const chat = await this.chatRepository.findChatById(userId, chatId);

    if (!chat) {
      throw new NotFoundException('Chat não encontrado.');
    }

    return {
      id: chat.id,
      title: chat.title ?? chat.messages[0]?.content ?? 'Nova conversa',
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })),
    };
  }

  async deleteChat(userId: string, chatId: string) {
    const chat = await this.chatRepository.findChatById(userId, chatId);

    if (!chat) {
      throw new NotFoundException('Chat não encontrado.');
    }

    await this.chatRepository.deleteChat(chatId);

    return {
      deleted: true,
    };
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    let chatId = dto.chatId;

    // cria chat automaticamente
    if (!chatId) {
      const chat = await this.chatRepository.createChat(
        userId,
        this.createChatTitle(dto.message),
      );

      chatId = chat.id;
    } else {
      const chat = await this.chatRepository.findChatById(userId, chatId);

      if (!chat) {
        throw new NotFoundException('Chat não encontrado.');
      }
    }

    // salva mensagem usuário
    await this.chatRepository.createMessage({
      chatId,

      role: 'USER',

      content: dto.message,
    });

    // busca histórico
    const history = await this.chatRepository.getMessages(chatId);

    // memória
    const messages = history.map((msg) => ({
      role: msg.role.toLowerCase(),

      content: msg.content,
    }));

    // IA
    const response = await this.aiService.generate(messages);

    // salva resposta IA
    await this.chatRepository.createMessage({
      chatId,

      role: 'ASSISTANT',

      content: response,
    });

    await this.chatRepository.touchChat(chatId);

    return {
      chatId,
      response,
    };
  }

  private createChatTitle(message: string) {
    const normalized = message
      .replace(/\s+/g, ' ')
      .replace(/[?.!,;:]+$/g, '')
      .trim();

    const topic = normalized
      .replace(
        /^(me\s+)?(explique|explica|explique-me|fale|fala|ensine|ensina|resuma|resume|me\s+ajude\s+com|quero\s+aprender|preciso\s+entender)\s+(sobre\s+|a\s+|o\s+|os\s+|as\s+|de\s+|do\s+|da\s+)?/i,
        '',
      )
      .replace(/^(o\s+que\s+e|o\s+que\s+é|como\s+funciona)\s+/i, '')
      .trim();

    if (!topic) {
      return 'Nova conversa';
    }

    const shortTopic =
      topic.length > 45 ? `${topic.slice(0, 45).trim()}...` : topic;

    return `Explicação sobre ${shortTopic}`;
  }
}
