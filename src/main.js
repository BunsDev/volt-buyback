//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd

require('dotenv').config();
const { sendBuybackTx, calcReceivedVolt, fundGeyser, getValidPairs } = require('./utils');

(async () => {
  try {
    const pairs = await getValidPairs();
    console.log('Valid Pairs: ', pairs);

    // send buyback tx
    const receipt = await sendBuybackTx(pairs);
    console.log('Buyback Tx: ', receipt.transactionHash);
    if (!receipt || !receipt.transactionHash) {
      console.log('Invalid buyback receipt, end early');
      process.exit(-1);
    }

    // calculate bought VOLT total
    // sample tx would be :
    // first buyback: 0xfa3008b810ebe2f643f0bee8a02ed1ac5fed1e8ae8be63bc2198029c9c5d9823 10/14
    // second buyback: 0x2a36127e774e0083f94e9d972e02d7782490e51a7e27d9c5c70a4281edb246c0 10/15
    const rcvdVOLT = await calcReceivedVolt(receipt.transactionHash);
    console.log('Total received VOLT: ', rcvdVOLT);
    if (isNaN(Number(rcvdVOLT)) || Number(rcvdVOLT) <= 0) {
      console.log('Invalid VOLT amount, end early');
      process.exit(-1);
    }

    // fund geyser
    const duration = 3600 * 24 * 30; // 30days in seconds
    await fundGeyser(rcvdVOLT, duration);
  } catch (e) {
    console.log('Error Happened: ', e);
    process.exit(-2);
  }
})();
