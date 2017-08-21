// Copyright 2017 Sidewalk Labs | apache.org/licenses/LICENSE-2.0
import * as fs from 'fs-extra';

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;

export interface Options {
  chunkSize?: number;
  lineDelimiter?: string;
  encoding?: string;  // defaults to UTF-8.
}

function detectDelimiter(text: string) {
  for (const delim of ['\r\n', '\r', '\n']) {
    if (text.indexOf(delim) >= 0) {
      return delim;
    }
  }
  return null;
}

export function parseLine(line: string) {
  // Easy case: no quotes.
  if (line.indexOf('"') === -1) {
    return line.split(',');
  }

  // Harder case: some fields may be quoted.
  // Commas may appear in quotes.
  // Two quotes in a row ("") mean a single quote, even inside quotes.
  const fields = [] as string[];
  let inQuotes = false;
  let text = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const nc = line[i + 1];
    if (c === '"' && nc !== '"') {
      inQuotes = !inQuotes;
    } else if (c === '"' && nc === '"') {
      text += c;
      i += 1;
    } else if (c === ',' && !inQuotes) {
      fields.push(text);
      text = '';
    } else {
      text += c;
    }
  }
  if (text) fields.push(text);
  return fields;
}

/**
 * Parse a CSV file in chunks, calling the callback with the complete rows found in those chunks.
 *
 * This provides a good balance between pulling the entire file into memory (which may not be
 * possible) and firing a callback on every line (which may be a performance bottlenck).
 */
export async function* fileChunks(filename: string, chunkSize: number) {
  const buffer = new Buffer(chunkSize);

  let leftovers = '';
  let isRejected = false;

  const fid = await fs.open(filename, 'r');
  let readResult;
  while (readResult = await fs.read(fid, buffer, 0, chunkSize, null)) {
    if (readResult.bytesRead === 0) break;
    yield readResult.buffer;
    if (readResult.bytesRead < chunkSize) break;
  }
}

export async function* lines(filename: string, options?: Options) {
  options = options || {};
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const encoding = options.encoding || 'utf-8';
  let delim = options.lineDelimiter || null;

  let leftovers: string = '';

  for await (const chunk of fileChunks(filename, chunkSize)) {
    const data = chunk.toString(encoding);
    const combinedData = leftovers + data;
    if (!delim) {
      delim = detectDelimiter(combinedData);
      if (!delim) {
        leftovers = combinedData;
        continue;
      }
    }

    let lines = combinedData.split(delim);
    leftovers = lines[lines.length - 1];
    lines = lines.slice(0, -1);
    if (lines[lines.length - 1] === '') {
      // ignore trailing newlines
      lines = lines.slice(0, -1);
    }
    for (const line of lines) {
      yield line;
    }
  }
}