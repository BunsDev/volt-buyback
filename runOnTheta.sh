#!/bin/bash

TIMESTAMP=`date "+%Y%m%d"`
npm run theta >> "./log/theta-${TIMESTAMP}.log"