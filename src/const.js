module.exports = {
  metermain: {
    rpcUrl: 'http://mainnet.meter.io',

    voltmakerAddr: '0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd',
    volt: '0x8df95e66cb0ef38f91d2776da3c921768982fba0',
    mtrg: '0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3',
    busd: '0x24aa189dfaa76c671c279262f94434770f557c35',
    weth: '0x79a61d3a28f8c8537a3df63092927cfa1150fb3c',
    usdc: '0xd86e243fc0007e6226b07c9a50c9d70d78299eb5',
    wbtc: '0xc1f6c86abee8e2e0b6fd5bd80f0b51fef783635c',
    bnb: '0xf8bbb44e6fd13632d36fe09eb61820f9a44f5d74',
    meter: '0x687a6294d0d6d63e751a059bf1ca68e4ae7b13e2',
    usdt: '0x5fa41671c48e3c951afc30816947126ccc8c162e',
    movr: '0xb158870beb809ad955bf56065c5c10d7fd957cc0',

    voltHolder: '0x1d18c6fca6817175fff59763a36ac03ca9755165',
    voltStakingGeyser: '0xBfC69a757Dd7DB8C59e10c63aB023dc8c8cc95Dc',

    uniswapv2Factory: '0x56aD9A9149685b290ffeC883937caE191e193135',
    pairs: [
      ['busd', 'usdc'],
      ['busd', 'weth'],
      ['busd', 'usdt'],
      ['weth', 'wbtc'],
      ['mtrg', 'weth'],
      ['mtrg', 'busd'],
      ['weth', 'bnb'],
      ['mtrg', 'volt'],
      ['mtrg', 'usdc'],
      ['mtrg', 'meter'],
      ['mtrg', 'bnb'],
      ['mtrg', 'usdt'],
      ['mtrg', 'movr'],
      ['weth', 'volt'],
      ['meter', 'usdc'],
      ['busd', 'volt'],
    ],
  },
  thetamain: {
    rpcUrl: 'http://54.169.171.97:18888/rpc',

    voltmakerAddr: '0x2d653C23d1C23e021FB756774EB9519f107F0349',
    tfuel: '0x4dc08b15ea0e10b96c41aec22fab934ba15c983e',
    volt: '0xe6a991ffa8cfe62b0bf6bf72959a3d4f11b2e0f5',
    busd: '0x7b37d0787a3424a0810e02b24743a45ebd5530b2',
    usdc: '0x3ca3fefa944753b43c751336a5df531bdd6598b6',
    mtrg: '0xbd2949f67dcdc549c6ebe98696449fa79d988a9f',
    weth: '0x3674d64aab971ab974b2035667a4b3d09b5ec2b3',
    bnb: '0xdff772186ace9b5513fb46d7b05b36efa0a4a20d',

    voltHolder: '0x1d18c6fca6817175fff59763a36ac03ca9755165',
    voltStakingGeyser: '0xCd872033f3Ed9227BC78F47fB0E0DFf7dbDBE5B4',

    uniswapv2Factory: '0xa2De4F2cC54dDFdFb7D27E81b9b9772bd45bf89d',

    pairs: [
      ['tfuel', 'volt'],
      ['tfuel', 'busd'],
      ['tfuel', 'bnb'],
      ['usdc', 'tfuel'],
      ['usdc', 'busd'],
      ['tfuel', 'mtrg'],
      ['busd', 'volt'],
      ['weth', 'tfuel'],
    ],
  },
};
