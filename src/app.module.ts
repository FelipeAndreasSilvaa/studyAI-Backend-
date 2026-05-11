import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaController } from './prisma/prisma.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { SummariesModule } from './modules/summaries/summaries.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';

@Module({
  imports: [PrismaModule, UsersModule, DocumentsModule, ChatModule, AuthModule, SummariesModule, FlashcardsModule],
  controllers: [AppController, PrismaController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
