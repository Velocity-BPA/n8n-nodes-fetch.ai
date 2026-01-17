/**
 * Almanac Client for Fetch.ai Agent Registry
 * 
 * The Almanac is a decentralized registry for agent discovery.
 * Agents register their endpoints, protocols, and metadata
 * to be discoverable by other agents and the DeltaV AI engine.
 */

import { CosmosClient, CosmosClientOptions } from './cosmosClient';
import {
	ALMANAC_ADDRESSES,
	NAME_SERVICE_ADDRESSES,
} from '../constants/networks';
import {
	ALMANAC_QUERIES,
	ALMANAC_EXECUTES,
	NAME_SERVICE_QUERIES,
	NAME_SERVICE_EXECUTES,
	AlmanacRecord,
	AgentEndpoint,
} from '../constants/contracts';
import { REGISTRATION_CONFIG } from '../constants/agents';

/**
 * Almanac client options
 */
export interface AlmanacClientOptions extends CosmosClientOptions {
	almanacAddress?: string;
	nameServiceAddress?: string;
}

/**
 * Agent record from Almanac
 */
export interface AlmanacAgentRecord {
	address: string;
	endpoints: AgentEndpoint[];
	protocols: string[];
	metadata?: Record<string, string>;
	expiry: number;
	sequenceNumber: number;
}

/**
 * Name record from name service
 */
export interface NameRecord {
	name: string;
	address: string;
	owner: string;
	expiry?: number;
	records?: Record<string, string>;
}

/**
 * Registration result
 */
export interface RegistrationResult {
	success: boolean;
	txHash?: string;
	error?: string;
}

/**
 * Almanac Client class
 */
export class AlmanacClient {
	private cosmosClient: CosmosClient;
	private almanacAddress: string;
	private nameServiceAddress: string;
	private initialized: boolean = false;

	constructor(options: AlmanacClientOptions) {
		const network = options.network || 'mainnet';
		this.almanacAddress = options.almanacAddress ||
			ALMANAC_ADDRESSES[network] ||
			ALMANAC_ADDRESSES.mainnet;
		this.nameServiceAddress = options.nameServiceAddress ||
			NAME_SERVICE_ADDRESSES[network] ||
			NAME_SERVICE_ADDRESSES.mainnet;
		this.cosmosClient = new CosmosClient(options);
	}

	/**
	 * Initialize the client
	 */
	async connect(): Promise<void> {
		if (!this.initialized) {
			await this.cosmosClient.connect();
			this.initialized = true;
		}
	}

	/**
	 * Disconnect from network
	 */
	disconnect(): void {
		this.cosmosClient.disconnect();
		this.initialized = false;
	}

	/**
	 * Ensure client is initialized
	 */
	private ensureInitialized(): void {
		if (!this.initialized) {
			throw new Error('AlmanacClient not initialized. Call connect() first.');
		}
	}

	// ============ Query Methods ============

	/**
	 * Get agent record from Almanac
	 */
	async getAgentRecord(agentAddress: string): Promise<AlmanacAgentRecord | null> {
		this.ensureInitialized();

		try {
			const result = await this.cosmosClient.queryContract(
				this.almanacAddress,
				ALMANAC_QUERIES.getAgent(agentAddress)
			) as { record?: AlmanacAgentRecord };

			return result?.record || null;
		} catch (error) {
			// Agent not found
			return null;
		}
	}

	/**
	 * Get agents by protocol
	 */
	async getAgentsByProtocol(protocolDigest: string): Promise<AlmanacAgentRecord[]> {
		this.ensureInitialized();

		try {
			const result = await this.cosmosClient.queryContract(
				this.almanacAddress,
				ALMANAC_QUERIES.getAgentsByProtocol(protocolDigest)
			) as { records?: AlmanacAgentRecord[] };

			return result?.records || [];
		} catch {
			return [];
		}
	}

	/**
	 * Get agent sequence number
	 */
	async getAgentSequence(agentAddress: string): Promise<number> {
		this.ensureInitialized();

		try {
			const result = await this.cosmosClient.queryContract(
				this.almanacAddress,
				ALMANAC_QUERIES.getSequence(agentAddress)
			) as { sequence?: number };

			return result?.sequence || 0;
		} catch {
			return 0;
		}
	}

	/**
	 * Get registration expiry time
	 */
	async getExpiryTime(agentAddress: string): Promise<number | null> {
		const record = await this.getAgentRecord(agentAddress);
		return record?.expiry || null;
	}

	/**
	 * Check if registration is expiring soon
	 */
	async isExpiringSoon(agentAddress: string, thresholdSeconds: number = 3600): Promise<boolean> {
		const expiry = await this.getExpiryTime(agentAddress);
		if (!expiry) return false;
		
		const now = Math.floor(Date.now() / 1000);
		return (expiry - now) < thresholdSeconds;
	}

	/**
	 * Get registration cost
	 */
	async getRegistrationCost(): Promise<{ amount: string; denom: string }> {
		this.ensureInitialized();

		try {
			const result = await this.cosmosClient.queryContract(
				this.almanacAddress,
				{ get_registration_cost: {} }
			) as { cost?: { amount: string; denom: string } };

			return result?.cost || { amount: '0', denom: 'afet' };
		} catch {
			return { amount: '0', denom: 'afet' };
		}
	}

	// ============ Execute Methods ============

