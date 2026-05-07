import { Module } from '@nestjs/common';

import { AiModule } from '../../common/ai/ai.module';

import { ChatController }
from './chat.controller';

import { ChatService }
from './chat.service';

import { ChatRepository }
from './repositories/chat.repository';

@Module({
  imports: [AiModule],

  controllers: [ChatController],

  providers: [
    ChatService,
    ChatRepository,
  ],
})
export class ChatModule {}
