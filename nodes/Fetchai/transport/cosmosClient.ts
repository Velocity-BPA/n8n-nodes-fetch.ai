/**
 * Cosmos Client for Fetch.ai Blockchain
 * 
 * Handles connections to Fetch.ai blockchain nodes using CosmJS.
 * Provides methods for querying and executing transactions.
 */

import {
	SigningStargateClient,
	StargateClient,
	GasPrice,
	DeliverTxResponse,
} from '@cosmjs/stargate';
import {
	SigningCosmWasmClient,
	CosmWasmClient,
} from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { getNetworkConfig, NetworkConfig, DEFAULT_TX_CONFIG } from '../constants/networks';

/**
 * Client configuration options
 */
export interface CosmosClientOptions {
	network: string;
	mnemonic?: string;
	restEndpoint?: string;
	rpcEndpoint?: string;
	gasPrice?: string;
	gasAdjustment?: number;
	prefix?: string;
}

/**
 * Account information
 */
export interface AccountInfo {
	address: string;
	pubKey?: string;
	accountNumber: number;
	sequence: number;
}

/**
 * Balance information
 */
export interface Balance {
	denom: string;
	amount: string;
}

/**
 * Transaction result
 */
export interface TxResult {
	txHash: string;
	height: number;
	gasUsed: number;
	gasWanted: number;
	code: number;
	rawLog?: string;
	events?: unknown[];
}

/**
 * Cosmos Client class for Fetch.ai operations
 */
export class CosmosClient {
	private config: NetworkConfig;
	private stargateClient?: StargateClient;
	private signingClient?: SigningStargateClient;
	private cosmwasmClient?: CosmWasmClient;
	private signingCosmwasmClient?: SigningCosmWasmClient;
	private wallet?: DirectSecp256k1HdWallet;
	private walletAddress?: string;
	private clientOptions: CosmosClientOptions;

	constructor(options: CosmosClientOptions) {
		this.clientOptions = options;
		this.config = getNetworkConfig(options.network);
		
		// Override config with custom endpoints
		if (options.restEndpoint) {
			this.config = { ...this.config, restEndpoint: options.restEndpoint };
		}
		if (options.rpcEndpoint) {
			this.config = { ...this.config, rpcEndpoint: options.rpcEndpoint };
		}
	}

	/**
	 * Initialize the client (connect to network)
	 */
	async connect(): Promise<void> {
		// Create read-only clients
		this.stargateClient = await StargateClient.connect(this.config.rpcEndpoint);
		this.cosmwasmClient = await CosmWasmClient.connect(this.config.rpcEndpoint);

		// Create signing clients if mnemonic provided
		if (this.clientOptions.mnemonic) {
			const prefix = this.clientOptions.prefix || this.config.prefix;
			this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(
				this.clientOptions.mnemonic,
				{ prefix }
			);

			const [account] = await this.wallet.getAccounts();
			this.walletAddress = account.address;

			const gasPrice = GasPrice.fromString(
				this.clientOptions.gasPrice || DEFAULT_TX_CONFIG.gasPrice
			);

			this.signingClient = await SigningStargateClient.connectWithSigner(
				this.config.rpcEndpoint,
				this.wallet,
				{ gasPrice }
			);

			this.signingCosmwasmClient = await SigningCosmWasmClient.connectWithSigner(
				this.config.rpcEndpoint,
				this.wallet,
				{ gasPrice }
			);
		}
	}

	/**
	 * Disconnect from network
	 */
	disconnect(): void {
		this.stargateClient?.disconnect();
		this.signingClient?.disconnect();
	}

	/**
	 * Get the connected wallet address
	 */
	getAddress(): string | undefined {
		return this.walletAddress;
	}

	/**
	 * Get network configuration
	 */
	getConfig(): NetworkConfig {
		return this.config;
	}

	/**
	 * Check if client is connected with signing capability
	 */
	canSign(): boolean {
		return !!this.signingClient && !!this.walletAddress;
	}

	// ============ Query Methods ============