	/**
	 * Register agent in Almanac
	 */
	async registerAgent(
		agentAddress: string,
		endpoints: AgentEndpoint[],
		protocols: string[],
		metadata?: Record<string, string>,
		ttlSeconds?: number
	): Promise<RegistrationResult> {
		this.ensureInitialized();

		if (!this.cosmosClient.canSign()) {
			return {
				success: false,
				error: 'Cannot sign transactions. Provide mnemonic in credentials.',
			};
		}

		const ttl = ttlSeconds ||
			REGISTRATION_CONFIG.defaultTtl;
		const expiry = Math.floor(Date.now() / 1000) + ttl;

		const record: AlmanacRecord = {
			address: agentAddress,
			endpoints,
			protocols,
			metadata,
			expiry,
		};

		try {
			const result = await this.cosmosClient.executeContract(
				this.almanacAddress,
				ALMANAC_EXECUTES.register(record)
			);

			return {
				success: true,
				txHash: result.txHash,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Update agent registration
	 */
	async updateAgent(
		agentAddress: string,
		updates: Partial<AlmanacRecord>
	): Promise<RegistrationResult> {
		// Get current record
		const current = await this.getAgentRecord(agentAddress);
		if (!current) {
			return {
				success: false,
				error: 'Agent not registered',
			};
		}

		// Merge updates
		const updated: AlmanacRecord = {
			address: agentAddress,
			endpoints: updates.endpoints || current.endpoints,
			protocols: updates.protocols || current.protocols,
			metadata: updates.metadata || current.metadata,
			expiry: updates.expiry || current.expiry,
		};

		return this.registerAgent(
			updated.address,
			updated.endpoints,
			updated.protocols,
			updated.metadata
		);
	}

	/**
	 * Renew registration
	 */
	async renewRegistration(
		agentAddress: string,
		ttlSeconds?: number
	): Promise<RegistrationResult> {
		this.ensureInitialized();

		if (!this.cosmosClient.canSign()) {
			return {
				success: false,
				error: 'Cannot sign transactions',
			};
		}

		const ttl = ttlSeconds || REGISTRATION_CONFIG.defaultTtl;
		const newExpiry = Math.floor(Date.now() / 1000) + ttl;

		try {
			const result = await this.cosmosClient.executeContract(
				this.almanacAddress,
				ALMANAC_EXECUTES.updateExpiry(agentAddress, newExpiry)
			);

			return {
				success: true,
				txHash: result.txHash,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	// ============ Name Service Methods ============

	/**
	 * Resolve name to address
	 */
	async resolveName(name: string): Promise<string | null> {
		this.ensureInitialized();

		try {
			const result = await this.cosmosClient.queryContract(
				this.nameServiceAddress,
				NAME_SERVICE_QUERIES.resolve(name)
			) as { address?: string };

			return result?.address || null;
		} catch {
			return null;
		}
	}

	/**
	 * Get name info
	 */
	async getNameInfo(name: string): Promise<NameRecord | null> {
		this.ensureInitialized();

		try {
			const result = await this.cosmosClient.queryContract(
				this.nameServiceAddress,
				NAME_SERVICE_QUERIES.getNameInfo(name)
			) as NameRecord;

			return result || null;
		} catch {
			return null;
		}
	}

	/**
	 * Get names owned by address
	 */
	async getNamesByOwner(ownerAddress: string): Promise<string[]> {
		this.ensureInitialized();

		try {
			const result = await this.cosmosClient.queryContract(
				this.nameServiceAddress,
				NAME_SERVICE_QUERIES.getNamesByOwner(ownerAddress)
			) as { names?: string[] };

			return result?.names || [];
		} catch {
			return [];
		}
	}

	/**
	 * Reverse lookup (address to name)
	 */
	async reverseLookup(address: string): Promise<string | null> {
		this.ensureInitialized();

		try {
			const result = await this.cosmosClient.queryContract(
				this.nameServiceAddress,
				NAME_SERVICE_QUERIES.reverseLookup(address)
			) as { name?: string };

			return result?.name || null;
		} catch {
			return null;
		}
	}

	/**
	 * Register a name
	 */
	async registerName(
		name: string,
		address: string
	): Promise<RegistrationResult> {
		this.ensureInitialized();

		if (!this.cosmosClient.canSign()) {
			return {
				success: false,
				error: 'Cannot sign transactions',
			};
		}

		try {
			const result = await this.cosmosClient.executeContract(
				this.nameServiceAddress,
				NAME_SERVICE_EXECUTES.register(name, address)
			);

			return {
				success: true,
				txHash: result.txHash,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Transfer name ownership
	 */
	async transferName(
		name: string,
		newOwner: string
	): Promise<RegistrationResult> {
		this.ensureInitialized();

		if (!this.cosmosClient.canSign()) {
			return {
				success: false,
				error: 'Cannot sign transactions',
			};
		}

		try {
			const result = await this.cosmosClient.executeContract(
				this.nameServiceAddress,
				NAME_SERVICE_EXECUTES.transfer(name, newOwner)
			);

			return {
				success: true,
				txHash: result.txHash,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Update name records
	 */
	async updateNameRecords(
		name: string,
		records: Record<string, string>
	): Promise<RegistrationResult> {
		this.ensureInitialized();

		if (!this.cosmosClient.canSign()) {
			return {
				success: false,
				error: 'Cannot sign transactions',
			};
		}

		try {
			const result = await this.cosmosClient.executeContract(
				this.nameServiceAddress,
				NAME_SERVICE_EXECUTES.updateRecords(name, records)
			);

			return {
				success: true,
				txHash: result.txHash,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}
}

/**
 * Create and connect Almanac client
 */
export async function createAlmanacClient(options: AlmanacClientOptions): Promise<AlmanacClient> {
	const client = new AlmanacClient(options);
	await client.connect();
	return client;
}
