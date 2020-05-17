#!/usr/bin/env python3.6
import csv
import time

start_secs = time.time()
num_lines = 0
num_cols = 0
for line in csv.reader(open('stop_times.txt')):
    num_lines += 1
    num_cols += len(line)

end_secs = time.time()

print('Read %d lines, %d cells in %f s' % (
    num_lines, num_cols, end_secs - start_secs
))