	/**
	 * Get account info
	 */
	async getAccountInfo(address: string): Promise<AccountInfo | null> {
		if (!this.stargateClient) {
			throw new Error('Client not connected');
		}

		const account = await this.stargateClient.getAccount(address);
		if (!account) {
			return null;
		}

		let pubKeyHex: string | undefined;
		if (account.pubkey) {
			const pubkeyAny = account.pubkey as { value?: Uint8Array };
			if (pubkeyAny.value) {
				pubKeyHex = Buffer.from(pubkeyAny.value).toString('hex');
			}
		}

		return {
			address: account.address,
			pubKey: pubKeyHex,
			accountNumber: account.accountNumber,
			sequence: account.sequence,
		};
	}

	/**
	 * Get balance for specific denom
	 */
	async getBalance(address: string, denom?: string): Promise<Balance> {
		if (!this.stargateClient) {
			throw new Error('Client not connected');
		}

		const denomToUse = denom || this.config.minDenom;
		const balance = await this.stargateClient.getBalance(address, denomToUse);
		return {
			denom: balance.denom,
			amount: balance.amount,
		};
	}

	/**
	 * Get all balances
	 */
	async getAllBalances(address: string): Promise<Balance[]> {
		if (!this.stargateClient) {
			throw new Error('Client not connected');
		}

		const balances = await this.stargateClient.getAllBalances(address);
		return balances.map(b => ({ denom: b.denom, amount: b.amount }));
	}

	/**
	 * Get current block height
	 */
	async getBlockHeight(): Promise<number> {
		if (!this.stargateClient) {
			throw new Error('Client not connected');
		}

		return this.stargateClient.getHeight();
	}

	/**
	 * Get block info
	 */
	async getBlock(height?: number): Promise<unknown> {
		if (!this.stargateClient) {
			throw new Error('Client not connected');
		}

		const h = height || await this.stargateClient.getHeight();
		return this.stargateClient.getBlock(h);
	}

	/**
	 * Get transaction by hash
	 */
	async getTransaction(txHash: string): Promise<unknown> {
		if (!this.stargateClient) {
			throw new Error('Client not connected');
		}

		return this.stargateClient.getTx(txHash);
	}

	/**
	 * Get chain ID
	 */
	async getChainId(): Promise<string> {
		if (!this.stargateClient) {
			throw new Error('Client not connected');
		}

		return this.stargateClient.getChainId();
	}

	// ============ Transaction Methods ============

	/**
	 * Send tokens
	 */
	async sendTokens(
		recipientAddress: string,
		amount: { denom: string; amount: string }[],
		memo?: string
	): Promise<TxResult> {
		if (!this.signingClient || !this.walletAddress) {
			throw new Error('Signing client not available. Provide mnemonic in credentials.');
		}

		const result = await this.signingClient.sendTokens(
			this.walletAddress,
			recipientAddress,
			amount,
			'auto',
			memo || DEFAULT_TX_CONFIG.memo
		);

		return this.formatTxResult(result);
	}

	/**
	 * Delegate tokens to validator
	 */
	async delegate(
		validatorAddress: string,
		amount: { denom: string; amount: string },
		memo?: string
	): Promise<TxResult> {
		if (!this.signingClient || !this.walletAddress) {
			throw new Error('Signing client not available');
		}

		const result = await this.signingClient.delegateTokens(
			this.walletAddress,
			validatorAddress,
			amount,
			'auto',
			memo || DEFAULT_TX_CONFIG.memo
		);

		return this.formatTxResult(result);
	}

	/**
	 * Undelegate tokens from validator
	 */
	async undelegate(
		validatorAddress: string,
		amount: { denom: string; amount: string },
		memo?: string
	): Promise<TxResult> {
		if (!this.signingClient || !this.walletAddress) {
			throw new Error('Signing client not available');
		}

		const result = await this.signingClient.undelegateTokens(
			this.walletAddress,
			validatorAddress,
			amount,
			'auto',
			memo || DEFAULT_TX_CONFIG.memo
		);

		return this.formatTxResult(result);
	}

	// ============ CosmWasm Methods ============

