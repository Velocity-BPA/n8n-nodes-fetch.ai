/**
 * Agent Client for Fetch.ai uAgents
 * 
 * Handles communication with uAgents through HTTP endpoints
 * and the Agentverse mailbox service.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { AgentEnvelope } from '../constants/protocols';
import {
	AGENTVERSE_CONFIG,
	MAILBOX_CONFIG,
	AgentStatus,
} from '../constants/agents';
import {
	createEnvelope,
	signEnvelope,
	serializeEnvelope,
	createSessionId,
} from '../utils/messageUtils';

/**
 * Agent client configuration
 */
export interface AgentClientOptions {
	environment?: 'production' | 'staging';
	agentverseApiKey?: string;
	timeout?: number;
}

/**
 * Agent information
 */
export interface AgentInfo {
	address: string;
	name?: string;
	description?: string;
	protocols: string[];
	endpoints: { url: string; weight: number }[];
	status: AgentStatus;
	readme?: string;
	metadata?: Record<string, string>;
}

/**
 * Message send result
 */
export interface MessageResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

/**
 * Mailbox message
 */
export interface MailboxMessage {
	id: string;
	sender: string;
	envelope: AgentEnvelope;
	receivedAt: string;
	expiresAt?: string;
}

/**
 * Agent Client class
 */
export class AgentClient {
	private axiosInstance: AxiosInstance;
	private config: typeof AGENTVERSE_CONFIG.production;
	private apiKey?: string;

	constructor(options: AgentClientOptions = {}) {
		const env = options.environment || 'production';
		this.config = AGENTVERSE_CONFIG[env];
		this.apiKey = options.agentverseApiKey;

		this.axiosInstance = axios.create({
			timeout: options.timeout || MAILBOX_CONFIG.maxRetries * MAILBOX_CONFIG.retryDelay + 30000,
			headers: {
				'Content-Type': 'application/json',
				...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
			},
		});
	}

	/**
	 * Set API key after construction
	 */
	setApiKey(apiKey: string): void {
		this.apiKey = apiKey;
		this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
	}

	// ============ Agent Query Methods ============

	/**
	 * Get agent info by address
	 */
	async getAgentInfo(agentAddress: string): Promise<AgentInfo | null> {
		try {
			const response = await this.axiosInstance.get(
				`${this.config.apiUrl}/agents/${agentAddress}`
			);
			return response.data as AgentInfo;
		} catch (error) {
			if ((error as AxiosError).response?.status === 404) {
				return null;
			}
			throw this.handleError(error);
		}
	}

	/**
	 * Get agent by name (from Almanac name service)
	 */
	async getAgentByName(name: string): Promise<AgentInfo | null> {
		try {
			const response = await this.axiosInstance.get(
				`${this.config.apiUrl}/agents/name/${name}`
			);
			return response.data as AgentInfo;
		} catch (error) {
			if ((error as AxiosError).response?.status === 404) {
				return null;
			}
			throw this.handleError(error);
		}
	}

