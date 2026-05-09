import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SummariesService } from './summaries.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(
    private readonly summariesService: SummariesService,
  ) {}


  @Post(':documentId')
  generate(
    @Param('documentId') documentId: string,
    @Req() req,
  ) {
  
    return this.summariesService.generate(
      documentId,
      req.user.id,
    );
  }
}