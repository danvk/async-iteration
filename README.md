# Async Iteration Playground

See [my post][1] about [async iterators][2] on Medium.

## Quickstart

    yarn
    ./node_modules/.bin/ts-node async-iter.ts
    python line_reader.py
    python csv_reader.py

## Results

Play around with your node version and `target` in `tsconfig.json` to see how this is getting better.

With node 14.2.0, TypeScript 3.9 and `"target": "esnext"`:

```
$ ts-node async-iter.ts
range sync: 21 ms
range async: 125 ms
lines async: 299 ms
lines async chunked: 132 ms
lines sync: 169 ms
```

With node 12.16.2, TypeScript 3.9 and `"target": "esnext"`:

```
$ ts-node async-iter.ts
range sync: 31 ms
range async: 136 ms
lines async: 338 ms
lines async chunked: 197 ms
lines sync: 184 ms
```

With node 10.1.0, TypeScript 2.8 and `"target": "esnext"`:

```
$ ./node_modules/.bin/ts-node async-iter.ts
range sync: 30 ms
range async: 172 ms
lines async: 621 ms
lines async chunked: 283 ms
lines sync: 358 ms
```

vs. node 8.11.2 and `"target": "es6"`:

```
$ ./node_modules/.bin/ts-node async-iter.ts
range sync: 30 ms
range async: 1408 ms
lines async: 1800 ms
lines async chunked: 236 ms
lines sync: 370 ms
```

So the simplest `for await of` loop has gotten ~8x faster and the async csv
parser has gotten ~3x faster.

For comparison, Python 3.6.5 reads the same file in 145ms:

```
$ python3.6 line_reader.py
Read 549996 lines, 32871385 bytes in 0.295456 s
$ python3.7 csv_reader.py
Read 549996 lines, 4949964 cells in 0.936364 s
```

[1]: https://medium.com/p/4767df03d85b/
[2]: https://github.com/tc39/proposal-async-iteration
