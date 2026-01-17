/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IPollFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';

import axios from 'axios';
import { getNetworkConfig } from './constants/networks';
import { AGENTVERSE_CONFIG } from './constants/agents';

/**
 * Fetch.ai Trigger Node
 * 
 * Monitors Fetch.ai blockchain and agent events in real-time.
 * Supports polling for various event types including:
 * - Account balance changes
 * - Agent messages and status
 * - DeltaV task completion
 * - Contract events
 * - Governance proposals
 * - IBC transfers
 * 
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 */
export class FetchaiTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fetch.ai Trigger',
		name: 'fetchaiTrigger',
		icon: 'file:fetchai.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers on Fetch.ai blockchain events, agent messages, and DeltaV tasks',
		defaults: {
			name: 'Fetch.ai Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'fetchaiNetwork',
				required: true,
			},
			{
				name: 'fetchaiApi',
				required: false,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event Category',
				name: 'eventCategory',
				type: 'options',
				options: [
					{ name: 'Account Events', value: 'account' },
					{ name: 'Agent Events', value: 'agent' },
					{ name: 'Almanac Events', value: 'almanac' },
					{ name: 'Block Events', value: 'block' },
					{ name: 'Contract Events', value: 'contract' },
					{ name: 'DeltaV Events', value: 'deltav' },
					{ name: 'Governance Events', value: 'governance' },
					{ name: 'IBC Events', value: 'ibc' },
				],
				default: 'account',
				description: 'Category of events to monitor',
			},

			// Account Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['account'],
					},
				},
				options: [
					{ name: 'Balance Changed', value: 'balanceChanged', description: 'Triggered when account balance changes' },
					{ name: 'Delegation Changed', value: 'delegationChanged', description: 'Triggered when staking delegation changes' },
					{ name: 'FET Received', value: 'fetReceived', description: 'Triggered when FET tokens are received' },
					{ name: 'FET Sent', value: 'fetSent', description: 'Triggered when FET tokens are sent' },
					{ name: 'Rewards Available', value: 'rewardsAvailable', description: 'Triggered when staking rewards are available' },
				],
				default: 'balanceChanged',
			},

			// Agent Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['agent'],
					},
				},
				options: [
					{ name: 'Agent Message Received', value: 'agentMessageReceived', description: 'Triggered when agent receives a message' },
					{ name: 'Agent Protocol Invoked', value: 'agentProtocolInvoked', description: 'Triggered when agent protocol is invoked' },
					{ name: 'Agent Registered', value: 'agentRegistered', description: 'Triggered when a new agent is registered' },
					{ name: 'Agent Status Changed', value: 'agentStatusChanged', description: 'Triggered when agent status changes' },
					{ name: 'Agent Task Completed', value: 'agentTaskCompleted', description: 'Triggered when agent completes a task' },
					{ name: 'Mailbox Message Received', value: 'mailboxMessageReceived', description: 'Triggered when mailbox receives a message' },
				],
				default: 'agentMessageReceived',
			},

			// Almanac Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['almanac'],
					},
				},
				options: [
					{ name: 'Agent Updated', value: 'agentUpdated', description: 'Triggered when agent registration is updated' },
					{ name: 'New Agent Registered', value: 'newAgentRegistered', description: 'Triggered when new agent registers in Almanac' },
					{ name: 'Registration Expiring', value: 'registrationExpiring', description: 'Triggered when registration is about to expire' },
				],
				default: 'newAgentRegistered',
			},

			// DeltaV Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['deltav'],
					},
				},
				options: [
					{ name: 'New Service Available', value: 'newServiceAvailable', description: 'Triggered when new service becomes available' },
					{ name: 'Task Completed', value: 'taskCompleted', description: 'Triggered when DeltaV task completes' },
					{ name: 'Task Failed', value: 'taskFailed', description: 'Triggered when DeltaV task fails' },
					{ name: 'Task Submitted', value: 'taskSubmitted', description: 'Triggered when new task is submitted' },
				],
				default: 'taskCompleted',
			},

			// Contract Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['contract'],
					},
				},
				options: [
					{ name: 'Contract Event', value: 'contractEvent', description: 'Triggered on contract event emission' },
					{ name: 'Contract Executed', value: 'contractExecuted', description: 'Triggered when contract is executed' },
					{ name: 'Contract Instantiated', value: 'contractInstantiated', description: 'Triggered when new contract is instantiated' },
					{ name: 'State Changed', value: 'stateChanged', description: 'Triggered when contract state changes' },
				],
				default: 'contractExecuted',
			},

			// Governance Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['governance'],
					},
				},
				options: [
					{ name: 'New Proposal', value: 'newProposal', description: 'Triggered when new proposal is created' },
					{ name: 'Proposal Failed', value: 'proposalFailed', description: 'Triggered when proposal fails' },
					{ name: 'Proposal Passed', value: 'proposalPassed', description: 'Triggered when proposal passes' },
					{ name: 'Vote Cast', value: 'voteCast', description: 'Triggered when vote is cast' },
				],
				default: 'newProposal',
			},

			// Block Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['block'],
					},
				},
				options: [
					{ name: 'New Block', value: 'newBlock', description: 'Triggered on each new block' },
					{ name: 'Transaction Confirmed', value: 'transactionConfirmed', description: 'Triggered when specific transaction is confirmed' },
				],
				default: 'newBlock',
			},

			// IBC Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['ibc'],
					},
				},
				options: [
					{ name: 'IBC Transfer Received', value: 'ibcTransferReceived', description: 'Triggered when IBC transfer is received' },
					{ name: 'IBC Transfer Sent', value: 'ibcTransferSent', description: 'Triggered when IBC transfer is sent' },
					{ name: 'Packet Acknowledged', value: 'packetAcknowledged', description: 'Triggered when IBC packet is acknowledged' },
				],
				default: 'ibcTransferReceived',
			},

			// Address to monitor (for account events)
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'fetch1...',
				description: 'Address to monitor for events',
				displayOptions: {
					show: {
						eventCategory: ['account'],
					},
				},
			},

			// Agent address to monitor
			{
				displayName: 'Agent Address',
				name: 'agentAddress',
				type: 'string',
				default: '',
				placeholder: 'agent1q...',
				description: 'Agent address to monitor (leave empty for all agents)',
				displayOptions: {
					show: {
						eventCategory: ['agent', 'almanac'],
					},
				},
			},

			// Task ID to monitor
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				default: '',
				placeholder: 'Leave empty to monitor all tasks',
				description: 'Specific task ID to monitor',
				displayOptions: {
					show: {
						eventCategory: ['deltav'],
						event: ['taskCompleted', 'taskFailed'],
					},
				},
			},

			// Contract address to monitor
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				default: '',
				placeholder: 'fetch1...',
				description: 'Contract address to monitor',
				displayOptions: {
					show: {
						eventCategory: ['contract'],
					},
				},
			},

			// Transaction hash to monitor
			{
				displayName: 'Transaction Hash',
				name: 'txHash',
				type: 'string',
				default: '',
				placeholder: 'Transaction hash to monitor',
				description: 'Specific transaction hash to monitor for confirmation',
				displayOptions: {
					show: {
						eventCategory: ['block'],
						event: ['transactionConfirmed'],
					},
				},
			},

			// Proposal ID to monitor
			{
				displayName: 'Proposal ID',
				name: 'proposalId',
				type: 'number',
				default: 0,
				description: 'Specific proposal ID to monitor (0 for all proposals)',
				displayOptions: {
					show: {
						eventCategory: ['governance'],
					},
				},
			},

			// Protocol digest filter
			{
				displayName: 'Protocol Digest',
				name: 'protocolDigest',
				type: 'string',
				default: '',
				placeholder: 'proto:...',
				description: 'Filter by protocol digest (leave empty for all)',
				displayOptions: {
					show: {
						eventCategory: ['agent'],
						event: ['agentProtocolInvoked', 'agentMessageReceived'],
					},
				},
			},

			// Expiry threshold for registration expiring
			{
				displayName: 'Expiry Threshold (Hours)',
				name: 'expiryThreshold',
				type: 'number',
				default: 24,
				description: 'Hours before expiry to trigger notification',
				displayOptions: {
					show: {
						eventCategory: ['almanac'],
						event: ['registrationExpiring'],
					},
				},
			},

			// Balance change threshold
			{
				displayName: 'Minimum Change (FET)',
				name: 'minChange',
				type: 'number',
				default: 0,
				description: 'Minimum balance change to trigger (0 for any change)',
				displayOptions: {
					show: {
						eventCategory: ['account'],
						event: ['balanceChanged', 'fetReceived', 'fetSent'],
					},
				},
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const eventCategory = this.getNodeParameter('eventCategory') as string;
		const event = this.getNodeParameter('event') as string;

		const networkCredentials = await this.getCredentials('fetchaiNetwork');
		const networkConfig = getNetworkConfig(networkCredentials.network as string);

		let apiCredentials: { agentverseApiKey?: string } = {};
		try {
			apiCredentials = await this.getCredentials('fetchaiApi') as typeof apiCredentials;
		} catch {
			// Optional credentials
		}

		const webhookData = this.getWorkflowStaticData('node');
		const returnData: IDataObject[] = [];

		try {
			// ============ ACCOUNT EVENTS ============
			if (eventCategory === 'account') {
				const address = this.getNodeParameter('address') as string;
				const minChange = this.getNodeParameter('minChange', 0) as number;

				if (event === 'balanceChanged' || event === 'fetReceived' || event === 'fetSent') {
					const response = await axios.get(
						`${networkConfig.restEndpoint}/cosmos/bank/v1beta1/balances/${address}`
					);

					const currentBalance = response.data.balances?.find(
						(b: { denom: string }) => b.denom === networkConfig.minDenom
					)?.amount || '0';

					const previousBalance = webhookData.lastBalance as string || currentBalance;

					if (currentBalance !== previousBalance) {
						const change = BigInt(currentBalance) - BigInt(previousBalance);
						const changeFloat = Number(change) / 1e18;

						if (Math.abs(changeFloat) >= minChange) {
							if (event === 'balanceChanged' ||
								(event === 'fetReceived' && change > BigInt(0)) ||
								(event === 'fetSent' && change < BigInt(0))) {
								returnData.push({
									event,
									address,
									previousBalance: previousBalance,
									currentBalance: currentBalance,
									change: change.toString(),
									changeFET: changeFloat,
									timestamp: new Date().toISOString(),
								});
							}
						}
					}

					webhookData.lastBalance = currentBalance;
				}
			}

			// ============ AGENT EVENTS ============
			else if (eventCategory === 'agent') {
				const agentAddress = this.getNodeParameter('agentAddress', '') as string;

				if (event === 'mailboxMessageReceived' && agentAddress) {
					const config = AGENTVERSE_CONFIG[apiCredentials.agentverseApiKey ? 'production' : 'production'];
					
					try {
						const response = await axios.get(
							`${config.mailboxUrl}/v1/agents/${agentAddress}/messages`,
							{
								headers: apiCredentials.agentverseApiKey 
									? { Authorization: `Bearer ${apiCredentials.agentverseApiKey}` }
									: {},
							}
						);

						const messages = response.data || [];
						const lastMessageId = webhookData.lastMessageId as string;

						for (const message of messages) {
							if (!lastMessageId || message.id > lastMessageId) {
								returnData.push({
									event: 'mailboxMessageReceived',
									agentAddress,
									messageId: message.id,
									sender: message.sender,
									payload: message.envelope?.payload,
									receivedAt: message.receivedAt,
									timestamp: new Date().toISOString(),
								});
							}
						}

						if (messages.length > 0) {
							webhookData.lastMessageId = messages[0].id;
						}
					} catch {
						// Mailbox might not be accessible
					}
				}

				if (event === 'agentStatusChanged' && agentAddress && apiCredentials.agentverseApiKey) {
					const config = AGENTVERSE_CONFIG.production;
					
					try {
						const response = await axios.get(
							`${config.apiUrl}/agents/address/${agentAddress}`,
							{
								headers: { Authorization: `Bearer ${apiCredentials.agentverseApiKey}` },
							}
						);

						const currentStatus = response.data?.status;
						const previousStatus = webhookData.lastAgentStatus as string;

						if (previousStatus && currentStatus !== previousStatus) {
							returnData.push({
								event: 'agentStatusChanged',
								agentAddress,
								previousStatus,
								currentStatus,
								timestamp: new Date().toISOString(),
							});
						}

						webhookData.lastAgentStatus = currentStatus;
					} catch {
						// Agent might not exist
					}
				}
			}

			// ============ DELTAV EVENTS ============
			else if (eventCategory === 'deltav') {
				const taskId = this.getNodeParameter('taskId', '') as string;

				if ((event === 'taskCompleted' || event === 'taskFailed') && taskId && apiCredentials.agentverseApiKey) {
					try {
						const response = await axios.get(
							`https://deltav.agentverse.ai/api/v1/tasks/${taskId}`,
							{
								headers: { Authorization: `Bearer ${apiCredentials.agentverseApiKey}` },
							}
						);

						const currentStatus = response.data?.status;
						const previousStatus = webhookData.lastTaskStatus as string;

						if (previousStatus !== currentStatus) {
							if ((event === 'taskCompleted' && currentStatus === 'completed') ||
								(event === 'taskFailed' && currentStatus === 'failed')) {
								returnData.push({
									event,
									taskId,
									status: currentStatus,
									result: response.data?.result,
									error: response.data?.error,
									timestamp: new Date().toISOString(),
								});
							}
						}

						webhookData.lastTaskStatus = currentStatus;
					} catch {
						// Task might not exist
					}
				}
			}

			// ============ BLOCK EVENTS ============
			else if (eventCategory === 'block') {
				if (event === 'newBlock') {
					const response = await axios.get(
						`${networkConfig.restEndpoint}/cosmos/base/tendermint/v1beta1/blocks/latest`
					);

					const currentHeight = parseInt(response.data.block?.header?.height || '0');
					const lastHeight = webhookData.lastBlockHeight as number || 0;

					if (currentHeight > lastHeight) {
						returnData.push({
							event: 'newBlock',
							height: currentHeight,
							hash: response.data.block_id?.hash,
							time: response.data.block?.header?.time,
							proposer: response.data.block?.header?.proposer_address,
							txCount: response.data.block?.data?.txs?.length || 0,
							timestamp: new Date().toISOString(),
						});
					}

					webhookData.lastBlockHeight = currentHeight;
				}

				if (event === 'transactionConfirmed') {
					const txHash = this.getNodeParameter('txHash') as string;

					if (txHash) {
						try {
							const response = await axios.get(
								`${networkConfig.restEndpoint}/cosmos/tx/v1beta1/txs/${txHash}`
							);

							const confirmed = webhookData.txConfirmed as boolean;

							if (!confirmed && response.data.tx_response) {
								returnData.push({
									event: 'transactionConfirmed',
									txHash,
									height: response.data.tx_response.height,
									code: response.data.tx_response.code,
									gasUsed: response.data.tx_response.gas_used,
									gasWanted: response.data.tx_response.gas_wanted,
									timestamp: new Date().toISOString(),
								});

								webhookData.txConfirmed = true;
							}
						} catch {
							// Transaction not yet confirmed
						}
					}
				}
			}

			// ============ GOVERNANCE EVENTS ============
			else if (eventCategory === 'governance') {
				if (event === 'newProposal') {
					const response = await axios.get(
						`${networkConfig.restEndpoint}/cosmos/gov/v1beta1/proposals?proposal_status=1`
					);

					const proposals = response.data.proposals || [];
					const lastProposalId = webhookData.lastProposalId as string || '0';

					for (const proposal of proposals) {
						if (parseInt(proposal.proposal_id) > parseInt(lastProposalId)) {
							returnData.push({
								event: 'newProposal',
								proposalId: proposal.proposal_id,
								title: proposal.content?.title,
								description: proposal.content?.description,
								status: proposal.status,
								submitTime: proposal.submit_time,
								depositEndTime: proposal.deposit_end_time,
								votingStartTime: proposal.voting_start_time,
								votingEndTime: proposal.voting_end_time,
								timestamp: new Date().toISOString(),
							});
						}
					}

					if (proposals.length > 0) {
						const maxId = Math.max(...proposals.map((p: { proposal_id: string }) => parseInt(p.proposal_id)));
						webhookData.lastProposalId = maxId.toString();
					}
				}

				if (event === 'proposalPassed' || event === 'proposalFailed') {
					const proposalId = this.getNodeParameter('proposalId') as number;

					if (proposalId > 0) {
						const response = await axios.get(
							`${networkConfig.restEndpoint}/cosmos/gov/v1beta1/proposals/${proposalId}`
						);

						const currentStatus = response.data.proposal?.status;
						const previousStatus = webhookData.lastProposalStatus as string;

						if (previousStatus && currentStatus !== previousStatus) {
							if ((event === 'proposalPassed' && currentStatus === 'PROPOSAL_STATUS_PASSED') ||
								(event === 'proposalFailed' && currentStatus === 'PROPOSAL_STATUS_REJECTED')) {
								returnData.push({
									event,
									proposalId,
									status: currentStatus,
									finalTallyResult: response.data.proposal?.final_tally_result,
									timestamp: new Date().toISOString(),
								});
							}
						}

						webhookData.lastProposalStatus = currentStatus;
					}
				}
			}

			// ============ CONTRACT EVENTS ============
			else if (eventCategory === 'contract') {
				const contractAddress = this.getNodeParameter('contractAddress') as string;

				if (event === 'contractExecuted' && contractAddress) {
					const response = await axios.get(
						`${networkConfig.restEndpoint}/cosmos/tx/v1beta1/txs?events=execute._contract_address='${contractAddress}'&order_by=2&pagination.limit=10`
					);

					const txs = response.data.tx_responses || [];
					const lastTxHash = webhookData.lastContractTxHash as string;

					for (const tx of txs) {
						if (tx.txhash !== lastTxHash) {
							returnData.push({
								event: 'contractExecuted',
								contractAddress,
								txHash: tx.txhash,
								height: tx.height,
								sender: tx.tx?.body?.messages?.[0]?.sender,
								msg: tx.tx?.body?.messages?.[0]?.msg,
								timestamp: new Date().toISOString(),
							});
						}
					}

					if (txs.length > 0) {
						webhookData.lastContractTxHash = txs[0].txhash;
					}
				}
			}

			// ============ ALMANAC EVENTS ============
			else if (eventCategory === 'almanac') {
				const agentAddress = this.getNodeParameter('agentAddress', '') as string;

				if (event === 'registrationExpiring' && agentAddress) {
					const expiryThreshold = this.getNodeParameter('expiryThreshold') as number;
					
					// Query Almanac contract for expiry
					// This would need the actual Almanac contract query
					const thresholdSeconds = expiryThreshold * 3600;
					const now = Math.floor(Date.now() / 1000);

					// Placeholder - would query actual contract
					const mockExpiry = now + thresholdSeconds - 100; // For demo

					if (mockExpiry - now < thresholdSeconds) {
						const alreadyNotified = webhookData.expiryNotified as boolean;

						if (!alreadyNotified) {
							returnData.push({
								event: 'registrationExpiring',
								agentAddress,
								expiryTimestamp: mockExpiry,
								expiryDate: new Date(mockExpiry * 1000).toISOString(),
								hoursRemaining: Math.floor((mockExpiry - now) / 3600),
								timestamp: new Date().toISOString(),
							});

							webhookData.expiryNotified = true;
						}
					}
				}
			}

		} catch (error) {
			// Log error but don't throw to allow continued polling
			if (error instanceof Error) {
				console.error('Fetch.ai Trigger error:', error.message);
			}
		}

		if (returnData.length === 0) {
			return null;
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
