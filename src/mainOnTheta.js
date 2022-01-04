//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd

require('dotenv').config();
const { thetamain } = require('./const');
const {
  sendBuybackTx,
  calcReceivedVolt,
  fundGeyser,
  getFactory,
  getBridge,
  bulkCalcReceivedVolt,
} = require('./utilsOnTheta');
const BigNumber = require('bignumber.js');

(async () => {
  try {
    // send buyback tx
    // const f = await getFactory();
    const receipt = await sendBuybackTx();
    console.log('Buyback Tx: ', receipt.transactionHash);
    if (!receipt || !receipt.transactionHash) {
      console.log('Invalid buyback receipt, end early');
      process.exit(-1);
    }
    console.log(receipt);

    // calculate bought VOLT total
    // sample tx would be :
    // tfuel-volt: 0xd73aa8d42513ed99facb8f69426f3bfc096ce40c548a666ea4bb6798b8c5d92c
    // tfuel-busd: 0x555330b6a9aa5dc87c25b6c0cdd490443293ac789696725761f4f4f0c4f99bd1 12/28
    // busd-volt: 0x4ed1d4f6b0e36f714dc0d78303ce14bbc80e6fc28af7f4bea8a765bf4aef15af
    // 0x799cdfd431daf9d5207c5ec8021f942cf20cb68d67d01a16b28038145df855db
    // 0x61463f41dfd0f2d5fe1c183bca91e8331d41c6ebb915df4b959a3d5cda03dbc5
    // weth-tfuel: 0xf07bc262bbace7970f66dd668bcf29d2f82c2c11f2bbce978a49a74945db3db7
    // busd-volt: 0x9ef110a502cae775a1ce50123c6002dccbd8fec4c402e70f15258295e59783c8
    // usdc-tfuel: 0x50a7d564c08a6a45858f60fbd764eb98c0a97928a870122837cef3964c8e688d
    // tfuel-bnb: 0x4e4d5d9749dc56cbb6fcea1a635cd1fe6c91dbbf1339345f7007d83d4df5e520
    // tfuel-volt: 0x7c2d7bf16427bc8acbdb7c7fb3925ada6e7f656d2ee2add72edb9e491e132442
    // 0xfadf9f8b2984a50e959127f9d916774251a7266c20fdf86b52d8d7f50c84edf1
    const txHash = receipt.transactionHash; //'0x555330b6a9aa5dc87c25b6c0cdd490443293ac789696725761f4f4f0c4f99bd1';
    const rcvdVOLT = await calcReceivedVolt(txHash);
    console.log('Total received VOLT: ', rcvdVOLT);
    if (isNaN(Number(rcvdVOLT)) || Number(rcvdVOLT) <= 0) {
      console.log('Invalid VOLT amount, end early');
      process.exit(-1);
    }

    // fund geyser
    const duration = 3600 * 24 * 30; // 30days in seconds
    await fundGeyser(new BigNumber(rcvdVOLT), duration);
  } catch (e) {
    console.log('Error Happened: ', e);
    process.exit(-2);
  }
})();
