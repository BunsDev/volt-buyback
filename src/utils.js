//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd

const voltmakerABI = require('./abi/voltmaker.json');
const erc20safeABI = require('./abi/erc20safe.json').abi;
const geyserABI = require('./abi/geyser.json').abi;
const uniswapv2FactoryABI = require('./abi/UniswapV2Factory.json').abi;
const Web3 = require('web3');
const meterify = require('meterify').meterify;
const BigNumber = require('bignumber.js');
const { metermain } = require('./const');

const loadWeb3 = () => {
  const web3 = meterify(new Web3(), metermain.rpcUrl);
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
  const inst = new web3.eth.Contract(erc20safeABI, metermain.volt);
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
        if (e.address.toLowerCase() === metermain.volt && toAddr === metermain.voltHolder.toLowerCase()) {
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

const sendBuybackTx = async (pairs) => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const voltmakerInst = new web3.eth.Contract(voltmakerABI, metermain.voltmakerAddr);
  const token0s = pairs.map((p) => metermain[p[0]]);
  const token1s = pairs.map((p) => metermain[p[1]]);
  const buybackReceipt = await voltmakerInst.methods.convertMultiple(token0s, token1s).send({ from: ownerAddr });
  return buybackReceipt;
};

const fundGeyser = async (amount, duration) => {
  const web3 = loadWeb3();
  const ownerAddr = enableAccount(web3);
  const geyserInst = new web3.eth.Contract(geyserABI, metermain.voltStakingGeyser);
  const data = await geyserInst.methods.getGeyserData().call();
  const { rewardToken: rewardTokenAddress } = data;
  const voltInst = new web3.eth.Contract(erc20safeABI, metermain.volt);

  console.log('reward token:', rewardTokenAddress);
  console.log('amount in wei:', amount.toString());
  console.log('duration:', duration, 'seconds');
  const ar = await voltInst.methods.approve(metermain.voltStakingGeyser, amount).send({ from: ownerAddr });
  console.log('approve receipt:', ar);
  const fr = await geyserInst.methods.fundGeyser(amount, duration).send({ from: ownerAddr });
  console.log('fundGeyser receipt:', fr);
};

const balanceOfPair = async (token0, token1) => {
  const web3 = loadWeb3();
  const inst = new web3.eth.Contract(uniswapv2FactoryABI, metermain.uniswapv2Factory);
  const pair = await inst.methods.getPair(token0, token1).call({});
  const pairInst = new web3.eth.Contract(erc20safeABI, pair);
  const balance = await pairInst.methods.balanceOf(metermain.voltmakerAddr).call({});
  const decimals = await pairInst.methods.decimals().call({});
  return { balance, decimals };
  /*
  IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(token0, token1));
        require(address(pair) != address(0), "VoltMaker: Invalid pair");
        // balanceOf: S1 - S4: OK
        // transfer: X1 - X5: OK
        IERC20(address(pair)).safeTransfer(
            address(pair),
            pair.balanceOf(address(this))
        );
  */
};

const getValidPairs = async () => {
  let validPairs = [];
  for (const p of metermain.pairs) {
    const token0Name = p[0];
    const token1Name = p[1];
    const token0 = metermain[token0Name];
    const token1 = metermain[token1Name];

    const { balance, decimals } = await balanceOfPair(token0, token1);
    if (Number(balance) === NaN) {
      console.log(`invalid pair ${token0Name}-${token1Name} with raw balance ${balance}`);
      continue;
    }
    const balanceWDecimals = new BigNumber(balance).div(`1e${decimals}`);
    console.log(`balance: ${balance} with decimals: ${decimals}`);
    if (balanceWDecimals.isLessThanOrEqualTo(0.01)) {
      console.log(`invalid pair ${token0Name}-${token1Name} with balance ${balanceWDecimals}`);
      continue;
    }
    console.log(`valid pair: ${token0Name}-${token1Name} with balance ${balanceWDecimals}`);
    validPairs.push([token0Name, token1Name]);
  }
  return validPairs;
};

module.exports = {
  sendBuybackTx,
  calcReceivedVolt,
  fundGeyser,
  voltBalanceOf,
  balanceOfPair,
  getValidPairs,
};
