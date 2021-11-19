//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd
require('dotenv').config();
const { voltHolder } = require('./const');
const { sendBuybackTx, calcReceivedVolt, fundGeyser, voltBalanceOf } = require('./utils');

(async () => {
  const voltBalance = await voltBalanceOf(voltHolder);
  console.log('Total VOLT balance: ', voltBalance);
  if (isNaN(Number(voltBalance)) || Number(voltBalance) <= 0) {
    console.log('Invalid VOLT amount, end early');
    process.exit(-1);
  }

  // fund geyser
  const duration = 3600 * 24 * 7; // 7days in seconds
  await fundGeyser(voltBalance, duration);
})();
