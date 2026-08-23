import { createPublicClient, http } from "viem";
import { arcTestnet } from "viem/chains";

export const arcRpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network";

export const arcPublicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(arcRpcUrl),
});
