# Flashbots Starter

demonstrates how to submit a pre-signed transaction bundle to the Flashbots relay using `@flashbots/ethers-provider-bundle` and `ethers`.

## Getting Started

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Run the compiled script: `node dist/index.js`

The example signs and submits two placeholder transactions, waits up to 25 blocks for inclusion, and logs whether the bundle was included on-chain.