	/**
	 * Search agents by protocol
	 */
	async getAgentsByProtocol(protocolDigest: string): Promise<AgentInfo[]> {
		try {
			const response = await this.axiosInstance.get(
				`${this.config.apiUrl}/agents/protocol/${protocolDigest}`
			);
			return response.data as AgentInfo[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Search agents
	 */
	async searchAgents(query: string, limit: number = 10): Promise<AgentInfo[]> {
		try {
			const response = await this.axiosInstance.get(
				`${this.config.apiUrl}/agents/search`,
				{ params: { q: query, limit } }
			);
			return response.data as AgentInfo[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get agent protocols
	 */
	async getAgentProtocols(agentAddress: string): Promise<string[]> {
		const agent = await this.getAgentInfo(agentAddress);
		return agent?.protocols || [];
	}

	/**
	 * Get agent endpoints
	 */
	async getAgentEndpoints(agentAddress: string): Promise<{ url: string; weight: number }[]> {
		const agent = await this.getAgentInfo(agentAddress);
		return agent?.endpoints || [];
	}

	/**
	 * Verify agent (check if registered and active)
	 */
	async verifyAgent(agentAddress: string): Promise<{ verified: boolean; status: AgentStatus }> {
		const agent = await this.getAgentInfo(agentAddress);
		return {
			verified: agent !== null && agent.status === AgentStatus.ACTIVE,
			status: agent?.status || AgentStatus.INACTIVE,
		};
	}

	// ============ Message Methods ============

	/**
	 * Send message to agent via HTTP endpoint
	 */
	async sendMessage(
		senderAddress: string,
		targetAddress: string,
		payload: Record<string, unknown>,
		schemaDigest: string,
		options: {
			protocolDigest?: string;
			expirySeconds?: number;
			sign?: boolean;
			privateKey?: Uint8Array;
		} = {}
	): Promise<MessageResult> {
		try {
			// Get target agent's endpoint
			const agent = await this.getAgentInfo(targetAddress);
			if (!agent || agent.endpoints.length === 0) {
				return {
					success: false,
					error: 'Agent not found or has no endpoints',
				};
			}

			// Create envelope
			let envelope = createEnvelope(
				senderAddress,
				targetAddress,
				payload,
				schemaDigest,
				{
					protocolDigest: options.protocolDigest,
					expirySeconds: options.expirySeconds,
				}
			);

			// Sign if requested
			if (options.sign && options.privateKey) {
				envelope = signEnvelope(envelope, options.privateKey);
			}

			// Send to agent's primary endpoint
			const endpoint = agent.endpoints[0].url;
			const response = await this.axiosInstance.post(
				`${endpoint}/submit`,
				serializeEnvelope(envelope)
			);

			return {
				success: true,
				messageId: response.data?.messageId || envelope.session,
			};
		} catch (error) {
			return {
				success: false,
				error: this.handleError(error).message,
			};
		}
	}

	/**
	 * Send message via mailbox (for agents without direct endpoint)
	 */
	async sendMailboxMessage(
		senderAddress: string,
		targetAddress: string,
		payload: Record<string, unknown>,
		schemaDigest: string,
		options: {
			protocolDigest?: string;
			expirySeconds?: number;
		} = {}
	): Promise<MessageResult> {
		try {
			const envelope = createEnvelope(
				senderAddress,
				targetAddress,
				payload,
				schemaDigest,
				{
					protocolDigest: options.protocolDigest,
					expirySeconds: options.expirySeconds,
				}
			);

			const response = await this.axiosInstance.post(
				`${this.config.mailboxUrl}/v1/messages`,
				serializeEnvelope(envelope)
			);

			return {
				success: true,
				messageId: response.data?.id || envelope.session,
			};
		} catch (error) {
			return {
				success: false,
				error: this.handleError(error).message,
			};
		}
	}

	/**
	 * Get mailbox messages for agent
	 */
	async getMailboxMessages(agentAddress: string): Promise<MailboxMessage[]> {
		try {
			const response = await this.axiosInstance.get(
				`${this.config.mailboxUrl}/v1/agents/${agentAddress}/messages`
			);
			return response.data as MailboxMessage[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get specific mailbox message
	 */
	async getMailboxMessage(agentAddress: string, messageId: string): Promise<MailboxMessage | null> {
		try {
			const response = await this.axiosInstance.get(
				`${this.config.mailboxUrl}/v1/agents/${agentAddress}/messages/${messageId}`
			);
			return response.data as MailboxMessage;
		} catch (error) {
			if ((error as AxiosError).response?.status === 404) {
				return null;
			}
			throw this.handleError(error);
		}
	}

	/**
	 * Delete mailbox message
	 */
	async deleteMailboxMessage(agentAddress: string, messageId: string): Promise<boolean> {
		try {
			await this.axiosInstance.delete(
				`${this.config.mailboxUrl}/v1/agents/${agentAddress}/messages/${messageId}`
			);
			return true;
		} catch {
			return false;
		}
	}

	// ============ Dialogue Methods ============

	/**
	 * Start a new dialogue session with an agent
	 */
	async startDialogue(
		senderAddress: string,
		targetAddress: string,
		initialPayload: Record<string, unknown>,
		schemaDigest: string
	): Promise<{ sessionId: string; result: MessageResult }> {
		const sessionId = createSessionId();
		
		const result = await this.sendMessage(
			senderAddress,
			targetAddress,
			initialPayload,
			schemaDigest,
			{}
		);

		return { sessionId, result };
	}

	/**
	 * Continue dialogue session
	 */
	async continueDialogue(
		_sessionId: string,
		senderAddress: string,
		targetAddress: string,
		payload: Record<string, unknown>,
		schemaDigest: string
	): Promise<MessageResult> {
		return this.sendMessage(
			senderAddress,
			targetAddress,
			payload,
			schemaDigest,
			{}
		);
	}

	// ============ Helper Methods ============

	/**
	 * Handle errors consistently
	 */
	private handleError(error: unknown): Error {
		if (error instanceof AxiosError) {
			const message = error.response?.data?.message ||
				error.response?.data?.error ||
				error.message;
			return new Error(`Agent API error: ${message}`);
		}
		if (error instanceof Error) {
			return error;
		}
		return new Error(String(error));
	}

	/**
	 * Check if agent supports specific protocol
	 */
	async supportsProtocol(agentAddress: string, protocolDigest: string): Promise<boolean> {
		const protocols = await this.getAgentProtocols(agentAddress);
		return protocols.includes(protocolDigest);
	}
}

/**
 * Create a new Agent client
 */
export function createAgentClient(options: AgentClientOptions = {}): AgentClient {
	return new AgentClient(options);
}
