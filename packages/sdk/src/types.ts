import type { Address, Chain, Hex } from "viem";

export type PhylaxContractAddresses = {
  factory: Address;
  paymaster: Address;
  billingToken: Address;
  entryPoint: Address;
};

export type PhylaxSdkConfig = {
  chain: Chain;
  rpcUrl: string;
  bundlerUrl?: string;
  addresses: PhylaxContractAddresses;
};

export type SessionKeyMaterial = {
  privateKey: Hex;
  address: Address;
};

export type WhitelistTargetInput = {
  name: string;
  address: Address;
};

export type ProvisionGuardedAccountParams = {
  owner: Address;
  agentName: string;
  sessionSigner: Address;
  sessionExpiry: number | bigint;
  spendWindowDuration: number | bigint;
  maxDailyLimit: bigint;
  whitelist: WhitelistTargetInput[];
};

export type GuardedAccountSessionStatus = "active" | "expired" | "unconfigured";

export type GuardedAccountState = {
  address: Address;
  masterOwner: Address;
  agentName: string;
  sessionSigner: Address;
  sessionExpiry: bigint;
  spendWindowStart: bigint;
  spendWindowDuration: bigint;
  maxDailyLimit: bigint;
  spentInWindow: bigint;
  effectiveSpentInWindow: bigint;
  whitelist: WhitelistTargetInput[];
  status: GuardedAccountSessionStatus;
};

export type GasTankState = {
  owner: Address;
  gasTankBalance: bigint;
  availableGasTankBalance: bigint;
  sponsoredStreamCount: bigint;
  billingTokenBalance: bigint;
  faucetAmount: bigint;
  faucetCooldown: bigint;
  lastFaucetClaimAt: bigint;
};

export type ExecutionActivityLog = {
  account: Address;
  blockNumber: bigint;
  transactionHash: Hex;
  logIndex: number;
  target: Address;
  value: bigint;
  spendAmount: bigint;
  action: string;
  context: string;
  ownerBypass: boolean;
};

export type GasSettlementLog = {
  owner: Address;
  account: Address;
  blockNumber: bigint;
  transactionHash: Hex;
  logIndex: number;
  actualGasCost: bigint;
  totalCharge: bigint;
  remainingGasTankBalance: bigint;
};

export type ContractWriteResult = {
  hash: Hex;
};

export type TopUpGasTankResult = {
  approvalHash?: Hex;
  topUpHash: Hex;
};

export type ExecuteWithMetadataParams = {
  target: Address;
  value?: bigint;
  data: Hex;
  spendAmount: bigint;
  action: string;
  context: string;
};
