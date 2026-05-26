import { encodeFunctionData } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { arbAgentAccountAbi } from "../abi/arbAgentAccount.js";
import type { ExecuteWithMetadataParams, SessionKeyMaterial } from "../types.js";

export function generateSessionKey(): SessionKeyMaterial {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  return {
    privateKey,
    address: account.address,
  };
}

export function sessionAccountFromPrivateKey(privateKey: `0x${string}`) {
  return privateKeyToAccount(privateKey);
}

export function encodeExecuteCall(params: {
  target: `0x${string}`;
  value?: bigint;
  data: `0x${string}`;
  spendAmount: bigint;
}) {
  return encodeFunctionData({
    abi: arbAgentAccountAbi,
    functionName: "execute",
    args: [params.target, params.value ?? BigInt(0), params.data, params.spendAmount],
  });
}

export function encodeExecuteWithMetadataCall(params: ExecuteWithMetadataParams) {
  return encodeFunctionData({
    abi: arbAgentAccountAbi,
    functionName: "executeWithMetadata",
    args: [
      params.target,
      params.value ?? BigInt(0),
      params.data,
      params.spendAmount,
      params.action,
      params.context,
    ],
  });
}
