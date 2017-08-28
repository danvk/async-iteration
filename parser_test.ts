import {linesSync, fileChunksSync} from './csv-parser';
import { expect } from 'chai';

describe('parser', () => {
  it('should parse a test file', () => {
    const lines: string[] = []
    for (const line of linesSync('test.txt')) {
      lines.push(line);
    }
    expect(lines).to.deep.equal([
      'line 1',
      'line 2',
      'line 3',
    ]);
  });

  it.only('should parse a test file with multiple chunks', () => {
    const lines: string[] = []
    for (const line of linesSync('test.txt', { chunkSize: 10})) {
      lines.push(line);
    }
    expect(lines).to.deep.equal([
      'line 1',
      'line 2',
      'line 3',
    ]);
  });

  it('should read chunks', () => {
    const chunks: string[] = [];
    for (const chunk of fileChunksSync('test.txt', 10)) {
      chunks.push(chunk.toString('utf-8'));
    }
    expect(chunks).to.deep.equal([
      'line 1\nlin',
      'e 2\nline 3',
      '\n',
    ])
  });
});
