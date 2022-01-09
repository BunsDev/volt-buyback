//The periodical call method, contract's address is 0xEd70BbE825D9ef3260cB31c60c2639aEEf90Dacd

require('dotenv').config();
const { getValidPairs } = require('./utilsOnTheta');

(async () => {
  try {
    const pairs = await getValidPairs();
    console.log(pairs);
  } catch (e) {
    console.log('Error Happened: ', e);
    process.exit(-2);
  }
})();
