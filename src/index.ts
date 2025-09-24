import * as ethers from "ethers";

import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";


// env vars required
if (!process.env.RPC_URL && typeof process.env.RPC_URL !== "string") {
  throw new Error("RPC_URL environment variable is required");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const authSigner = ethers.Wallet.createRandom();

const main = async () => {
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, authSigner);
  const signedBundle = await flashbotsProvider.signBundle([
    // our txes
    // 1. fund tx to address
    // 2. move nft to other address
  ]);
  const maxBlockNumber = await provider.getBlockNumber() + 25;
  const bundleReceipt = await flashbotsProvider.sendRawBundle(signedBundle, maxBlockNumber);
  console.log(bundleReceipt);
};

main();
