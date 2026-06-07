import type { PhylaxSdkConfig } from "@phylax-sdk/sdk";
import { getAddress, isAddress } from "viem";
import { arbitrumSepolia } from "wagmi/chains";

function readAddress(value: string | undefined) {
  if (!value || !isAddress(value)) {
    return null;
  }

  return getAddress(value);
}

export function getPhylaxSdkConfig(): PhylaxSdkConfig | null {
  const factory = readAddress(process.env.NEXT_PUBLIC_PHYLAX_FACTORY_ADDRESS);
  const paymaster = readAddress(process.env.NEXT_PUBLIC_PHYLAX_PAYMASTER_ADDRESS);
  const billingToken = readAddress(process.env.NEXT_PUBLIC_PHYLAX_BILLING_TOKEN_ADDRESS);
  const entryPoint = readAddress(process.env.NEXT_PUBLIC_PHYLAX_ENTRYPOINT_ADDRESS);
  const rpcUrl = process.env.NEXT_PUBLIC_PHYLAX_RPC_URL;

  if (!factory || !paymaster || !billingToken || !entryPoint || !rpcUrl) {
    return null;
  }

  return {
    chain: arbitrumSepolia,
    rpcUrl,
    addresses: {
      factory,
      paymaster,
      billingToken,
      entryPoint,
    },
  };
}

export const phylaxSdkConfig = getPhylaxSdkConfig();
