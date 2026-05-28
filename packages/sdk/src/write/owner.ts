import { erc20Abi, getContract, type Address, type Hash } from "viem";
import { arbAgentAccountAbi } from "../abi/arbAgentAccount.js";
import { arbAgentAccountFactoryAbi } from "../abi/arbAgentAccountFactory.js";
import { arbAgentPaymasterAbi } from "../abi/arbAgentPaymaster.js";
import { mockUsdcAbi } from "../abi/mockUsdc.js";
import type {
  ContractWriteResult,
  PhylaxSdkConfig,
  ProvisionGuardedAccountParams,
  TopUpGasTankResult,
} from "../types.js";
import type { PhylaxPublicClient, PhylaxWalletClient } from "../clients/index.js";
import { resolveWalletAccount } from "../clients/index.js";

async function simulateAndWrite(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  parameters: Parameters<PhylaxPublicClient["simulateContract"]>[0],
): Promise<Hash> {
  const account = await resolveWalletAccount(walletClient);

  // Apply a 30% gas fee buffer to circumvent the "max fee per gas less than block base fee" sequencer error on Arbitrum
  let feeOverrides = {};
  try {
    const fees = await publicClient.estimateFeesPerGas();
    if (fees.maxFeePerGas) {
      feeOverrides = {
        maxFeePerGas: (fees.maxFeePerGas * BigInt(130)) / BigInt(100),
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas
          ? (fees.maxPriorityFeePerGas * BigInt(130)) / BigInt(100)
          : undefined,
      };
    }
  } catch (err) {
    console.warn("Failed to estimate fees per gas, relying on defaults:", err);
  }

  const { request } = await publicClient.simulateContract({
    account,
    ...parameters,
    ...feeOverrides,
  } as any);

  return walletClient.writeContract(request as any);
}

export async function provisionGuardedAccount(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  config: PhylaxSdkConfig,
  params: ProvisionGuardedAccountParams,
): Promise<ContractWriteResult> {
  const targetWhitelist = params.whitelist.filter((entry) => entry.type === "contract");
  const recipientWhitelist = params.whitelist.filter((entry) => entry.type === "wallet");

  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: config.addresses.factory,
    abi: arbAgentAccountFactoryAbi,
    functionName: "createConfiguredAgentAccount",
    args: [
      params.owner,
      params.agentName,
      params.sessionSigner,
      BigInt(params.sessionExpiry),
      BigInt(params.spendWindowDuration),
      params.maxDailyLimit,
      targetWhitelist.map((target) => ({ name: target.name, addr: target.address })),
      recipientWhitelist.map((recipient) => ({
        name: recipient.name,
        addr: recipient.address,
      })),
    ],
  });

  return { hash };
}

export async function setAgentName(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  accountAddress: Address,
  agentName: string,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: accountAddress,
    abi: arbAgentAccountAbi,
    functionName: "setAgentName",
    args: [agentName],
  });

  return { hash };
}

export async function setSessionSigner(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  accountAddress: Address,
  sessionSigner: Address,
  sessionExpiry: number | bigint,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: accountAddress,
    abi: arbAgentAccountAbi,
    functionName: "setSessionSigner",
    args: [sessionSigner, BigInt(sessionExpiry)],
  });

  return { hash };
}

export async function revokeSessionSigner(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  accountAddress: Address,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: accountAddress,
    abi: arbAgentAccountAbi,
    functionName: "revokeSessionSigner",
    args: [],
  });

  return { hash };
}

export async function setMaxDailyLimit(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  accountAddress: Address,
  maxDailyLimit: bigint,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: accountAddress,
    abi: arbAgentAccountAbi,
    functionName: "setMaxDailyLimit",
    args: [maxDailyLimit],
  });

  return { hash };
}

export async function setSpendWindowDuration(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  accountAddress: Address,
  spendWindowDuration: number | bigint,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: accountAddress,
    abi: arbAgentAccountAbi,
    functionName: "setSpendWindowDuration",
    args: [BigInt(spendWindowDuration)],
  });

  return { hash };
}

export async function setWhitelistTarget(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  accountAddress: Address,
  targetAddress: Address,
  targetName: string,
  isAllowed: boolean,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: accountAddress,
    abi: arbAgentAccountAbi,
    functionName: "setProtocolWhitelist",
    args: [targetAddress, targetName, isAllowed],
  });

  return { hash };
}

export async function setWhitelistRecipient(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  accountAddress: Address,
  recipientAddress: Address,
  recipientName: string,
  isAllowed: boolean,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: accountAddress,
    abi: arbAgentAccountAbi,
    functionName: "setRecipientWhitelist",
    args: [recipientAddress, recipientName, isAllowed],
  });

  return { hash };
}

export async function claimTestnetUSDC(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  config: PhylaxSdkConfig,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: config.addresses.billingToken,
    abi: mockUsdcAbi,
    functionName: "claimTestnetUSDC",
    args: [],
  });

  return { hash };
}

export async function approveBillingTokenIfNeeded(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  config: PhylaxSdkConfig,
  amount: bigint,
): Promise<Hash | undefined> {
  const account = await resolveWalletAccount(walletClient);
  const ownerAddress = typeof account === "string" ? account : account.address;

  const token = getContract({
    address: config.addresses.billingToken,
    abi: erc20Abi,
    client: publicClient,
  });

  const allowance = await token.read.allowance([
    ownerAddress,
    config.addresses.paymaster,
  ]);
  if (allowance >= amount) {
    return undefined;
  }

  return simulateAndWrite(publicClient, walletClient, {
    address: config.addresses.billingToken,
    abi: erc20Abi,
    functionName: "approve",
    args: [config.addresses.paymaster, amount],
  });
}

export async function topUpGasTank(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  config: PhylaxSdkConfig,
  amount: bigint,
): Promise<TopUpGasTankResult> {
  const approvalHash = await approveBillingTokenIfNeeded(
    publicClient,
    walletClient,
    config,
    amount,
  );

  const topUpHash = await simulateAndWrite(publicClient, walletClient, {
    address: config.addresses.paymaster,
    abi: arbAgentPaymasterAbi,
    functionName: "topUpGasTank",
    args: [amount],
  });

  return { approvalHash, topUpHash };
}

export async function registerSponsoredAccount(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  config: PhylaxSdkConfig,
  accountAddress: Address,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: config.addresses.paymaster,
    abi: arbAgentPaymasterAbi,
    functionName: "registerSponsoredAccount",
    args: [accountAddress],
  });

  return { hash };
}

export async function removeSponsoredAccount(
  publicClient: PhylaxPublicClient,
  walletClient: PhylaxWalletClient,
  config: PhylaxSdkConfig,
  accountAddress: Address,
): Promise<ContractWriteResult> {
  const hash = await simulateAndWrite(publicClient, walletClient, {
    address: config.addresses.paymaster,
    abi: arbAgentPaymasterAbi,
    functionName: "removeSponsoredAccount",
    args: [accountAddress],
  });

  return { hash };
}
