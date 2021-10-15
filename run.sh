#!/bin/bash

TIMESTAMP=`date "+%Y%m%d"`
npm start >> "./log/buyback-${TIMESTAMP}.log"