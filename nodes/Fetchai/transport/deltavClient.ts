/**
 * DeltaV Client for Fetch.ai AI Engine
 * 
 * DeltaV is Fetch.ai's AI engine that connects users with agent services.
 * It handles natural language task processing, agent discovery,
 * and orchestrates multi-agent workflows.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { DELTAV_CONFIG, TaskStatus, FUNCTION_CATEGORIES } from '../constants/agents';

/**
 * DeltaV client options
 */
export interface DeltaVClientOptions {
	environment?: 'production' | 'staging';
	apiKey?: string;
	timeout?: number;
}

/**
 * Task submission options
 */
export interface TaskOptions {
	objective: string;
	context?: string;
	preferences?: Record<string, unknown>;
	maxBudget?: number;
	timeout?: number;
}

/**
 * Task status response
 */
export interface TaskStatusResponse {
	taskId: string;
	status: TaskStatus;
	progress?: number;
	currentStep?: string;
	result?: unknown;
	error?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Function/Service info
 */
export interface FunctionInfo {
	id: string;
	name: string;
	description: string;
	category: string;
	agentAddress: string;
	protocolDigest: string;
	inputSchema?: Record<string, unknown>;
	outputSchema?: Record<string, unknown>;
	rating?: number;
	usageCount?: number;
	pricing?: {
		amount: string;
		denom: string;
	};
}

/**
 * Search result
 */
export interface SearchResult {
	functions: FunctionInfo[];
	totalCount: number;
	page: number;
	pageSize: number;
}

/**
 * Credits balance
 */
export interface CreditsBalance {
	available: number;
	used: number;
	total: number;
	expiresAt?: string;
}

/**
 * DeltaV Client class
 */
export class DeltaVClient {
	private axiosInstance: AxiosInstance;
	private config: typeof DELTAV_CONFIG.production;
	private apiKey?: string;

