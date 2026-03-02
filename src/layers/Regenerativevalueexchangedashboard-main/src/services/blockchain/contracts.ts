/**
 * RVE Blockchain Integration Layer
 * Smart contract interfaces and Web3 integration
 */

// ============================================================================
// CONTRACT ABIS (Simplified for demonstration)
// ============================================================================

export const RVE_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const;

export const ASSET_REGISTRY_ABI = [
  'function createAsset(string memory symbol, string memory name, uint256 totalSupply, bytes32 impactHash) returns (uint256)',
  'function verifyAsset(uint256 assetId, bool verified) returns (bool)',
  'function getAsset(uint256 assetId) view returns (tuple(string symbol, string name, uint256 supply, bool verified, address custodian))',
  'function updateImpactMetrics(uint256 assetId, bytes32 metricsHash) returns (bool)',
  'event AssetCreated(uint256 indexed assetId, address indexed custodian, string symbol)',
  'event AssetVerified(uint256 indexed assetId, bool verified)',
] as const;

export const GOVERNANCE_ABI = [
  'function createProposal(string memory title, string memory description, uint256 votingPeriod) returns (uint256)',
  'function vote(uint256 proposalId, uint8 voteType) returns (bool)',
  'function executeProposal(uint256 proposalId) returns (bool)',
  'function stake(uint256 amount) returns (bool)',
  'function unstake(uint256 amount) returns (bool)',
  'function getVotingPower(address account) view returns (uint256)',
  'event ProposalCreated(uint256 indexed proposalId, address indexed proposer)',
  'event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 voteType, uint256 weight)',
  'event Staked(address indexed user, uint256 amount)',
  'event Unstaked(address indexed user, uint256 amount)',
] as const;

export const ORACLE_REGISTRY_ABI = [
  'function requestVerification(uint256 assetId, string memory verificationType) returns (uint256)',
  'function submitVerification(uint256 requestId, bytes memory data, uint256 confidence) returns (bool)',
  'function getVerificationStatus(uint256 requestId) view returns (uint8)',
  'event VerificationRequested(uint256 indexed requestId, uint256 indexed assetId)',
  'event VerificationSubmitted(uint256 indexed requestId, uint256 confidence)',
] as const;

export const DEFI_POOL_ABI = [
  'function addLiquidity(uint256 amount0, uint256 amount1, address to) returns (uint256 liquidity)',
  'function removeLiquidity(uint256 liquidity, address to) returns (uint256 amount0, uint256 amount1)',
  'function swap(uint256 amountIn, address tokenIn, uint256 minAmountOut) returns (uint256 amountOut)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function getAmountOut(uint256 amountIn, address tokenIn) view returns (uint256 amountOut)',
  'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out)',
  'event Mint(address indexed sender, uint256 amount0, uint256 amount1)',
  'event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)',
] as const;

// ============================================================================
// CONTRACT ADDRESSES (by network)
// ============================================================================

export const CONTRACT_ADDRESSES = {
  mainnet: {
    RVE_TOKEN: '0x0000000000000000000000000000000000000001',
    ASSET_REGISTRY: '0x0000000000000000000000000000000000000002',
    GOVERNANCE: '0x0000000000000000000000000000000000000003',
    ORACLE_REGISTRY: '0x0000000000000000000000000000000000000004',
    DEFI_ROUTER: '0x0000000000000000000000000000000000000005',
  },
  testnet: {
    RVE_TOKEN: '0x1000000000000000000000000000000000000001',
    ASSET_REGISTRY: '0x1000000000000000000000000000000000000002',
    GOVERNANCE: '0x1000000000000000000000000000000000000003',
    ORACLE_REGISTRY: '0x1000000000000000000000000000000000000004',
    DEFI_ROUTER: '0x1000000000000000000000000000000000000005',
  },
  polygon: {
    RVE_TOKEN: '0x2000000000000000000000000000000000000001',
    ASSET_REGISTRY: '0x2000000000000000000000000000000000000002',
    GOVERNANCE: '0x2000000000000000000000000000000000000003',
    ORACLE_REGISTRY: '0x2000000000000000000000000000000000000004',
    DEFI_ROUTER: '0x2000000000000000000000000000000000000005',
  },
} as const;

// ============================================================================
// BLOCKCHAIN SERVICE
// ============================================================================

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
    explorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
};

export class BlockchainService {
  private provider: any = null;
  private signer: any = null;
  private currentChain: string = 'mainnet';

