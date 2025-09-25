import * as ethers from 'ethers';

const account = ethers.Wallet.createRandom();

console.log('Address:')
console.log(account.address);
console.log('Private Key:')
console.log(account.privateKey);
