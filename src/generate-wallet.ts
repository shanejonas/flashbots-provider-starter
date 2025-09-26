import * as ethers from 'ethers';

// added this just for testing locally with some random private keys
const account = ethers.Wallet.createRandom();

console.log('Address:')
console.log(account.address);
console.log('Private Key:')
console.log(account.privateKey);
