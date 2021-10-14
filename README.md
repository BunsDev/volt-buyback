# Volt Buyback Utility

This will trigger a script that includes three steps:

1. call VoltMaker contract that collects all the swap fee from exising liquidity pools, and buy back `VOLT` with market price
2. examine the buyback tx to calculate received `VOLT` total
3. call Geyser contract to fund the geyser and extend the program

## Install Dependency

```bash
npm install
```

## Run

```bash
npm start
```
