import { createSmartAccountClient } from "permissionless";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import {
  type Address,
  decodeFunctionData,
  type Hex,
  encodeFunctionData,
  http,
  type PublicClient,
} from "viem";
import {
  entryPoint07Abi,
  getUserOperationHash,
  toSmartAccount,
  type SmartAccount,
} from "viem/account-abstraction";
import {
  createPhylaxPublicClient,
  type PhylaxPublicClient,
} from "../clients/index.js";
import { arbAgentAccountAbi } from "../abi/arbAgentAccount.js";
import {
  encodeExecuteCall,
  encodeExecuteWithMetadataCall,
  sessionAccountFromPrivateKey,
} from "../session/index.js";
import type {
  PhylaxGuardedExecutionParams,
  PhylaxArbitrumSepoliaRuntimeConfigInput,
  PhylaxRuntimeConfig,
  PhylaxSignedUserOperation,
  PhylaxUnsignedUserOperation,
  PhylaxUserOperationGasPriceQuote,
} from "../types.js";
import { arbitrumSepolia } from "viem/chains";

const PHYLAX_DEFAULT_PIMLICO_API_KEY = "pim_E9ajMLH7VMk8ZvyyYtvHjs";
export const PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_ADDRESSES = {
  factory: "0x4d76A69109f8700eF5A2c1aE4eA9fcF8Add62599",
  paymaster: "0xf3207d9556aa8ED9E4ddf610BfCeFE7EA4d88932",
  billingToken: "0x95074947def59a6860486437B62E1795cC105fDa",
  entryPoint: "0x0000000071727de22e5e9d8baf0edac6f37da032",
} as const satisfies Record<string, Address>;
const PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_BUNDLER_URL =
  `https://api.pimlico.io/v2/421614/rpc?apikey=${PHYLAX_DEFAULT_PIMLICO_API_KEY}`;
const PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_BUNDLER_ORIGIN = "https://phylax-sdk.vercel.app";

const DEFAULT_PAYMASTER_VERIFICATION_GAS_LIMIT = 150_000n;
const DEFAULT_PAYMASTER_POST_OP_GAS_LIMIT = 80_000n;
const STUB_SIGNATURE =
  "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

function getPhylaxPaymasterFields(config: PhylaxRuntimeConfig) {
  return {
    paymaster: config.addresses.paymaster,
    paymasterData: "0x" as Hex,
    paymasterVerificationGasLimit:
      config.paymasterVerificationGasLimit ??
      DEFAULT_PAYMASTER_VERIFICATION_GAS_LIMIT,
    paymasterPostOpGasLimit:
      config.paymasterPostOpGasLimit ?? DEFAULT_PAYMASTER_POST_OP_GAS_LIMIT,
  };
}

export function resolvePhylaxBundlerUrl(config: PhylaxRuntimeConfig): string {
  if (config.bundlerUrl) {
    return config.bundlerUrl;
  }

  if (config.chain.id === 421614) {
    return PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_BUNDLER_URL;
  }

  throw new Error(
    `No default Pimlico bundler URL configured for chain ${config.chain.id}. Provide bundlerUrl explicitly.`,
  );
}

export function createArbitrumSepoliaRuntimeConfig(
  input: PhylaxArbitrumSepoliaRuntimeConfigInput,
): PhylaxRuntimeConfig {
  return {
    chain: arbitrumSepolia,
    rpcUrl: input.rpcUrl,
    bundlerUrl: input.bundlerUrl ?? PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_BUNDLER_URL,
    bundlerOrigin:
      input.bundlerOrigin ?? PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_BUNDLER_ORIGIN,
    smartAccountAddress: input.smartAccountAddress,
    sessionPrivateKey: input.sessionPrivateKey,
    paymasterVerificationGasLimit: input.paymasterVerificationGasLimit,
    paymasterPostOpGasLimit: input.paymasterPostOpGasLimit,
    addresses: {
      factory: PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_ADDRESSES.factory,
      paymaster: PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_ADDRESSES.paymaster,
      billingToken:
        input.billingTokenAddress ??
        PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_ADDRESSES.billingToken,
      entryPoint: PHYLAX_DEFAULT_ARBITRUM_SEPOLIA_ADDRESSES.entryPoint,
    },
  };
}

function createBundlerTransport(config: PhylaxRuntimeConfig) {
  const headers = config.bundlerOrigin
    ? ({ Origin: config.bundlerOrigin } as Record<string, string>)
    : undefined;

  return http(resolvePhylaxBundlerUrl(config), {
    fetchOptions: headers ? { headers } : undefined,
  });
}

