import { IsString } from 'class-validator';

export class CreateSummaryDto {
  @IsString()
  documentId: string;
}