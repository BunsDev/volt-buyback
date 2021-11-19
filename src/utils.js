//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd

const voltmakerABI = require('./abi/voltmaker.json');
const erc20safeABI = require('./abi/erc20safe.json').abi;
const geyserABI = require('./abi/geyser.json').abi;
const Web3 = require('web3');
const meterify = require('meterify').meterify;
const BigNumber = require('bignumber.js');
const {
  volt,
  voltmakerAddr,
  voltHolder,
  voltStakingGeyser,
  mtrg,
  busd,
  weth,
  usdc,
  wbtc,
  bnb,
  meter,
  usdt,
  movr,
} = require('./const');

const loadWeb3 = () => {
  const web3 = meterify(new Web3(), 'http://mainnet.meter.io');
  return web3;
};

const enableAccount = (web3) => {
  const privkey = process.env.BUYBACK_PRIV_KEY;
  const acct = web3.eth.accounts.privateKeyToAccount(privkey);
  web3.eth.accounts.wallet.add(privkey);
  console.log('enabled account: ', acct.address);
  return acct.address;
};

const voltBalanceOf = async (holderAddr) => {
  const web3 = loadWeb3();
  const inst = new web3.eth.Contract(erc20safeABI, volt);
  const balance = await inst.methods.balanceOf(holderAddr).call({});
  return new BigNumber(balance).toFixed();
};

const calcReceivedVolt = async (txHash) => {
  const web3 = loadWeb3();
  const transferEvtABI = erc20safeABI.filter((c) => c.name === 'Transfer' && c.type === 'event')[0];
  const transferEvtSig = web3.eth.abi.encodeEventSignature(transferEvtABI);

  const r = await web3.eth.getTransactionReceipt(txHash);
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
          console.log('VALUE: ', value);
          console.log('TOTAL: ', total);
          console.log(
            `Recv ${web3.utils.fromWei(value)} VOLT from ${fromAddr}, subtotal: ${web3.utils.fromWei(
              total.toFixed()
            )} VOLT`
          );
        }
      }
    }
  }
  console.log(`TOTAL received: ${web3.utils.fromWei(total.toFixed())} VOLT`);
  return total.toFixed();
};

const sendBuybackTx = async () => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const voltmakerInst = new web3.eth.Contract(voltmakerABI, voltmakerAddr);
  const buybackReceipt = await voltmakerInst.methods
    .convertMultiple(
      [busd, busd, weth, mtrg, mtrg, weth, mtrg, mtrg, mtrg, mtrg, mtrg, mtrg, weth, meter],
      [usdc, weth, wbtc, weth, busd, bnb, volt, usdc, meter, bnb, usdt, movr, volt, usdc]
    )
    .send({ from: ownerAddr });
  return buybackReceipt;
};

const fundGeyser = async (amount, duration) => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const geyserInst = new web3.eth.Contract(geyserABI, voltStakingGeyser);
  const data = await geyserInst.methods.getGeyserData().call();
  const { rewardToken: rewardTokenAddress } = data;
  const voltInst = new web3.eth.Contract(erc20safeABI, volt);

  console.log('reward token:', rewardTokenAddress);
  console.log('amount in wei:', amount);
  console.log('duration:', duration, 'seconds');
  const ar = await voltInst.methods.approve(voltStakingGeyser, amount).send({ from: ownerAddr });
  console.log('approve receipt:', ar);
  const fr = await geyserInst.methods.fundGeyser(amount, duration).send({ from: ownerAddr });
  console.log('fundGeyser receipt:', fr);
};

module.exports = {
  sendBuybackTx,
  calcReceivedVolt,
  fundGeyser,
  voltBalanceOf,
};
