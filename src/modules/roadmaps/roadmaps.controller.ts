import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { Request } from 'express';
  
  import { RoadmapsService } from './roadmaps.service';
  import { CreateRoadmapDto } from './dto/create-roadmap.dto';
  import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard'
  
  interface AuthenticatedRequest extends Request {
    user: {
      id: string;
      email?: string;
    };
  }
  
  @UseGuards(JwtAuthGuard)
  @Controller('roadmaps')
  export class RoadmapsController {
    constructor(
      private readonly roadmapsService: RoadmapsService,
    ) {}
  
    @Post()
    create(
      @Body() dto: CreateRoadmapDto,
      @Req() req: AuthenticatedRequest,
    ) {
      return this.roadmapsService.generate(
        dto.goal,
        req.user.id,
      );
    }
  
    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
      return this.roadmapsService.findAllByUser(
        req.user.id,
      );
    }
  
    @Get(':id')
    findOne(
      @Param('id') id: string,
      @Req() req: AuthenticatedRequest,
    ) {
      return this.roadmapsService.findById(
        id,
        req.user.id,
      );
    }
  }