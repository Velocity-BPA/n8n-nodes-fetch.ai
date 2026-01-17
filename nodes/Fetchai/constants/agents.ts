/**
 * Fetch.ai Agent Constants
 * 
 * Contains well-known agent addresses, Agentverse configuration,
 * and DeltaV AI engine constants.
 */

/**
 * Agentverse API configuration
 */
export const AGENTVERSE_CONFIG = {
	production: {
		baseUrl: 'https://agentverse.ai',
		apiUrl: 'https://agentverse.ai/api/v1',
		mailboxUrl: 'https://mailbox.agentverse.ai',
		websocketUrl: 'wss://agentverse.ai/ws',
	},
	staging: {
		baseUrl: 'https://staging.agentverse.ai',
		apiUrl: 'https://staging.agentverse.ai/api/v1',
		mailboxUrl: 'https://staging-mailbox.agentverse.ai',
		websocketUrl: 'wss://staging.agentverse.ai/ws',
	},
};

/**
 * DeltaV AI Engine configuration
 */
export const DELTAV_CONFIG = {
	production: {
		baseUrl: 'https://deltav.agentverse.ai',
		apiUrl: 'https://deltav.agentverse.ai/api/v1',
		websocketUrl: 'wss://deltav.agentverse.ai/ws',
	},
	staging: {
		baseUrl: 'https://staging-deltav.agentverse.ai',
		apiUrl: 'https://staging-deltav.agentverse.ai/api/v1',
		websocketUrl: 'wss://staging-deltav.agentverse.ai/ws',
	},
};

/**
 * Well-known system agents
 */
export const SYSTEM_AGENTS: Record<string, string> = {
	almanacRegistrar: 'agent1q...',
	deltavOracle: 'agent1q...',
	mailboxService: 'agent1q...',
};

/**
 * Agent address prefixes
 */
export const AGENT_ADDRESS_PREFIX = 'agent';

/**
 * Agent status types
 */
export enum AgentStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPENDED = 'suspended',
	PENDING = 'pending',
	RUNNING = 'running',
	STOPPED = 'stopped',
	ERROR = 'error',
}

/**
 * Agent types
 */
export enum AgentType {
	LOCAL = 'local',
	HOSTED = 'hosted',
	MAILBOX = 'mailbox',
	PROXY = 'proxy',
}

/**
 * DeltaV task status
 */
export enum TaskStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
	CANCELLED = 'cancelled',
	TIMEOUT = 'timeout',
}

/**
 * DeltaV function categories
 */
export const FUNCTION_CATEGORIES = [
	'booking',
	'finance',
	'travel',
	'food',
	'health',
	'entertainment',
	'productivity',
	'shopping',
	'education',
	'utilities',
	'custom',
];

/**
 * Agent registration configuration
 */
export const REGISTRATION_CONFIG = {
	defaultTtl: 86400, // 24 hours in seconds
	minTtl: 3600, // 1 hour
	maxTtl: 604800, // 7 days
	defaultWeight: 1,
	maxEndpoints: 10,
	maxProtocols: 50,
};

/**
 * Mailbox message configuration
 */
export const MAILBOX_CONFIG = {
	maxMessageSize: 1048576, // 1MB
	defaultExpiry: 300, // 5 minutes
	maxRetries: 3,
	retryDelay: 1000, // 1 second
};

/**
 * Agent verification levels
 */
export enum VerificationLevel {
	NONE = 'none',
	BASIC = 'basic',
	VERIFIED = 'verified',
	TRUSTED = 'trusted',
}

/**
 * Agent metadata keys
 */
export const METADATA_KEYS = {
	name: 'name',
	description: 'description',
	version: 'version',
	readme: 'readme',
	icon: 'icon',
	website: 'website',
	email: 'email',
	category: 'category',
	tags: 'tags',
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
	agentverse: {
		requestsPerMinute: 60,
		requestsPerHour: 1000,
	},
	deltav: {
		tasksPerMinute: 10,
		tasksPerHour: 100,
	},
	mailbox: {
		messagesPerMinute: 30,
		messagesPerHour: 500,
	},
};

/**
 * Generate agent address from seed
 * Agent addresses use a different derivation than wallet addresses
 */
export function generateAgentAddress(seed: string): string {
	// Simplified - actual implementation uses specific hashing
	const hash = Buffer.from(seed).toString('hex').slice(0, 40);
	return `${AGENT_ADDRESS_PREFIX}1q${hash}`;
}

/**
 * Validate agent address format
 */
export function isValidAgentAddress(address: string): boolean {
	return /^agent1[a-z0-9]{38,}$/.test(address);
}

/**
 * Validate Fetch.ai wallet address format
 */
export function isValidFetchAddress(address: string): boolean {
	return /^fetch1[a-z0-9]{38,}$/.test(address);
}
