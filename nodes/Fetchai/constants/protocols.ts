/**
 * Fetch.ai uAgents Protocol Constants
 * 
 * Protocols define the message schemas and handlers that agents
 * use to communicate. Each protocol has a unique digest derived
 * from its message model definitions.
 */

/**
 * Well-known protocol digests
 * These are the message schema hashes for common protocols
 */
export const KNOWN_PROTOCOLS: Record<string, string> = {
	// Core communication protocols
	'agent-communication': 'proto:a]wLr6XV9Ci;JQxPP5]fANv_,1t]#.dK',
	'heartbeat': 'proto:heartbeat-v1',
	'envelope': 'proto:envelope-v1',
	
	// DeltaV AI Engine protocols
	'deltav-task': 'proto:deltav-task-v1',
	'deltav-response': 'proto:deltav-response-v1',
	'deltav-feedback': 'proto:deltav-feedback-v1',
	
	// Agent discovery protocols
	'agent-info': 'proto:agent-info-v1',
	'agent-query': 'proto:agent-query-v1',
	
	// Service protocols
	'booking': 'proto:booking-v1',
	'payment': 'proto:payment-v1',
	'oracle': 'proto:oracle-v1',
};

/**
 * Protocol message types
 */
export enum MessageType {
	REQUEST = 'request',
	RESPONSE = 'response',
	ERROR = 'error',
	NOTIFICATION = 'notification',
	QUERY = 'query',
	CONFIRM = 'confirm',
}

/**
 * Agent envelope structure for signed messages
 */
export interface AgentEnvelope {
	version: number;
	sender: string;
	target: string;
	session: string;
	schemaDigest: string;
	protocolDigest?: string;
	payload: string; // Base64 encoded
	expires?: number;
	nonce?: string;
	signature?: string;
}

/**
 * Protocol manifest structure
 */
export interface ProtocolManifest {
	name: string;
	version: string;
	digest: string;
	description?: string;
	models: ModelDefinition[];
	handlers: HandlerDefinition[];
}

/**
 * Model definition in a protocol
 */
export interface ModelDefinition {
	name: string;
	schema: Record<string, unknown>;
	description?: string;
}

/**
 * Handler definition in a protocol
 */
export interface HandlerDefinition {
	name: string;
	messageType: string;
	responseType?: string;
	description?: string;
}

/**
 * Default message envelope version
 */
export const ENVELOPE_VERSION = 1;

/**
 * Default message expiry (5 minutes)
 */
export const DEFAULT_MESSAGE_EXPIRY = 300;

/**
 * Agent communication endpoints
 */
export const AGENT_ENDPOINTS = {
	agentverse: {
		mailbox: 'https://mailbox.agentverse.ai',
		agents: 'https://agentverse.ai/api/v1/agents',
		protocols: 'https://agentverse.ai/api/v1/protocols',
	},
	local: {
		default: 'http://localhost:8000',
	},
};

/**
 * Protocol verification status
 */
export enum ProtocolStatus {
	VERIFIED = 'verified',
	UNVERIFIED = 'unverified',
	DEPRECATED = 'deprecated',
	EXPERIMENTAL = 'experimental',
}

/**
 * Compute protocol digest from models
 * This is a simplified version - actual implementation uses specific hashing
 */
export function computeProtocolDigest(models: ModelDefinition[]): string {
	const modelStr = JSON.stringify(models.sort((a, b) => a.name.localeCompare(b.name)));
	// In actual implementation, this would be a proper hash
	return `proto:${Buffer.from(modelStr).toString('base64').slice(0, 32)}`;
}
