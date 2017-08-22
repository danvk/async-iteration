## Help! These promises are killing my performance!

Text processing in node.js has historically been both slow and cumbersome. But don't fret, there's hope on the horizon! The new async iterators proposal solves the "cumbersome" problem brilliantly. But sadly, it misses an opportunity to make text processing fast, too. While your code may look cleaner with async iterators, it'll still be slow as ever.

Read on for the sordid tale...

## Python: Living the Text Processing Dream

The Python code to read a file line by line is beautifully concise:

```python
for line in open('filename'):
    process(line)
```

But while this code looks simple on the surface, there's quite a bit going on behind the scenes. Control is alternating back and forth between your Python code (`for line in...`) and the Python interpreter, which is reading the file from disk. Python is making some decisions for you about how to read the file (how many bytes at a time should it read before yielding control?) and it's figuring out the line delimiters. Memory consumption stays low, since the whole file needn't be read all at once.

What's also impressive is that this code is _fast_! On my 2015 Macbook with an SSD, it can process around 200MB/sec. That's well within an order of magnitude of `wc -l`, which can process ~800MB/sec.

Reading a CSV file is still concise, though a bit slower:

```python
import csv
for row in csv.reader(open('file.csv')):
    process(row)  # row is an array of values
```

On my machine, this drops us down to about 35MB/sec. This combination of concision and speed make Python a great choice for processing any kind of text file.

# Node Streams: A Slow Mess

For those of us who work in node.js, the situation isn't so good. Until recently, processing a text file required either loading it all into memory synchronously or using streams and callbacks, concepts which are intimidating for beginners and cumbersome for experts.

Here's what a simple program looks like in Node using the popular `csv` module:

```js
const fs = require('fs');
const parse = require('csv-parse');
const parser = parse({delimiter: ','});

let num_lines = 0;
let num_bytes = 0;

parser.on('readable', () => {
  let row;
  while (row = parser.read()) {
    num_lines += 1;
    num_bytes += row.length;
  }
});

parser.on('error', err => {
  console.error(err.message);
});

parser.on('finish', () => {
  console.log(`Read ${num_lines} lines and ${num_bytes}.`);
});

fs.createReadStream(filename, {encoding: 'utf-8'}).pipe(parser);
```

Holy cow! That's a lot more complicated. We're using callbacks, streams and pipes. And our logic is split across three separate callbacks.

Even worse, this code is slow as molasses! On my machine, it can process 3MB/s of CSV data. _That's over 10x slower than Python!_

## Async iteration to the rescue?

ES2015 (aka ES6) introduced _iterators_ and _generators_. These provide a clean way to produce new iterables: you implement a special method which returns a `{done, value}` object. A _for-of_ loop will then iterate over the `value`s, finishing when the `done` field is set.

Unfortunately, generators and iterators are synchronous. Unless we're willing to read our entire file into memory, they can't help us.

That's why I was excited about a new proposal for _asynchronous_ iterators and generators. Rather than returning a `{done, value}` object, an asynchronous iterator returns `Promise<{done, value}>`. This makes it possible to read a file line-by-line using a nice syntax:

```js
import {lines} from './magical-library';

(async () => {
  let num_lines = 0;
  for await (const line of lines(filename)) {
    num_lines += 1;
  }
  console.log(`Read ${num_lines} lines.`);
})().catch(e => {
  console.error(e);
})
```

There's some boilerplate to put ourselves in an `async` function, but the meat of the program looks much more like the concise Python version from the start of this post. This is a big improvement!

But what about the performance? I got 7.8MB/sec. Compare this with 200MB/sec for the equivalent Python code. Not so great!

We can get a better sense of why this is still so slow by creating the simplest async iterator imaginable:

```js
async function* asyncRange(from, to) {
  for (let i = from; i < to; i++) {
    yield i;
  }
}

(async() => {
  for await (const i of asyncRange(0, 550000)) {}
})().catch(e => console.error(e));
```

My CSV file has 550,000 lines. The example to read it line-by-line (above) ran in 4 seconds. This trivial async iterator (which doesn't touch the filesystem) runs in 3 seconds. The equivalent synchronous iterator runs in 0.2s. _It's the promises that are killing our performance!_

## A missed opportunity

The problem is that Promises have to be resolved in the next turn of the event loop. This is part of the spec. There's no way around it. Spinning the event loop 550,000 times is going to be slow, no matter what your code does.

The solution is simple: yield the lines in batches, so that multiple lines are processed in each turn of the event loop:

```js
import {lineChunks} from './magical-library';

(async () => {
  let num_lines = 0;
  for await (const chunk of lineChunks(filename)) {
    for (const line of chunk) {
      num_lines += 1;
    }
  }
  console.log(`Read ${num_lines} lines.`);
})().catch(e => {
  console.error(e);
})
```

This runs in ~350ms, equivalent to ~90MB/sec. This is within a factor of two of the equivalent Python.

The cost of this speed is that we've exposed an implementation detail (the chunking) that Python hides. What's more, you can't write a function to encapsulate the chunking without killing your performance, since you'll be back to an event loop per line:

```js
// This is slow again.
export async function* lines(filename) {
  for await (const chunk of lineChunks(filename)) {
    for (const line of chunk) {
      yield line;
    }
  }
}
```

A simple solution to this would have been to make an `AsyncIteratorResult` include a `values` array, rather than a `value` scalar. This would mean that multiple values could be processed per event loop, rather than a single one. This corresponds to something like a paginated result, where you get many values on each network response. If you wanted to get a separate event loop per value, you could write a function to do that:

```js
export async function* onePerEventLoop(asyncIterator) {
  for await (const value of asyncIterator) {
    yield value;
  }
}
```

This would slow down the CSV example, but you'd be know ingly paying that cost. Being fast would at least be possible.

## Conclusions

Async iterators finally give node.js an alternative to streams with a clean, concise syntax. Unfortunately, they do it in a way that makes them inherently slow. I'm not sure what the driving use case for these is. They're a missed opportunity to overcome node's difficulty parsing CSV files compared to languages like Python.
