/**
 * Agentverse Client for Fetch.ai Hosted Agents
 * 
 * Agentverse is Fetch.ai's hosted agent platform where developers
 * can deploy, manage, and monitor their uAgents in the cloud.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { AGENTVERSE_CONFIG, AgentStatus } from '../constants/agents';

/**
 * Agentverse client options
 */
export interface AgentverseClientOptions {
	environment?: 'production' | 'staging';
	apiKey?: string;
	timeout?: number;
}

/**
 * Hosted agent info
 */
export interface HostedAgentInfo {
	id: string;
	address: string;
	name: string;
	description?: string;
	status: AgentStatus;
	createdAt: string;
	updatedAt: string;
	protocols: string[];
	code?: string;
	readme?: string;
	version?: string;
	logs?: AgentLog[];
}

/**
 * Agent log entry
 */
export interface AgentLog {
	timestamp: string;
	level: 'debug' | 'info' | 'warning' | 'error';
	message: string;
}

/**
 * Agent secrets
 */
export interface AgentSecrets {
	[key: string]: string;
}

/**
 * Usage statistics
 */
export interface UsageStats {
	messagesReceived: number;
	messagesSent: number;
	tasksCompleted: number;
	uptime: number;
	lastActive?: string;
}

/**
 * Deployment options
 */
export interface DeploymentOptions {
	name: string;
	code: string;
	description?: string;
	readme?: string;
	secrets?: AgentSecrets;
	autoStart?: boolean;
}

/**
 * Agentverse Client class
 */
export class AgentverseClient {
	private axiosInstance: AxiosInstance;
	private config: typeof AGENTVERSE_CONFIG.production;
	private apiKey?: string;

	constructor(options: AgentverseClientOptions = {}) {
		const env = options.environment || 'production';
		this.config = AGENTVERSE_CONFIG[env];
		this.apiKey = options.apiKey;

		this.axiosInstance = axios.create({
			baseURL: this.config.apiUrl,
			timeout: options.timeout || 60000,
			headers: {
				'Content-Type': 'application/json',
				...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
			},
		});
	}

	/**
	 * Set API key
	 */
	setApiKey(apiKey: string): void {
		this.apiKey = apiKey;
		this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
	}

	// ============ Agent Management Methods ============