	/**
	 * Query smart contract
	 */
	async queryContract(contractAddress: string, query: Record<string, unknown>): Promise<unknown> {
		if (!this.cosmwasmClient) {
			throw new Error('CosmWasm client not connected');
		}

		return this.cosmwasmClient.queryContractSmart(contractAddress, query);
	}

	/**
	 * Execute smart contract
	 */
	async executeContract(
		contractAddress: string,
		msg: Record<string, unknown>,
		funds?: { denom: string; amount: string }[],
		memo?: string
	): Promise<TxResult> {
		if (!this.signingCosmwasmClient || !this.walletAddress) {
			throw new Error('Signing CosmWasm client not available');
		}

		const result = await this.signingCosmwasmClient.execute(
			this.walletAddress,
			contractAddress,
			msg,
			'auto',
			memo || DEFAULT_TX_CONFIG.memo,
			funds || []
		);

		return {
			txHash: result.transactionHash,
			height: result.height,
			gasUsed: Number(result.gasUsed),
			gasWanted: Number(result.gasWanted),
			code: 0,
			events: [...result.events],
		};
	}

	/**
	 * Instantiate contract
	 */
	async instantiateContract(
		codeId: number,
		msg: Record<string, unknown>,
		label: string,
		funds?: { denom: string; amount: string }[],
		admin?: string
	): Promise<{ contractAddress: string; txResult: TxResult }> {
		if (!this.signingCosmwasmClient || !this.walletAddress) {
			throw new Error('Signing CosmWasm client not available');
		}

		const result = await this.signingCosmwasmClient.instantiate(
			this.walletAddress,
			codeId,
			msg,
			label,
			'auto',
			{ admin, funds: funds || [] }
		);

		return {
			contractAddress: result.contractAddress,
			txResult: {
				txHash: result.transactionHash,
				height: result.height,
				gasUsed: Number(result.gasUsed),
				gasWanted: Number(result.gasWanted),
				code: 0,
				events: [...result.events],
			},
		};
	}

	/**
	 * Upload contract code
	 */
	async uploadContract(wasmCode: Uint8Array): Promise<{ codeId: number; txResult: TxResult }> {
		if (!this.signingCosmwasmClient || !this.walletAddress) {
			throw new Error('Signing CosmWasm client not available');
		}

		const result = await this.signingCosmwasmClient.upload(
			this.walletAddress,
			wasmCode,
			'auto'
		);

		return {
			codeId: result.codeId,
			txResult: {
				txHash: result.transactionHash,
				height: result.height,
				gasUsed: Number(result.gasUsed),
				gasWanted: Number(result.gasWanted),
				code: 0,
				events: [...result.events],
			},
		};
	}

	/**
	 * Get contract info
	 */
	async getContractInfo(contractAddress: string): Promise<unknown> {
		if (!this.cosmwasmClient) {
			throw new Error('CosmWasm client not connected');
		}

		return this.cosmwasmClient.getContract(contractAddress);
	}

	/**
	 * Get contract code info
	 */
	async getCodeInfo(codeId: number): Promise<unknown> {
		if (!this.cosmwasmClient) {
			throw new Error('CosmWasm client not connected');
		}

		return this.cosmwasmClient.getCodeDetails(codeId);
	}

	// ============ Helper Methods ============

	/**
	 * Format transaction result
	 */
	private formatTxResult(result: DeliverTxResponse): TxResult {
		return {
			txHash: result.transactionHash,
			height: result.height,
			gasUsed: Number(result.gasUsed),
			gasWanted: Number(result.gasWanted),
			code: result.code,
			rawLog: result.rawLog,
			events: result.events ? [...result.events] : undefined,
		};
	}

	/**
	 * Simulate transaction for gas estimation
	 */
	async simulate(): Promise<number> {
		if (!this.signingClient || !this.walletAddress) {
			throw new Error('Signing client not available');
		}

		// Note: This is a simplified implementation
		// Full implementation would use simulateTx
		return 200000; // Default gas estimate
	}
}

/**
 * Create and connect a new Cosmos client
 */
export async function createCosmosClient(options: CosmosClientOptions): Promise<CosmosClient> {
	const client = new CosmosClient(options);
	await client.connect();
	return client;
}
