//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd

const voltmakerABI = require('./abi/voltmaker.json');
const erc20safeABI = require('./abi/erc20safe.json').abi;
const geyserABI = require('./abi/geyser.json').abi;
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const { thetamain } = require('./const');

const loadWeb3 = () => {
  const web3 = new Web3(thetamain.rpcUrl);
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
  const inst = new web3.eth.Contract(erc20safeABI, thetamain.volt);
  const balance = await inst.methods.balanceOf(holderAddr).call({});
  return new BigNumber(balance).toFixed();
};

const bulkCalcReceivedVolt = async (txHashs) => {
  const totals = await Promise.all(txHashs.map(calcReceivedVolt));
  return totals.reduce((sum, t) => (t ? sum.plus(t) : sum), new BigNumber(0));
};

const calcReceivedVolt = async (txHash) => {
  const web3 = loadWeb3();
  const transferEvtABI = erc20safeABI.filter((c) => c.name === 'Transfer' && c.type === 'event')[0];
  const transferEvtSig = web3.eth.abi.encodeEventSignature(transferEvtABI);

  const r = await web3.eth.getTransactionReceipt(txHash);
  console.log(r);
  let total = new BigNumber(0);
  for (const e of r.logs) {
    if (e.topics && e.topics[0] === transferEvtSig) {
      const decoded = web3.eth.abi.decodeLog(transferEvtABI.inputs, e.data, e.topics.slice(1));
      const { from, to, value } = decoded;
      const fromAddr = from.toLowerCase();
      const toAddr = to.toLowerCase();
      if (e.address.toLowerCase() === thetamain.volt && toAddr === thetamain.voltHolder.toLowerCase()) {
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
  console.log(`TOTAL received: ${web3.utils.fromWei(total.toFixed())} VOLT`);
  return total.toFixed();
};
const getFactory = async () => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const voltmakerInst = new web3.eth.Contract(voltmakerABI, thetamain.voltmakerAddr);
  const factory = await voltmakerInst.methods.factory().call({});
  console.log('FACTORY: ', factory);
  return factory;
};

const getBridge = async (token) => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const voltmakerInst = new web3.eth.Contract(voltmakerABI, thetamain.voltmakerAddr);
  const bridge = await voltmakerInst.methods.bridgeFor(token).call({});
  console.log('bridge: ', bridge);
  return bridge;
};

const sendBuybackTx = async () => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const voltmakerInst = new web3.eth.Contract(voltmakerABI, thetamain.voltmakerAddr);
  const buybackReceipt = await voltmakerInst.methods
    .convertMultiple(
      [
        thetamain.tfuel,
        thetamain.busd,
        thetamain.tfuel,
        thetamain.weth,
        thetamain.busd,
        thetamain.usdc,
        thetamain.tfuel,
        thetamain.tfuel,
      ],
      [
        thetamain.volt,
        thetamain.usdc,
        thetamain.mtrg,
        thetamain.tfuel,
        thetamain.volt,
        thetamain.tfuel,
        thetamain.bnb,
        thetamain.busd,
      ]
    )
    .send({ from: ownerAddr, gas: 4700000 });
  return buybackReceipt;
};

const fundGeyser = async (amount, duration) => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const geyserInst = new web3.eth.Contract(geyserABI, thetamain.voltStakingGeyser);
  const data = await geyserInst.methods.getGeyserData().call();
  const { rewardToken: rewardTokenAddress } = data;
  const voltInst = new web3.eth.Contract(erc20safeABI, thetamain.volt);

  console.log('reward token:', rewardTokenAddress);
  console.log('amount in wei:', amount.toFixed());
  console.log('duration:', duration, 'seconds');
  const ar = await voltInst.methods
    .approve(thetamain.voltStakingGeyser, amount)
    .send({ from: ownerAddr, gas: 4700000 });
  console.log('approve receipt:', ar);
  const fr = await geyserInst.methods.fundGeyser(amount, duration).send({ from: ownerAddr, gas: 4700000 });
  console.log('fundGeyser receipt:', fr);
};

module.exports = {
  sendBuybackTx,
  bulkCalcReceivedVolt,
  calcReceivedVolt,
  fundGeyser,
  voltBalanceOf,
  getFactory,
  getBridge,
};