	/**
	 * Get all hosted agents
	 */
	async getHostedAgents(): Promise<HostedAgentInfo[]> {
		try {
			const response = await this.axiosInstance.get('/agents');
			return response.data.agents as HostedAgentInfo[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get agent info
	 */
	async getAgent(agentId: string): Promise<HostedAgentInfo | null> {
		try {
			const response = await this.axiosInstance.get(`/agents/${agentId}`);
			return response.data as HostedAgentInfo;
		} catch (error) {
			if ((error as AxiosError).response?.status === 404) {
				return null;
			}
			throw this.handleError(error);
		}
	}

	/**
	 * Get agent by address
	 */
	async getAgentByAddress(address: string): Promise<HostedAgentInfo | null> {
		try {
			const response = await this.axiosInstance.get(`/agents/address/${address}`);
			return response.data as HostedAgentInfo;
		} catch (error) {
			if ((error as AxiosError).response?.status === 404) {
				return null;
			}
			throw this.handleError(error);
		}
	}

	/**
	 * Deploy a new agent
	 */
	async deployAgent(options: DeploymentOptions): Promise<HostedAgentInfo> {
		try {
			const response = await this.axiosInstance.post('/agents', {
				name: options.name,
				code: options.code,
				description: options.description,
				readme: options.readme,
				secrets: options.secrets,
				auto_start: options.autoStart ?? true,
			});

			return response.data as HostedAgentInfo;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Update agent code
	 */
	async updateAgentCode(agentId: string, code: string): Promise<HostedAgentInfo> {
		try {
			const response = await this.axiosInstance.patch(`/agents/${agentId}`, {
				code,
			});
			return response.data as HostedAgentInfo;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Delete agent
	 */
	async deleteAgent(agentId: string): Promise<boolean> {
		try {
			await this.axiosInstance.delete(`/agents/${agentId}`);
			return true;
		} catch {
			return false;
		}
	}

	// ============ Agent Control Methods ============

	/**
	 * Start agent
	 */
	async startAgent(agentId: string): Promise<boolean> {
		try {
			await this.axiosInstance.post(`/agents/${agentId}/start`);
			return true;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Stop agent
	 */
	async stopAgent(agentId: string): Promise<boolean> {
		try {
			await this.axiosInstance.post(`/agents/${agentId}/stop`);
			return true;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Restart agent
	 */
	async restartAgent(agentId: string): Promise<boolean> {
		try {
			await this.axiosInstance.post(`/agents/${agentId}/restart`);
			return true;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get agent status
	 */
	async getAgentStatus(agentId: string): Promise<AgentStatus> {
		const agent = await this.getAgent(agentId);
		return agent?.status || AgentStatus.INACTIVE;
	}

	// ============ Logs Methods ============

	/**
	 * Get agent logs
	 */
	async getAgentLogs(
		agentId: string,
		options: {
			limit?: number;
			since?: string;
			level?: 'debug' | 'info' | 'warning' | 'error';
		} = {}
	): Promise<AgentLog[]> {
		try {
			const response = await this.axiosInstance.get(`/agents/${agentId}/logs`, {
				params: {
					limit: options.limit || 100,
					since: options.since,
					level: options.level,
				},
			});
			return response.data.logs as AgentLog[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Stream agent logs (returns log entries)
	 */
	async streamLogs(
		agentId: string,
		callback: (log: AgentLog) => void,
		options: {
			duration?: number;
		} = {}
	): Promise<void> {
		const duration = options.duration || 60000; // 1 minute default
		const pollInterval = 2000;
		const startTime = Date.now();
		let lastTimestamp: string | undefined;

		while (Date.now() - startTime < duration) {
			const logs = await this.getAgentLogs(agentId, {
				since: lastTimestamp,
				limit: 50,
			});

			for (const log of logs) {
				callback(log);
				lastTimestamp = log.timestamp;
			}

			await new Promise(resolve => setTimeout(resolve, pollInterval));
		}
	}

	// ============ Secrets Methods ============

	/**
	 * Get agent secrets (keys only, not values)
	 */
	async getAgentSecrets(agentId: string): Promise<string[]> {
		try {
			const response = await this.axiosInstance.get(`/agents/${agentId}/secrets`);
			return response.data.keys as string[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Set agent secrets
	 */
	async setAgentSecrets(agentId: string, secrets: AgentSecrets): Promise<boolean> {
		try {
			await this.axiosInstance.put(`/agents/${agentId}/secrets`, { secrets });
			return true;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Delete agent secret
	 */
	async deleteAgentSecret(agentId: string, key: string): Promise<boolean> {
		try {
			await this.axiosInstance.delete(`/agents/${agentId}/secrets/${key}`);
			return true;
		} catch {
			return false;
		}
	}

	// ============ Usage Methods ============

	/**
	 * Get agent usage statistics
	 */
	async getUsageStats(agentId: string): Promise<UsageStats> {
		try {
			const response = await this.axiosInstance.get(`/agents/${agentId}/stats`);
			return {
				messagesReceived: response.data.messages_received,
				messagesSent: response.data.messages_sent,
				tasksCompleted: response.data.tasks_completed,
				uptime: response.data.uptime,
				lastActive: response.data.last_active,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get overall account usage
	 */
	async getAccountUsage(): Promise<{
		totalAgents: number;
		activeAgents: number;
		totalMessages: number;
		monthlyUsage: number;
	}> {
		try {
			const response = await this.axiosInstance.get('/usage');
			return {
				totalAgents: response.data.total_agents,
				activeAgents: response.data.active_agents,
				totalMessages: response.data.total_messages,
				monthlyUsage: response.data.monthly_usage,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// ============ Mailbox Methods ============

	/**
	 * Get agent mailbox address
	 */
	async getAgentMailbox(agentId: string): Promise<{
		address: string;
		enabled: boolean;
	}> {
		try {
			const response = await this.axiosInstance.get(`/agents/${agentId}/mailbox`);
			return {
				address: response.data.address,
				enabled: response.data.enabled,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Enable/disable mailbox for agent
	 */
	async setMailboxEnabled(agentId: string, enabled: boolean): Promise<boolean> {
		try {
			await this.axiosInstance.patch(`/agents/${agentId}/mailbox`, { enabled });
			return true;
		} catch {
			return false;
		}
	}

	// ============ User Info Methods ============

	/**
	 * Get current user info
	 */
	async getUserInfo(): Promise<{
		id: string;
		email: string;
		name?: string;
		plan?: string;
	}> {
		try {
			const response = await this.axiosInstance.get('/user/info');
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// ============ Helper Methods ============

	/**
	 * Handle errors
	 */
	private handleError(error: unknown): Error {
		if (error instanceof AxiosError) {
			const message = error.response?.data?.message ||
				error.response?.data?.error ||
				error.message;
			return new Error(`Agentverse API error: ${message}`);
		}
		if (error instanceof Error) {
			return error;
		}
		return new Error(String(error));
	}
}

/**
 * Create Agentverse client
 */
export function createAgentverseClient(options: AgentverseClientOptions = {}): AgentverseClient {
	return new AgentverseClient(options);
}
