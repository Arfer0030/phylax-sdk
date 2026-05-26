export interface ContractRules {
  maxDailyLimit: number;
  spentToday: number;
  sessionExpiry: number;
  whitelistedProtocols: {
    [address: string]: {
      name: string;
      isWhitelisted: boolean;
    };
  };
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  emitter: "AI Agent" | "Bundler ERC-4337" | "Paymaster" | "Guardrail Contract" | "State";
  message: string;
}

export interface SimulationResult {
  parsedAction: {
    target: string;
    valueInUsdc: number;
    protocol: string;
    explanation: string;
  };
  status: "SUCCESS" | "REVERTED";
  reasons: string[];
  rulesState: ContractRules;
  isGeminiUsed: boolean;
}