async function createPhylaxSmartAccount(
  config: PhylaxRuntimeConfig,
  publicClient: PhylaxPublicClient,
): Promise<SmartAccount> {
  const signer = sessionAccountFromPrivateKey(config.sessionPrivateKey);

  return toSmartAccount({
    client: publicClient,
    entryPoint: {
      abi: entryPoint07Abi,
      address: config.addresses.entryPoint,
      version: "0.7",
    },
    async getAddress() {
      return config.smartAccountAddress;
    },
    async getFactoryArgs() {
      return {
        factory: undefined,
        factoryData: undefined,
      };
    },
    async encodeCalls(calls) {
      if (calls.length !== 1) {
        throw new Error(
          "Phylax runtime only supports single guarded executions. Use sendGuardedExecution(...) instead of generic batching.",
        );
      }

      const [call] = calls;
      return encodeExecuteCall({
        target: call.to as Address,
        value: call.value,
        data: call.data ?? "0x",
        spendAmount: 0n,
      });
    },
    async decodeCalls(data) {
      const decoded = decodeFunctionData({
        abi: arbAgentAccountAbi,
        data,
      });

      if (decoded.functionName === "execute") {
        const [target, value, callData] = decoded.args;
        return [{ to: target, value, data: callData }];
      }

      if (decoded.functionName === "executeWithMetadata") {
        const [target, value, callData] = decoded.args;
        return [{ to: target, value, data: callData }];
      }

      throw new Error("Unsupported Phylax account callData payload.");
    },
    async getStubSignature() {
      return STUB_SIGNATURE;
    },
    async signMessage(parameters) {
      return signer.signMessage(parameters);
    },
    async signTypedData(parameters) {
      return signer.signTypedData(parameters);
    },
    async signUserOperation(parameters) {
      const userOperationHash = getUserOperationHash({
        userOperation: {
          ...parameters,
          sender: parameters.sender ?? config.smartAccountAddress,
          signature: "0x",
        } as PhylaxSignedUserOperation,
        entryPointAddress: config.addresses.entryPoint,
        entryPointVersion: "0.7",
        chainId: config.chain.id,
      });

      return signer.signMessage({
        message: {
          raw: userOperationHash,
        },
      });
    },
  });
}

export class PhylaxRuntimeClient {
  readonly config: PhylaxRuntimeConfig;
  readonly publicClient: PublicClient;
  readonly bundlerUrl: string;
  readonly pimlicoClient: ReturnType<typeof createPimlicoClient>;
  readonly smartAccount: SmartAccount;
  readonly smartAccountClient: ReturnType<typeof createSmartAccountClient>;

  private constructor(parameters: {
    config: PhylaxRuntimeConfig;
    publicClient: PhylaxPublicClient;
    bundlerUrl: string;
    pimlicoClient: ReturnType<typeof createPimlicoClient>;
    smartAccount: SmartAccount;
    smartAccountClient: ReturnType<typeof createSmartAccountClient>;
  }) {
    this.config = parameters.config;
    this.publicClient = parameters.publicClient;
    this.bundlerUrl = parameters.bundlerUrl;
    this.pimlicoClient = parameters.pimlicoClient;
    this.smartAccount = parameters.smartAccount;
    this.smartAccountClient = parameters.smartAccountClient;
  }

  static async create(config: PhylaxRuntimeConfig): Promise<PhylaxRuntimeClient> {
    const publicClient = createPhylaxPublicClient(config);
    const bundlerUrl = resolvePhylaxBundlerUrl(config);
    const bundlerTransport = createBundlerTransport(config);
    const smartAccount = await createPhylaxSmartAccount(config, publicClient);

    const pimlicoClient = createPimlicoClient({
      chain: config.chain,
      transport: bundlerTransport,
      entryPoint: {
        address: config.addresses.entryPoint,
        version: "0.7",
      },
    });

    const paymaster = {
      getPaymasterStubData: async () => getPhylaxPaymasterFields(config),
      getPaymasterData: async () => getPhylaxPaymasterFields(config),
    };

    const smartAccountClient = createSmartAccountClient({
      account: smartAccount,
      chain: config.chain,
      client: publicClient,
      bundlerTransport,
      paymaster,
      userOperation: {
        estimateFeesPerGas: async () => {
          const gasPrice = await pimlicoClient.getUserOperationGasPrice();
          return gasPrice.fast;
        },
      },
    });

    return new PhylaxRuntimeClient({
      config,
      publicClient,
      bundlerUrl,
      pimlicoClient,
      smartAccount,
      smartAccountClient,
    });
  }

