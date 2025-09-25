#!/usr/bin/env node

import * as ethers from "ethers";
import fs from "fs";
import { UPSTREAM_RPC_URL } from "./constants.js";

const network = ethers.Network.from({
  name: "mainnet",
  chainId: 1
});

const provider = new ethers.JsonRpcProvider(UPSTREAM_RPC_URL, network, {
  batchMaxSize: 1
});

// Configuration - get from environment variables
const FUNDING_PRIVATE_KEY = process.env.FUNDING_PRIVATE_KEY;
const NFT_PRIVATE_KEY = process.env.NFT_PRIVATE_KEY;
const TARGET_ADDRESS = process.env.TARGET_ADDRESS;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const NFT_TOKEN_ID = process.env.NFT_TOKEN_ID ? parseInt(process.env.NFT_TOKEN_ID) : undefined;

// Validate required environment variables
const requiredEnvVars = {
  FUNDING_PRIVATE_KEY,
  NFT_PRIVATE_KEY,
  TARGET_ADDRESS,
  NFT_CONTRACT_ADDRESS,
  NFT_TOKEN_ID
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => value === undefined || value === '')
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  ${varName}`);
  });
  process.exit(1);
}

type TxInfo = {
  hash: string;
  signedTransaction: string;
}

export const generateTransactions = async (): Promise<TxInfo[]> => {
  const transactions: TxInfo[] = [];

  // Create wallets
  const fundingWallet = new ethers.Wallet(FUNDING_PRIVATE_KEY!, provider);
  const nftWallet = new ethers.Wallet(NFT_PRIVATE_KEY!, provider);

  console.log("Funding wallet address:", fundingWallet.address);
  console.log("NFT wallet address:", nftWallet.address);

  // 1. Generate funding transaction
  console.log("Creating funding transaction...");
  const fundingTx = {
    to: TARGET_ADDRESS!,
    value: ethers.parseEther("0.1"), // 0.1 ETH
    gasLimit: 21000,
    gasPrice: (await provider.getFeeData()).gasPrice || ethers.parseUnits("20", "gwei"),
    nonce: await provider.getTransactionCount(fundingWallet.address, "latest"),
    chainId: 1
  };

  const signedFundingTx = await fundingWallet.signTransaction(fundingTx);
  const fundingTxHash = ethers.keccak256(signedFundingTx);

  transactions.push({
    hash: fundingTxHash,
    signedTransaction: signedFundingTx
  });

  console.log("Funding transaction created:", fundingTxHash);

  // 2. Generate NFT transfer transaction
  console.log("Creating NFT transfer transaction...");

  // ERC721 transfer function signature: transferFrom(address,address,uint256)
  const transferInterface = new ethers.Interface([
    "function transferFrom(address from, address to, uint256 tokenId)"
  ]);

  const transferData = transferInterface.encodeFunctionData("transferFrom", [
    TARGET_ADDRESS,
    nftWallet.address,
    NFT_TOKEN_ID
  ]);

  const nftTx = {
    to: NFT_CONTRACT_ADDRESS!,
    data: transferData,
    gasLimit: 100000,
    gasPrice: (await provider.getFeeData()).gasPrice || ethers.parseUnits("20", "gwei"),
    nonce: await provider.getTransactionCount(nftWallet.address, "latest"),
    chainId: 1
  };

  const signedNftTx = await nftWallet.signTransaction(nftTx);
  const nftTxHash = ethers.keccak256(signedNftTx);

  transactions.push({
    hash: nftTxHash,
    signedTransaction: signedNftTx
  });

  console.log("NFT transfer transaction created:", nftTxHash);

  return transactions;
};

const main = async () => {
  try {
    console.log("Generating transactions...");
    const transactions = await generateTransactions();

    // Save to transactions.json
    fs.writeFileSync('transactions.json', JSON.stringify(transactions, null, 2), 'utf8');
    console.log("Transactions saved to transactions.json");

    console.log("Generated", transactions.length, "transactions:");
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. Hash: ${tx.hash}`);
    });

  } catch (error) {
    console.error("Error generating transactions:", error);
    process.exit(1);
  }
};

main();
