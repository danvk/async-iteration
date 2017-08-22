import {lines, lineChunks} from './csv-parser';

(Symbol as any)['asyncIterator'] = Symbol();

async function* asyncRange(from: number, to: number) {
  for (let i = from; i < to; i++) {
    yield i;
  }
}

function* syncRange(from: number, to: number) {
  for (let i = from; i < to; i++) {
    yield i;
  }
}

async function timeIt(name: string, fn: () => any) {
  const startMs = Date.now();
  await fn();
  const endMs = Date.now();
  const elapsedMs = endMs - startMs;
  console.log(`${name}: ${elapsedMs} ms`);
}

(async () => {
  await timeIt('sync', async () => {
    // Note: for this to work, you need target: es6.
    for (const i of syncRange(0, 549996)) {
    }
  });
  await timeIt('async', async () => {
    for await (const i of asyncRange(0, 549996)) {
    }
  });
  await timeIt('lines', async() => {
    let numLines = 0, numBytes = 0;
    for await (const line of lines('stop_times.txt')) {
      numLines++;
      numBytes += line.length;
    }
    console.log(`Read ${numLines} lines, ${numBytes} bytes.`);
  });
  await timeIt('lines chunked', async() => {
    let numLines = 0, numBytes = 0;
    for await (const chunk of lineChunks('stop_times.txt')) {
      for (const line of chunk) {
        numLines++;
        numBytes += line.length;
      }
    }
    console.log(`Read ${numLines} lines, ${numBytes} bytes.`);
  });
})().catch(e => {
  console.error(e);
});