  async getUserOperationGasPrice(): Promise<PhylaxUserOperationGasPriceQuote> {
    return this.pimlicoClient.getUserOperationGasPrice();
  }

  buildGuardedExecutionCallData(params: PhylaxGuardedExecutionParams): Hex {
    return encodeExecuteWithMetadataCall(params);
  }

  async buildUserOperation(parameters: {
    callData: Hex;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }): Promise<PhylaxUnsignedUserOperation> {
    return this.smartAccountClient.prepareUserOperation({
      account: this.smartAccount,
      callData: parameters.callData,
      maxFeePerGas: parameters.maxFeePerGas,
      maxPriorityFeePerGas: parameters.maxPriorityFeePerGas,
      paymaster: {
        getPaymasterStubData: async () => getPhylaxPaymasterFields(this.config),
        getPaymasterData: async () => getPhylaxPaymasterFields(this.config),
      },
      parameters: ["factory", "fees", "gas", "paymaster", "nonce"],
    }) as Promise<PhylaxUnsignedUserOperation>;
  }

  async buildGuardedUserOperation(
    parameters: PhylaxGuardedExecutionParams,
  ): Promise<PhylaxUnsignedUserOperation> {
    return this.buildUserOperation({
      callData: this.buildGuardedExecutionCallData(parameters),
    });
  }

  async signUserOperation(
    userOperation: PhylaxUnsignedUserOperation,
  ): Promise<PhylaxSignedUserOperation> {
    const normalizedUserOperation = {
      ...userOperation,
      sender: userOperation.sender ?? this.config.smartAccountAddress,
      callData: userOperation.callData,
    };

    if (!normalizedUserOperation.callData) {
      throw new Error("UserOperation callData is required before signing.");
    }

    if (
      normalizedUserOperation.callGasLimit === undefined ||
      normalizedUserOperation.preVerificationGas === undefined ||
      normalizedUserOperation.verificationGasLimit === undefined ||
      normalizedUserOperation.maxFeePerGas === undefined ||
      normalizedUserOperation.maxPriorityFeePerGas === undefined ||
      normalizedUserOperation.nonce === undefined
    ) {
      throw new Error(
        "UserOperation is incomplete. Build it via buildUserOperation(...) before signing.",
      );
    }

    const signableUserOperation =
      normalizedUserOperation as PhylaxSignedUserOperation;
    const signature = await this.smartAccount.signUserOperation(
      signableUserOperation,
    );

    return {
      ...signableUserOperation,
      signature,
    } as PhylaxSignedUserOperation;
  }

  async sendUserOperation(userOperation: PhylaxSignedUserOperation): Promise<Hex> {
    return this.smartAccountClient.sendUserOperation({
      ...userOperation,
      account: this.smartAccount,
      entryPointAddress: this.config.addresses.entryPoint,
    });
  }

  async sendGuardedExecution(
    parameters: PhylaxGuardedExecutionParams,
  ): Promise<{ userOperationHash: Hex; userOperation: PhylaxSignedUserOperation }> {
    const unsignedUserOperation = await this.buildGuardedUserOperation(parameters);
    const signedUserOperation = await this.signUserOperation(unsignedUserOperation);
    const userOperationHash = await this.sendUserOperation(signedUserOperation);

    return {
      userOperationHash,
      userOperation: signedUserOperation,
    };
  }

  async waitForUserOperationReceipt(hash: Hex) {
    return this.smartAccountClient.waitForUserOperationReceipt({ hash });
  }

  async getUserOperationReceipt(hash: Hex) {
    return this.smartAccountClient.getUserOperationReceipt({ hash });
  }

  async getUserOperation(hash: Hex) {
    return this.smartAccountClient.getUserOperation({ hash });
  }
}

export async function createPhylaxRuntimeClient(
  config: PhylaxRuntimeConfig,
): Promise<PhylaxRuntimeClient> {
  return PhylaxRuntimeClient.create(config);
}

export async function createArbitrumSepoliaRuntimeClient(
  input: PhylaxArbitrumSepoliaRuntimeConfigInput,
): Promise<PhylaxRuntimeClient> {
  return createPhylaxRuntimeClient(createArbitrumSepoliaRuntimeConfig(input));
}
