import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GenerateQuizDto {
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(20)
  questionCount?: number = 10;
}