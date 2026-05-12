// src/modules/quizzes/quizzes.controller.ts

import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
  } from "@nestjs/common";
  import { Request } from "express";
  
  import { QuizzesService } from "./quizzes.service";
  import { GenerateQuizDto } from "./dto/generate-quiz.dto";
  import { JwtAuthGuard } from "../../auth/guard/jwt-auth.guard";
  
  interface AuthenticatedRequest extends Request {
    user: {
      id: string;
      email: string;
    };
  }
  
  @UseGuards(JwtAuthGuard)
  @Controller("quizzes")
  export class QuizzesController {
    constructor(
      private readonly quizzesService: QuizzesService,
    ) {}
  
    /**
     * POST /quizzes/documents/:documentId/generate
     */
    @Post("documents/:documentId/generate")
    generate(
      @Param("documentId") documentId: string,
      @Req() req: AuthenticatedRequest,
      @Body() dto?: GenerateQuizDto,
    ) {
      const userId = req.user.id;
  
      // Se o body vier vazio ({} ou undefined),
      // usa 10 questões por padrão.
      const questionCount =
        dto?.questionCount ?? 10;
  
      return this.quizzesService.generateQuiz(
        documentId,
        userId,
        questionCount,
      );
    }
  
    /**
     * GET /quizzes
     */
    @Get()
    findAll(
      @Req() req: AuthenticatedRequest,
    ) {
      const userId = req.user.id;
  
      return this.quizzesService.findAllByUser(
        userId,
      );
    }
  
    /**
     * GET /quizzes/:id
     */
    @Get(":id")
    findOne(
      @Param("id") id: string,
      @Req() req: AuthenticatedRequest,
    ) {
      const userId = req.user.id;
  
      return this.quizzesService.findById(
        id,
        userId,
      );
    }
  
    /**
     * DELETE /quizzes/:id
     */
    @Delete(":id")
    remove(
      @Param("id") id: string,
      @Req() req: AuthenticatedRequest,
    ) {
      const userId = req.user.id;
  
      return this.quizzesService.delete(
        id,
        userId,
      );
    }
  }