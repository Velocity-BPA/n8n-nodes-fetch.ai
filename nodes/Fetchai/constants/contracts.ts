/**
 * Fetch.ai Smart Contract Constants
 * 
 * Contains addresses and ABIs for core Fetch.ai contracts
 * including the Almanac, Name Service, and common CW-20/CW-721 patterns.
 */

/**
 * Core Fetch.ai contract addresses by network
 */
export const CORE_CONTRACTS: Record<string, Record<string, string>> = {
	mainnet: {
		almanac: 'fetch1tjagw8g8nn4cwuw00cf0m5tl4l6wfw9c0ue507ua2kqz66f54ueqq8z0cg',
		nameService: 'fetch1479lwv5vy8skute5cycuz727e55spkhxut0valrcm38x9caa2x8q99ef0q',
		staking: '',
		governance: '',
	},
	testnet: {
		almanac: 'fetch1tjagw8g8nn4cwuw00cf0m5tl4l6wfw9c0ue507ua2kqz66f54ueqq8z0cg',
		nameService: 'fetch1479lwv5vy8skute5cycuz727e55spkhxut0valrcm38x9caa2x8q99ef0q',
		staking: '',
		governance: '',
	},
};

/**
 * Almanac contract query messages
 */
export const ALMANAC_QUERIES = {
	getAgent: (address: string) => ({
		query_records: { agent_address: address },
	}),
	getAgentsByProtocol: (protocol: string) => ({
		query_records_by_protocol: { protocol },
	}),
	getSequence: (address: string) => ({
		query_sequence: { agent_address: address },
	}),
	getAgentInfo: (address: string) => ({
		query_agent: { address },
	}),
};

/**
 * Almanac contract execute messages
 */
export const ALMANAC_EXECUTES = {
	register: (record: AlmanacRecord) => ({
		register: { record },
	}),
	updateExpiry: (address: string, expiry: number) => ({
		update_expiry: { agent_address: address, expiry },
	}),
};

/**
 * Almanac record structure
 */
export interface AlmanacRecord {
	address: string;
	endpoints: AgentEndpoint[];
	protocols: string[];
	metadata?: Record<string, string>;
	expiry?: number;
}

/**
 * Agent endpoint structure
 */
export interface AgentEndpoint {
	url: string;
	weight: number;
}

/**
 * Name Service query messages
 */
export const NAME_SERVICE_QUERIES = {
	resolve: (name: string) => ({
		resolve: { name },
	}),
	getNameInfo: (name: string) => ({
		name_info: { name },
	}),
	getNamesByOwner: (owner: string) => ({
		names_by_owner: { owner },
	}),
	reverseLookup: (address: string) => ({
		reverse_lookup: { address },
	}),
};

/**
 * Name Service execute messages
 */
export const NAME_SERVICE_EXECUTES = {
	register: (name: string, address: string) => ({
		register: { name, address },
	}),
	transfer: (name: string, newOwner: string) => ({
		transfer: { name, new_owner: newOwner },
	}),
	updateRecords: (name: string, records: Record<string, string>) => ({
		update_records: { name, records },
	}),
};

/**
 * CW-20 Token Standard Query Messages
 */
export const CW20_QUERIES = {
	balance: (address: string) => ({
		balance: { address },
	}),
	tokenInfo: () => ({
		token_info: {},
	}),
	allowance: (owner: string, spender: string) => ({
		allowance: { owner, spender },
	}),
	allAllowances: (owner: string, startAfter?: string, limit?: number) => ({
		all_allowances: { owner, start_after: startAfter, limit },
	}),
	allAccounts: (startAfter?: string, limit?: number) => ({
		all_accounts: { start_after: startAfter, limit },
	}),
	minter: () => ({
		minter: {},
	}),
};

/**
 * CW-20 Token Standard Execute Messages
 */
export const CW20_EXECUTES = {
	transfer: (recipient: string, amount: string) => ({
		transfer: { recipient, amount },
	}),
	send: (contract: string, amount: string, msg: string) => ({
		send: { contract, amount, msg },
	}),
	increaseAllowance: (spender: string, amount: string, expires?: unknown) => ({
		increase_allowance: { spender, amount, expires },
	}),
	decreaseAllowance: (spender: string, amount: string, expires?: unknown) => ({
		decrease_allowance: { spender, amount, expires },
	}),
	transferFrom: (owner: string, recipient: string, amount: string) => ({
		transfer_from: { owner, recipient, amount },
	}),
	burn: (amount: string) => ({
		burn: { amount },
	}),
	mint: (recipient: string, amount: string) => ({
		mint: { recipient, amount },
	}),
};

/**
 * CW-721 NFT Standard Query Messages
 */
export const CW721_QUERIES = {
	ownerOf: (tokenId: string) => ({
		owner_of: { token_id: tokenId },
	}),
	nftInfo: (tokenId: string) => ({
		nft_info: { token_id: tokenId },
	}),
	allNftInfo: (tokenId: string) => ({
		all_nft_info: { token_id: tokenId },
	}),
	tokens: (owner: string, startAfter?: string, limit?: number) => ({
		tokens: { owner, start_after: startAfter, limit },
	}),
	allTokens: (startAfter?: string, limit?: number) => ({
		all_tokens: { start_after: startAfter, limit },
	}),
	contractInfo: () => ({
		contract_info: {},
	}),
	numTokens: () => ({
		num_tokens: {},
	}),
};

/**
 * CW-721 NFT Standard Execute Messages
 */
export const CW721_EXECUTES = {
	transferNft: (recipient: string, tokenId: string) => ({
		transfer_nft: { recipient, token_id: tokenId },
	}),
	sendNft: (contract: string, tokenId: string, msg: string) => ({
		send_nft: { contract, token_id: tokenId, msg },
	}),
	approve: (spender: string, tokenId: string, expires?: unknown) => ({
		approve: { spender, token_id: tokenId, expires },
	}),
	revoke: (spender: string, tokenId: string) => ({
		revoke: { spender, token_id: tokenId },
	}),
	approveAll: (operator: string, expires?: unknown) => ({
		approve_all: { operator, expires },
	}),
	revokeAll: (operator: string) => ({
		revoke_all: { operator },
	}),
	mint: (tokenId: string, owner: string, tokenUri?: string, extension?: unknown) => ({
		mint: { token_id: tokenId, owner, token_uri: tokenUri, extension },
	}),
	burn: (tokenId: string) => ({
		burn: { token_id: tokenId },
	}),
};

/**
 * Contract code IDs for well-known contracts
 */
export const KNOWN_CODE_IDS: Record<string, Record<string, number>> = {
	mainnet: {
		cw20Base: 1,
		cw721Base: 2,
		almanac: 3,
		nameService: 4,
	},
	testnet: {
		cw20Base: 1,
		cw721Base: 2,
		almanac: 3,
		nameService: 4,
	},
};
