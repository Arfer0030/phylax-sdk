import { erc20Abi, getContract, zeroAddress, type Address } from "viem";
import { arbAgentAccountAbi } from "../abi/arbAgentAccount.js";
import { arbAgentAccountFactoryAbi } from "../abi/arbAgentAccountFactory.js";
import { arbAgentPaymasterAbi } from "../abi/arbAgentPaymaster.js";
import { mockUsdcAbi } from "../abi/mockUsdc.js";
import type {
  ExecutionActivityLog,
  GasSettlementLog,
  GasTankState,
  GuardedAccountSessionStatus,
  GuardedAccountState,
  PhylaxSdkConfig,
} from "../types.js";
import type { PhylaxPublicClient } from "../clients/index.js";

function getSessionStatus(sessionSigner: Address, sessionExpiry: bigint): GuardedAccountSessionStatus {
  if (sessionSigner === zeroAddress || sessionExpiry === BigInt(0)) {
    return "unconfigured";
  }

  const now = BigInt(Math.floor(Date.now() / 1000));
  if (sessionExpiry <= now) {
    return "expired";
  }

  return "active";
}

export async function readOwnerAccountAddresses(
  publicClient: PhylaxPublicClient,
  config: PhylaxSdkConfig,
  owner: Address,
) {
  return publicClient.readContract({
    address: config.addresses.factory,
    abi: arbAgentAccountFactoryAbi,
    functionName: "getAccounts",
    args: [owner],
  });
}

export async function readGuardedAccountState(
  publicClient: PhylaxPublicClient,
  accountAddress: Address,
): Promise<GuardedAccountState> {
  const accountContract = getContract({
    address: accountAddress,
    abi: arbAgentAccountAbi,
    client: publicClient,
  });

  const [masterOwner, dashboardState, whitelistTargets, whitelistRecipients] = await Promise.all([
    accountContract.read.masterOwner(),
    accountContract.read.getDashboardState(),
    accountContract.read.getWhitelistTargets(),
    accountContract.read.getWhitelistRecipients(),
  ]);

  const [agentName, sessionSigner, sessionExpiry, spendWindowStart, spendWindowDuration, maxDailyLimit, spentInWindow] =
    dashboardState;
  const sessionExpiryValue = BigInt(sessionExpiry);
  const spendWindowStartValue = BigInt(spendWindowStart);
  const spendWindowDurationValue = BigInt(spendWindowDuration);
  const status = getSessionStatus(sessionSigner, sessionExpiryValue);

  return {
    address: accountAddress,
    masterOwner,
    agentName,
    sessionSigner,
    sessionExpiry: sessionExpiryValue,
    spendWindowStart: spendWindowStartValue,
    spendWindowDuration: spendWindowDurationValue,
    maxDailyLimit,
    spentInWindow,
    effectiveSpentInWindow: status === "expired" ? BigInt(0) : spentInWindow,
    whitelistTargets: whitelistTargets.map((target) => ({
      name: target.name,
      address: target.target,
    })),
    whitelistRecipients: whitelistRecipients.map((recipient) => ({
      name: recipient.name,
      address: recipient.recipient,
    })),
    whitelist: [
      ...whitelistTargets.map((target) => ({
        name: target.name,
        address: target.target,
        type: "contract" as const,
      })),
      ...whitelistRecipients.map((recipient) => ({
        name: recipient.name,
        address: recipient.recipient,
        type: "wallet" as const,
      })),
    ],
    status,
  };
}

export async function readOwnerGuardedAccounts(
  publicClient: PhylaxPublicClient,
  config: PhylaxSdkConfig,
  owner: Address,
) {
  const accountAddresses = await readOwnerAccountAddresses(publicClient, config, owner);

  return Promise.all(
    accountAddresses.map((accountAddress) =>
      readGuardedAccountState(publicClient, accountAddress),
    ),
  );
}

export async function readGasTankState(
  publicClient: PhylaxPublicClient,
  config: PhylaxSdkConfig,
  owner: Address,
): Promise<GasTankState> {
  const paymaster = getContract({
    address: config.addresses.paymaster,
    abi: arbAgentPaymasterAbi,
    client: publicClient,
  });

  const billingToken = getContract({
    address: config.addresses.billingToken,
    abi: [...erc20Abi, ...mockUsdcAbi],
    client: publicClient,
  });

  const [
    gasTankBalance,
    availableGasTankBalance,
    sponsoredStreamCount,
    billingTokenBalance,
    faucetAmount,
    faucetCooldown,
    lastFaucetClaimAt,
  ] = await Promise.all([
    paymaster.read.gasTankBalance([owner]),
    paymaster.read.availableGasTankBalance([owner]),
    paymaster.read.sponsoredStreamCount([owner]),
    billingToken.read.balanceOf([owner]),
    billingToken.read.faucetAmount(),
    billingToken.read.faucetCooldown(),
    billingToken.read.lastFaucetClaimAt([owner]),
  ]);

  return {
    owner,
    gasTankBalance,
    availableGasTankBalance,
    sponsoredStreamCount,
    billingTokenBalance,
    faucetAmount,
    faucetCooldown: BigInt(faucetCooldown),
    lastFaucetClaimAt: BigInt(lastFaucetClaimAt),
  };
}

export async function readExecutionActivityLogs(
  publicClient: PhylaxPublicClient,
  accountAddress: Address,
  {
    fromBlock,
    toBlock,
  }: {
    fromBlock?: bigint;
    toBlock?: bigint | "latest";
  } = {},
): Promise<ExecutionActivityLog[]> {
  const logs = await publicClient.getContractEvents({
    address: accountAddress,
    abi: arbAgentAccountAbi,
    eventName: "ExecutionMetadataLogged",
    fromBlock,
    toBlock,
  });

  return logs.map((log) => ({
    account: accountAddress,
    blockNumber: log.blockNumber ?? BigInt(0),
    transactionHash: log.transactionHash,
    logIndex: log.logIndex,
    target: log.args.target!,
    value: log.args.value!,
    spendAmount: log.args.spendAmount!,
    action: log.args.action!,
    context: log.args.context!,
    ownerBypass: log.args.ownerBypass!,
  }));
}

export async function readGasSettlementLogs(
  publicClient: PhylaxPublicClient,
  config: PhylaxSdkConfig,
  {
    owner,
    account,
    fromBlock,
    toBlock,
  }: {
    owner?: Address;
    account?: Address;
    fromBlock?: bigint;
    toBlock?: bigint | "latest";
  } = {},
): Promise<GasSettlementLog[]> {
  const logs = await publicClient.getContractEvents({
    address: config.addresses.paymaster,
    abi: arbAgentPaymasterAbi,
    eventName: "GasChargeSettled",
    args: {
      owner,
      account,
    },
    fromBlock,
    toBlock,
  });

  return logs.map((log) => ({
    owner: log.args.owner!,
    account: log.args.account!,
    blockNumber: log.blockNumber ?? BigInt(0),
    transactionHash: log.transactionHash,
    logIndex: log.logIndex,
    actualGasCost: log.args.actualGasCost!,
    totalCharge: log.args.totalCharge!,
    remainingGasTankBalance: log.args.remainingGasTankBalance!,
  }));
}
