import { Module } from '@nestjs/common';

import { RoadmapsController } from './roadmaps.controller';
import { RoadmapsService } from './roadmaps.service';
import { AiModule } from '../../common/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [RoadmapsController],
  providers: [RoadmapsService],
})
export class RoadmapsModule {}