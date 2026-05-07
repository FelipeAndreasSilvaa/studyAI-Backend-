import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

import { ChatService } from '../chat/chat.service';

import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async listChats(@Req() req) {
    return this.chatService.listChats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':chatId')
  async getChat(@Req() req, @Param('chatId') chatId: string) {
    return this.chatService.getChat(req.user.id, chatId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':chatId')
  async deleteChat(@Req() req, @Param('chatId') chatId: string) {
    return this.chatService.deleteChat(req.user.id, chatId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async sendMessage(@Req() req, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, dto);
  }
}
