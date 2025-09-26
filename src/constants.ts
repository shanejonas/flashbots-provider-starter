import * as ethers from "ethers";

export const NUM_BLOCKS_TO_WAIT = process.env.NUM_BLOCKS_TO_WAIT ? parseInt(process.env.NUM_BLOCKS_TO_WAIT) : 1;
export const UPSTREAM_RPC_URL = process.env.UPSTREAM_RPC_URL || "https://rpc.flashbots.net";
export const MAX_FEE_PER_GAS = ethers.parseUnits("60", "gwei");
export const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits("1", "gwei");
