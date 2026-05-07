import { Injectable } from '@nestjs/common';

import * as fs from 'fs';

import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfService {
  async extractText(path: string) {
    const buffer =
      fs.readFileSync(path);

    const parser =
      new PDFParse({ data: buffer });

    try {
      const data =
        await parser.getText();

      return data.text;
    } finally {
      await parser.destroy();
    }
  }
}
