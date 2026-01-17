/**
 * Fetch.ai Network Configuration Constants
 * 
 * Contains endpoint URLs, chain IDs, and configuration
 * for all supported Fetch.ai networks.
 */

export interface NetworkConfig {
	name: string;
	chainId: string;
	restEndpoint: string;
	rpcEndpoint: string;
	grpcEndpoint: string;
	wsEndpoint: string;
	explorerUrl: string;
	faucetUrl?: string;
	denom: string;
	minDenom: string;
	decimals: number;
	prefix: string;
	gasPrice: string;
	coinType: number;
}

/**
 * Mainnet Configuration (fetchhub-4)
 */
export const MAINNET_CONFIG: NetworkConfig = {
	name: 'Fetch.ai Mainnet',
	chainId: 'fetchhub-4',
	restEndpoint: 'https://rest-fetchhub.fetch.ai',
	rpcEndpoint: 'https://rpc-fetchhub.fetch.ai',
	grpcEndpoint: 'grpc-fetchhub.fetch.ai:443',
	wsEndpoint: 'wss://rpc-fetchhub.fetch.ai/websocket',
	explorerUrl: 'https://explore-fetchhub.fetch.ai',
	denom: 'FET',
	minDenom: 'afet',
	decimals: 18,
	prefix: 'fetch',
	gasPrice: '5000000000',
	coinType: 118,
};

/**
 * Testnet Configuration (Dorado - dorado-1)
 */
export const TESTNET_CONFIG: NetworkConfig = {
	name: 'Fetch.ai Testnet (Dorado)',
	chainId: 'dorado-1',
	restEndpoint: 'https://rest-dorado.fetch.ai',
	rpcEndpoint: 'https://rpc-dorado.fetch.ai',
	grpcEndpoint: 'grpc-dorado.fetch.ai:443',
	wsEndpoint: 'wss://rpc-dorado.fetch.ai/websocket',
	explorerUrl: 'https://explore-dorado.fetch.ai',
	faucetUrl: 'https://faucet-dorado.fetch.ai',
	denom: 'TESTFET',
	minDenom: 'atestfet',
	decimals: 18,
	prefix: 'fetch',
	gasPrice: '5000000000',
	coinType: 118,
};

/**
 * Local Development Configuration
 */
export const LOCAL_CONFIG: NetworkConfig = {
	name: 'Local Development',
	chainId: 'localnet-1',
	restEndpoint: 'http://localhost:1317',
	rpcEndpoint: 'http://localhost:26657',
	grpcEndpoint: 'localhost:9090',
	wsEndpoint: 'ws://localhost:26657/websocket',
	explorerUrl: '',
	denom: 'FET',
	minDenom: 'afet',
	decimals: 18,
	prefix: 'fetch',
	gasPrice: '5000000000',
	coinType: 118,
};

/**
 * Get network configuration by network name
 */
export function getNetworkConfig(network: string): NetworkConfig {
	switch (network) {
		case 'mainnet':
			return MAINNET_CONFIG;
		case 'testnet':
			return TESTNET_CONFIG;
		case 'local':
			return LOCAL_CONFIG;
		default:
			return MAINNET_CONFIG;
	}
}

/**
 * Default Almanac contract addresses by network
 */
export const ALMANAC_ADDRESSES: Record<string, string> = {
	mainnet: 'fetch1tjagw8g8nn4cwuw00cf0m5tl4l6wfw9c0ue507ua2kqz66f54ueqq8z0cg',
	testnet: 'fetch1tjagw8g8nn4cwuw00cf0m5tl4l6wfw9c0ue507ua2kqz66f54ueqq8z0cg',
};

/**
 * Name Service contract addresses by network
 */
export const NAME_SERVICE_ADDRESSES: Record<string, string> = {
	mainnet: 'fetch1479lwv5vy8skute5cycuz727e55spkhxut0valrcm38x9caa2x8q99ef0q',
	testnet: 'fetch1479lwv5vy8skute5cycuz727e55spkhxut0valrcm38x9caa2x8q99ef0q',
};

/**
 * Token denomination info
 */
export const TOKEN_INFO = {
	FET: {
		name: 'Fetch.ai',
		symbol: 'FET',
		denom: 'afet',
		decimals: 18,
		coingeckoId: 'fetch-ai',
	},
	ASI: {
		name: 'Artificial Superintelligence Alliance',
		symbol: 'ASI',
		denom: 'asi',
		decimals: 18,
		coingeckoId: 'fetch-ai',
	},
};

/**
 * IBC Channel Registry for cross-chain transfers
 */
export const IBC_CHANNELS: Record<string, Record<string, string>> = {
	mainnet: {
		osmosis: 'channel-10',
		cosmoshub: 'channel-8',
		ethereum: 'channel-2',
	},
	testnet: {
		osmosis: 'channel-0',
	},
};

/**
 * API Version strings
 */
export const API_VERSIONS = {
	cosmos: 'v1beta1',
	cosmwasm: 'v1',
	ibc: 'v1',
};

/**
 * Default transaction configuration
 */
export const DEFAULT_TX_CONFIG = {
	gasPrice: '5000000000afet',
	gasAdjustment: 1.3,
	memo: 'Sent via n8n-nodes-fetchai',
};
