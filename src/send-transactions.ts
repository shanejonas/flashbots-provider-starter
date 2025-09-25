import * as ethers from "ethers";
import fs from "fs";

import { FlashbotsBundleProvider, RelayResponseError, FlashbotsBundleResolution } from "@flashbots/ethers-provider-bundle";
import { NUM_BLOCKS_TO_WAIT, UPSTREAM_RPC_URL } from "./constants.js";

const network = ethers.Network.from({
  name: "mainnet",
  chainId: 1
});

const provider = new ethers.JsonRpcProvider(UPSTREAM_RPC_URL, network, {
  batchMaxSize: 1 // disable batch requests. flashbots doesnt support it right now
});

const authSigner = ethers.Wallet.createRandom();

type TxInfo = {
  hash: string;
  signedTransaction: string;
}

export const transactions: TxInfo[] = fs.readFileSync('transactions.json', 'utf8') ? JSON.parse(fs.readFileSync('transactions.json', 'utf8')) : [];

export const send = async () => {
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider as any, // TODO: fix types
    authSigner as any, // TODO: fix types
    process.env.RELAY_URL || "https://relay.flashbots.net"
  );

  const signedBundle = await flashbotsProvider.signBundle(transactions.map((tx) => ({
    signedTransaction: tx.signedTransaction
  })));
  const maxBlockNumber = await provider.getBlockNumber() + NUM_BLOCKS_TO_WAIT;
  console.log("Max block number:", maxBlockNumber);

  console.log("Signed Bundle:", signedBundle);

  const bundleReceipt = await flashbotsProvider.sendRawBundle(signedBundle, maxBlockNumber);

  console.log('Sent Bundle to relay.')

  // wait for it to land
  if ('error' in bundleReceipt) {
    console.error('Error sending bundle:', bundleReceipt);
  } else {
    const resolution = await bundleReceipt.wait();
    const status = resolution === FlashbotsBundleResolution.BundleIncluded ? 'included' : 'not included';
    console.log(`Bundle was ${status}`);
  }

};

send().catch((error: Error) => {
    console.error('Error sending bundle:', error);
});
