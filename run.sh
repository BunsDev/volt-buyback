#!/bin/bash

TIMESTAMP=`date "+%Y%m%d"`
npm start >> "./log/meter-${TIMESTAMP}.log"