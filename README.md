# Flashbots Starter

Demonstrates how to submit a pre-signed transaction bundle to the Flashbots relay using `@flashbots/ethers-provider-bundle` and `ethers`.

## Getting Started

1. Install dependencies: `npm install`

2. Sign transactions for the bundle. Funding + NFT Transfer
```bash
FUNDING_PRIVATE_KEY=0x<privkey> \
NFT_PRIVATE_KEY=0x<privkey>
TARGET_ADDRESS=0x<targetaddress> \
NFT_CONTRACT_ADDRESS=0x<contractaddress> \
NFT_TOKEN_ID=1 \
npm run generate-tx
```

3. Send the bundle to the Flashbots relay
```bash
npm run send-bundle
```