	constructor(options: DeltaVClientOptions = {}) {
		const env = options.environment || 'production';
		this.config = DELTAV_CONFIG[env];
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

	// ============ Task Methods ============

	/**
	 * Submit a new task
	 */
	async submitTask(options: TaskOptions): Promise<{ taskId: string }> {
		try {
			const response = await this.axiosInstance.post('/tasks', {
				objective: options.objective,
				context: options.context,
				preferences: options.preferences,
				max_budget: options.maxBudget,
				timeout: options.timeout,
			});

			return {
				taskId: response.data.task_id,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get task status
	 */
	async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
		try {
			const response = await this.axiosInstance.get(`/tasks/${taskId}`);
			
			return {
				taskId: response.data.task_id,
				status: response.data.status as TaskStatus,
				progress: response.data.progress,
				currentStep: response.data.current_step,
				result: response.data.result,
				error: response.data.error,
				createdAt: response.data.created_at,
				updatedAt: response.data.updated_at,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get task results
	 */
	async getTaskResults(taskId: string): Promise<unknown> {
		const status = await this.getTaskStatus(taskId);
		
		if (status.status !== TaskStatus.COMPLETED) {
			throw new Error(`Task not completed. Current status: ${status.status}`);
		}

		return status.result;
	}

	/**
	 * Cancel a task
	 */
	async cancelTask(taskId: string): Promise<boolean> {
		try {
			await this.axiosInstance.delete(`/tasks/${taskId}`);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Wait for task completion
	 */
	async waitForTask(
		taskId: string,
		options: {
			pollInterval?: number;
			timeout?: number;
			onProgress?: (status: TaskStatusResponse) => void;
		} = {}
	): Promise<TaskStatusResponse> {
		const pollInterval = options.pollInterval || 2000;
		const timeout = options.timeout || 300000; // 5 minutes default
		const startTime = Date.now();

		while (Date.now() - startTime < timeout) {
			const status = await this.getTaskStatus(taskId);
			
			if (options.onProgress) {
				options.onProgress(status);
			}

			if (
				status.status === TaskStatus.COMPLETED ||
				status.status === TaskStatus.FAILED ||
				status.status === TaskStatus.CANCELLED
			) {
				return status;
			}

			await new Promise(resolve => setTimeout(resolve, pollInterval));
		}

		throw new Error('Task timeout');
	}

	// ============ Function/Service Methods ============

	/**
	 * Get available services/functions
	 */
	async getAvailableServices(category?: string): Promise<FunctionInfo[]> {
		try {
			const params: Record<string, string> = {};
			if (category) {
				params.category = category;
			}

			const response = await this.axiosInstance.get('/functions', { params });
			return response.data.functions as FunctionInfo[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Search functions
	 */
	async searchFunctions(
		query: string,
		options: {
			category?: string;
			page?: number;
			pageSize?: number;
		} = {}
	): Promise<SearchResult> {
		try {
			const response = await this.axiosInstance.get('/functions/search', {
				params: {
					q: query,
					category: options.category,
					page: options.page || 1,
					page_size: options.pageSize || 20,
				},
			});

			return {
				functions: response.data.functions,
				totalCount: response.data.total_count,
				page: response.data.page,
				pageSize: response.data.page_size,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get function info
	 */
	async getFunctionInfo(functionId: string): Promise<FunctionInfo | null> {
		try {
			const response = await this.axiosInstance.get(`/functions/${functionId}`);
			return response.data as FunctionInfo;
		} catch (error) {
			if ((error as AxiosError).response?.status === 404) {
				return null;
			}
			throw this.handleError(error);
		}
	}

	/**
	 * Execute a function directly
	 */
	async executeFunction(
		functionId: string,
		input: Record<string, unknown>
	): Promise<{ taskId: string }> {
		try {
			const response = await this.axiosInstance.post(
				`/functions/${functionId}/execute`,
				{ input }
			);

			return {
				taskId: response.data.task_id,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get popular functions
	 */
	async getPopularFunctions(limit: number = 10): Promise<FunctionInfo[]> {
		try {
			const response = await this.axiosInstance.get('/functions/popular', {
				params: { limit },
			});
			return response.data.functions as FunctionInfo[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get AI recommendations for a query
	 */
	async getRecommendations(query: string): Promise<FunctionInfo[]> {
		try {
			const response = await this.axiosInstance.post('/recommendations', {
				query,
			});
			return response.data.recommendations as FunctionInfo[];
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// ============ Rating & Feedback Methods ============

	/**
	 * Rate a service
	 */
	async rateService(
		functionId: string,
		rating: number,
		feedback?: string
	): Promise<boolean> {
		try {
			await this.axiosInstance.post(`/functions/${functionId}/rate`, {
				rating,
				feedback,
			});
			return true;
		} catch {
			return false;
		}
	}

	// ============ Credits Methods ============

	/**
	 * Get credits balance
	 */
	async getCreditsBalance(): Promise<CreditsBalance> {
		try {
			const response = await this.axiosInstance.get('/credits');
			return {
				available: response.data.available,
				used: response.data.used,
				total: response.data.total,
				expiresAt: response.data.expires_at,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// ============ Conversation Methods ============

	/**
	 * Get conversation history
	 */
	async getConversationHistory(conversationId: string): Promise<unknown[]> {
		try {
			const response = await this.axiosInstance.get(
				`/conversations/${conversationId}/messages`
			);
			return response.data.messages;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Send message in conversation
	 */
	async sendConversationMessage(
		conversationId: string,
		message: string
	): Promise<{ messageId: string; response?: string }> {
		try {
			const response = await this.axiosInstance.post(
				`/conversations/${conversationId}/messages`,
				{ content: message }
			);
			return {
				messageId: response.data.message_id,
				response: response.data.response,
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// ============ Category Methods ============

	/**
	 * Get available categories
	 */
	getCategories(): string[] {
		return [...FUNCTION_CATEGORIES];
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
			return new Error(`DeltaV API error: ${message}`);
		}
		if (error instanceof Error) {
			return error;
		}
		return new Error(String(error));
	}
}

/**
 * Create DeltaV client
 */
export function createDeltaVClient(options: DeltaVClientOptions = {}): DeltaVClient {
	return new DeltaVClient(options);
}
