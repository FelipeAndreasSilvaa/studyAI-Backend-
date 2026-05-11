import {
    Controller,
    Post,
    Param,
    Req,
    UseGuards,
    Get,
  } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { FlashcardsService } from './flashcards.service';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
    constructor(private readonly flashService: FlashcardsService) {}

    @Post(':documentId')
    async generate(@Param("documentId") documentId: string, @Req() req){
        return this.flashService.generate(documentId, req.user.id)
    }

    @Get()
    findAll(@Req() req) {
      return this.flashService.findAllByUser(
        req.user.id,
      );
    }

}
