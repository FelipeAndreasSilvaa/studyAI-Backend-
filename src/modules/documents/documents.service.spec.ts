import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PdfService } from '../../common/ai/services/pdf.service';
import { DocumentsRepository } from './repository/documents.repository';

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: DocumentsRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: PdfService,
          useValue: {
            extractText: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
