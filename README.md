# Async Iteration Playground

See [my post][1] about [async iterators][2] on Medium from 2017. Things have gotten considerably better in Node land since that post was written.

## Quickstart

    yarn
    ./node_modules/.bin/ts-node async-iter.ts
    python line_reader.py
    python csv_reader.py

## Results (2023)

Play around with your node version and `target` in `tsconfig.json` to see how this is getting better.

With Node 18.8.0:

```
$ ts-node async-iter.ts
range sync: 8 ms
range async: 54 ms
lines async: 117 ms
lines async chunked: 43 ms
lines sync: 58 ms
```

With Node 16.19.1:

```
$ ts-node async-iter.ts
range sync: 8 ms
range async: 56 ms
lines async: 132 ms
lines async chunked: 46 ms
lines sync: 62 ms
```

Now on a 2022 M2 MacBook Air with node 14.17.1, TypeScript 3.9 and `"target": "esnext"`:

```
$ ts-node async-iter.ts
range sync: 19 ms
range async: 62 ms
lines async: 154 ms
lines async chunked: 78 ms
lines sync: 96 ms
```

Compare with Python 3.11.4:

```
$ python line_reader.py
Read 549996 lines, 32871385 bytes in 0.099241 s
$ python csv_reader.py
Read 549996 lines, 4949964 cells in 0.349307 s
```

So in 2023, Python 3.11 and Node 18.8 are within about 20% of one another (117ms for "range async" in Node vs. 99ms for Python).

### Older Results (2017–2020)

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
