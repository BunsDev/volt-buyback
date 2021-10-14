//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd

require('dotenv').config();
const voltmakerABI = require('./abi/voltmaker.json');
const erc20safeABI = require('./abi/erc20safe.json').abi;
const geyserABI = require('./abi/geyser.json').abi;
const Web3 = require('web3');
const meterify = require('meterify').meterify;
const BigNumber = require('bignumber.js');

const voltmakerAddr = '0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd';
const volt = '0x8df95e66cb0ef38f91d2776da3c921768982fba0';
const mtrg = '0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3';
const busd = '0x24aa189dfaa76c671c279262f94434770f557c35';
const weth = '0x79a61d3a28f8c8537a3df63092927cfa1150fb3c';
const usdc = '0xd86e243fc0007e6226b07c9a50c9d70d78299eb5';
const wbtc = '0xc1f6c86abee8e2e0b6fd5bd80f0b51fef783635c';
const bnb = '0xf8bbb44e6fd13632d36fe09eb61820f9a44f5d74';
const meter = '0x687a6294d0d6d63e751a059bf1ca68e4ae7b13e2';
const usdt = '0x5fa41671c48e3c951afc30816947126ccc8c162e';
const movr = '0xb158870beb809ad955bf56065c5c10d7fd957cc0';

const voltHolder = '0x1d18c6fca6817175fff59763a36ac03ca9755165';
const voltStakingGeyser = ''; // FIXME: set up the geyser

const transferEvtABI = erc20safeABI.filter((c) => c.name === 'Transfer' && c.type === 'event')[0];
const transferEvtSig = web3.eth.abi.encodeEventSignature(transferEvtABI);

const web3 = meterify(new Web3(), 'http://mainnet.meter.io');
const privkey = process.env.BUYBACK_PRIV_KEY;
const acct = web3.eth.accounts.privateKeyToAccount(privkey);
web3.eth.accounts.wallet.add(privkey);

const calcReceivedVolt = async (txHash) => {
  const r = await web3.eth.getTransactionReceipt(txHash);
  console.log(r);
  let total = new BigNumber(0);
  for (const o of r.outputs) {
    for (const e of o.events) {
      if (e.topics && e.topics[0] === transferEvtSig) {
        const decoded = web3.eth.abi.decodeLog(transferEvtABI.inputs, e.data, e.topics.slice(1));
        const { from, to, value } = decoded;
        const fromAddr = from.toLowerCase();
        const toAddr = to.toLowerCase();
        if (e.address.toLowerCase() === volt && toAddr === voltHolder.toLowerCase()) {
          // incoming VOLT
          total = total.plus(value);
          console.log(
            `Recv ${web3.utils.fromWei(value)} VOLT from ${fromAddr}, subtotal: ${web3.utils.fromWei(
              total.toFixed()
            )} VOLT`
          );
        }
      }
    }
  }
  console.log(`TOTAL received: ${web3.utils.fromWei(total)} VOLT`);
  return total.toFixed();
};

const sendBuybackTx = async () => {
  const voltmakerInst = new web3.eth.Contract(voltmakerABI, voltmakerAddr);
  const buybackReceipt = await voltmakerInst.methods
    .convertMultiple(
      [busd, busd, weth, mtrg, mtrg, weth, mtrg, mtrg, mtrg, mtrg, mtrg, mtrg, weth, meter],
      [usdc, weth, wbtc, weth, busd, bnb, volt, usdc, meter, bnb, usdt, movr, volt, usdc]
    )
    .send({ from: acct.addr });
  return buybackReceipt;
};

const fundGeyser = async (amount, duration) => {
  const geyserInst = new web3.eth.Contract(geyserABI, voltStakingGeyser);
  const data = await geyserInst.methods.getGeyserData().call();
  const { rewardToken: rewardTokenAddress } = data;
  const voltInst = new web3.eth.Contract(erc20safeABI, volt);

  console.log('reward token:', rewardTokenAddress);
  console.log('amount in wei:', amount);
  console.log('duration:', duration, 'seconds');
  const ar = await voltInst.approve(voltStakingGeyser, amount).send({ from: acct.addr });
  console.log('approve receipt:', ar);
  const fr = await geyserInst.methods.fundGeyser(amount, duration).send({ from: acct.addr });
  console.log('fundGeyser receipt:', fr);
};

(async () => {
  // send buyback tx
  const receipt = await sendBuybackTx();
  console.log('Buyback Tx: ', receipt.transactionHash);

  // calculate bought VOLT total
  // sample tx would be : 0xfa3008b810ebe2f643f0bee8a02ed1ac5fed1e8ae8be63bc2198029c9c5d9823
  const rcvdVOLT = await calcReceivedVolt(receipt.transactionHash);

  // fund geyser
  const duration = 3600 * 24 * 2; // 2days in seconds
  await fundGeyser(rcvdVOLT, duration);
})();
