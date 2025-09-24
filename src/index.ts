import * as ethers from "ethers";
import { FlashbotsBundleProvider, RelayResponseError, FlashbotsBundleResolution } from "@flashbots/ethers-provider-bundle";

const NUM_BLOCKS_TO_WAIT = 1;

const network = ethers.Network.from({
  name: "mainnet",
  chainId: 1
});

const provider = new ethers.JsonRpcProvider("https://rpc.flashbots.net", network, {
  batchMaxSize: 1 // disable batch requests. flashbots doesnt support it right now
});

const authSigner = ethers.Wallet.createRandom();

const main = async () => {
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider as any, // TODO: fix types
    authSigner as any, // TODO: fix types
    process.env.RELAY_URL || "https://relay.flashbots.net"
  );
  console.log("Flashbots provider created");

  const signedBundle = await flashbotsProvider.signBundle([
    {
      signedTransaction: "0x02f874018201448438f6571a850127bd3b0a82520894be68cdb1fd8c5cd82fc77e45597901484ea4b19a87b1a2bc2ec5000080c001a0a7fc455016f8224a5443cfc41b2f7ca435ce1b359c3d19d47e75633f344394c7a0056a67fc828a74dc324f7d7d9dd2659a2770621eaca29b1e7aee42d4b73225fb"
    },
    {
      signedTransaction: "0x02f874018201448438f6571a850127bd3b0a82520894be68cdb1fd8c5cd82fc77e45597901484ea4b19a87b1a2bc2ec5000080c001a0a7fc455016f8224a5443cfc41b2f7ca435ce1b359c3d19d47e75633f344394c7a0056a67fc828a74dc324f7d7d9dd2659a2770621eaca29b1e7aee42d4b73225fb"
    },
  ]);
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

main();
