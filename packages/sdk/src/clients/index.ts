import { privateKeyToAccount } from "viem/accounts";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";
import type { PhylaxSdkConfig } from "../types.js";

export function createPhylaxPublicClient(config: PhylaxSdkConfig) {
  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
}

export function createPhylaxLocalWalletClient(
  config: PhylaxSdkConfig,
  privateKey: `0x${string}`,
) {
  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
}

export async function resolveWalletAccount(
  walletClient: WalletClient,
): Promise<Account | Address> {
  if (walletClient.account) {
    return walletClient.account;
  }

  const [address] = await walletClient.getAddresses();
  if (!address) {
    throw new Error("Wallet client has no connected account.");
  }

  return address;
}

export type PhylaxPublicClient = PublicClient;
export type PhylaxWalletClient = WalletClient;
