import { Module } from "@nestjs/common";
import { QuizzesService } from "./quizzes.service";
import { QuizzesController } from "./quizzes.controller";
import { AiModule } from "../../common/ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}