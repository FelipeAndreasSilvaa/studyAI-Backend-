import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaController } from './prisma/prisma.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [PrismaModule, UsersModule, DocumentsModule, FlashcardModule, ChatModule, AuthModule],
  controllers: [AppController, PrismaController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
