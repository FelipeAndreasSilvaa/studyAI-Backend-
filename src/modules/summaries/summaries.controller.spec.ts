import { Test, TestingModule } from '@nestjs/testing';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';

describe('SummariesController', () => {
  let controller: SummariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummariesController],
      providers: [SummariesService],
    }).compile();

    controller = module.get<SummariesController>(SummariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