  async connect(walletProvider?: 'metamask' | 'walletconnect'): Promise<string> {
    // Mock implementation - In production, use ethers.js or web3.js
    console.log('Connecting to wallet:', walletProvider);
    
    // Check if wallet is available
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('No Web3 wallet detected. Please install MetaMask.');
    }

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      // Store provider reference
      this.provider = (window as any).ethereum;

      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        const chain = Object.values(SUPPORTED_CHAINS).find(c => c.chainId === chainId);
        if (!chain) throw new Error('Unsupported chain');

        await this.provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: chain.name,
            rpcUrls: [chain.rpcUrl],
            nativeCurrency: chain.nativeCurrency,
            blockExplorerUrls: [chain.explorer],
          }],
        });
      } else {
        throw error;
      }
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const accounts = await this.provider.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available');
    }

    const signature = await this.provider.request({
      method: 'personal_sign',
      params: [message, accounts[0]],
    });

    return signature;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    // Convert from hex to decimal and format
    return (parseInt(balance, 16) / 1e18).toFixed(4);
  }

  async getChainId(): Promise<number> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const chainId = await this.provider.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  }

  // Contract interaction helpers
  async callContract(
    contractAddress: string,
    abi: readonly string[],
    method: string,
    params: any[] = []
  ): Promise<any> {
    // Mock implementation - use ethers.js Contract in production
    console.log('Calling contract:', { contractAddress, method, params });
    return { success: true, data: 'MOCK_RESULT' };
  }

  async sendTransaction(
    to: string,
    data: string,
    value?: string
  ): Promise<{ hash: string; wait: () => Promise<any> }> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const accounts = await this.provider.request({ method: 'eth_accounts' });
    
    const tx = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to,
        data,
        value: value ? `0x${parseInt(value).toString(16)}` : undefined,
      }],
    });

    return {
      hash: tx,
      wait: async () => {
        // Mock wait function
        return { status: 1, transactionHash: tx };
      },
    };
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();

// ============================================================================
// CONTRACT INTERACTION HELPERS
// ============================================================================

export const contractHelpers = {
  // RVE Token
  async getTokenBalance(address: string): Promise<string> {
    const network = await blockchainService.getChainId();
    const contractAddress = CONTRACT_ADDRESSES.mainnet.RVE_TOKEN; // Adjust based on network
    
    return blockchainService.callContract(
      contractAddress,
      RVE_TOKEN_ABI,
      'balanceOf',
      [address]
    );
  },

  async transferTokens(to: string, amount: string): Promise<string> {
    const network = await blockchainService.getChainId();
    const contractAddress = CONTRACT_ADDRESSES.mainnet.RVE_TOKEN;
    
    const tx = await blockchainService.callContract(
      contractAddress,
      RVE_TOKEN_ABI,
      'transfer',
      [to, amount]
    );

    return tx.hash;
  },

  // Governance
  async voteOnProposal(proposalId: number, voteType: 0 | 1 | 2): Promise<string> {
    const contractAddress = CONTRACT_ADDRESSES.mainnet.GOVERNANCE;
    
    const tx = await blockchainService.callContract(
      contractAddress,
      GOVERNANCE_ABI,
      'vote',
      [proposalId, voteType]
    );

    return tx.hash;
  },

  async stakeTokens(amount: string): Promise<string> {
    const contractAddress = CONTRACT_ADDRESSES.mainnet.GOVERNANCE;
    
    const tx = await blockchainService.callContract(
      contractAddress,
      GOVERNANCE_ABI,
      'stake',
      [amount]
    );

    return tx.hash;
  },

  // Asset Registry
  async createAsset(
    symbol: string,
    name: string,
    totalSupply: string,
    impactHash: string
  ): Promise<string> {
    const contractAddress = CONTRACT_ADDRESSES.mainnet.ASSET_REGISTRY;
    
    const tx = await blockchainService.callContract(
      contractAddress,
      ASSET_REGISTRY_ABI,
      'createAsset',
      [symbol, name, totalSupply, impactHash]
    );

    return tx.hash;
  },
};

// ============================================================================
// EVENT LISTENERS
// ============================================================================

export class ContractEventListener {
  private listeners: Map<string, Set<(event: any) => void>> = new Map();

  subscribe(eventName: string, callback: (event: any) => void): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventName)?.delete(callback);
    };
  }

  emit(eventName: string, event: any): void {
    this.listeners.get(eventName)?.forEach(callback => callback(event));
  }
}

export const eventListener = new ContractEventListener();
