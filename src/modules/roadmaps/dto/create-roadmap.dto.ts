import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoadmapDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  goal: string;
}