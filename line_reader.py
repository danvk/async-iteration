#!/usr/bin/env python3
import csv
import time

start_secs = time.time()
num_lines = 0
num_bytes = 0
for line in csv.reader(open('../../github/router/test/nyc-gtfs/stop_times.txt')):
    num_lines += 1
    num_bytes += len(line)

end_secs = time.time()

print('Read %d lines, %d bytes in %f s' % (num_lines, num_bytes, end_secs - start_secs))
