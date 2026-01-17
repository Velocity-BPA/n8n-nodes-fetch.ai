/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { createCosmosClient } from './transport/cosmosClient';
import { createAgentClient } from './transport/agentClient';
import { createAlmanacClient } from './transport/almanacClient';
import { createDeltaVClient } from './transport/deltavClient';
import { createAgentverseClient } from './transport/agentverseClient';
import { fetToAfet, afetToFet, formatFet, createFetCoin } from './utils/unitConverter';
import { validateFetchAddress, shortenAddress } from './utils/addressUtils';
import { createEnvelope } from './utils/messageUtils';

/**
 * Fetch.ai n8n Community Node
 * 
 * This node provides comprehensive access to the Fetch.ai blockchain
 * and its ecosystem of autonomous agents, including:
 * 
 * - Account & wallet operations
 * - uAgents management
 * - Almanac registry
 * - DeltaV AI engine
 * - Agentverse hosted platform
 * - CosmWasm smart contracts
 * - Staking & governance
 * - IBC cross-chain transfers
 * - And more...
 * 
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 */
export class Fetchai implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fetch.ai',
		name: 'fetchai',
		icon: 'file:fetchai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Fetch.ai blockchain, uAgents, Almanac, DeltaV, and Agentverse',
		defaults: {
			name: 'Fetch.ai',
		},
		inputs: ['main'],
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
			{
				name: 'almanac',
				required: false,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Agent', value: 'agent' },
					{ name: 'Agentverse', value: 'agentverse' },
					{ name: 'Almanac', value: 'almanac' },
					{ name: 'Contract', value: 'contract' },
					{ name: 'DeltaV', value: 'deltav' },
					{ name: 'Governance', value: 'governance' },
					{ name: 'IBC', value: 'ibc' },
					{ name: 'Indexer', value: 'indexer' },
					{ name: 'Messaging', value: 'messaging' },
					{ name: 'Name Service', value: 'nameService' },
					{ name: 'NFT (CW-721)', value: 'nft' },
					{ name: 'Protocol', value: 'protocol' },
					{ name: 'Staking', value: 'staking' },
					{ name: 'Token (CW-20)', value: 'token' },
					{ name: 'Utility', value: 'utility' },
					{ name: 'Wallet', value: 'wallet' },
				],
				default: 'account',
			},

			// ============ ACCOUNT OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{ name: 'Get Account Info', value: 'getAccountInfo', description: 'Get account details including sequence and account number', action: 'Get account info' },
					{ name: 'Get All Balances', value: 'getAllBalances', description: 'Get all token balances including IBC tokens', action: 'Get all balances' },
					{ name: 'Get Delegations', value: 'getDelegations', description: 'Get staking delegations for account', action: 'Get delegations' },
					{ name: 'Get FET Balance', value: 'getBalance', description: 'Get FET token balance', action: 'Get fet balance' },
					{ name: 'Get Rewards', value: 'getRewards', description: 'Get staking rewards', action: 'Get rewards' },
					{ name: 'Get Transaction History', value: 'getTxHistory', description: 'Get transaction history for account', action: 'Get transaction history' },
					{ name: 'Transfer FET', value: 'transfer', description: 'Transfer FET tokens to another address', action: 'Transfer fet' },
					{ name: 'Validate Address', value: 'validateAddress', description: 'Validate a Fetch.ai address format', action: 'Validate address' },
				],
				default: 'getBalance',
			},

			// ============ AGENT OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['agent'],
					},
				},
				options: [
					{ name: 'Deregister Agent', value: 'deregisterAgent', description: 'Remove agent from Almanac registry', action: 'Deregister agent' },
					{ name: 'Get Agent by Name', value: 'getAgentByName', description: 'Find agent by registered name', action: 'Get agent by name' },
					{ name: 'Get Agent Endpoints', value: 'getAgentEndpoints', description: 'Get communication endpoints for agent', action: 'Get agent endpoints' },
					{ name: 'Get Agent Info', value: 'getAgentInfo', description: 'Get agent information from Almanac', action: 'Get agent info' },
					{ name: 'Get Agent Protocols', value: 'getAgentProtocols', description: 'Get protocols supported by agent', action: 'Get agent protocols' },
					{ name: 'Register Agent', value: 'registerAgent', description: 'Register a new agent in Almanac', action: 'Register agent' },
					{ name: 'Search Agents', value: 'searchAgents', description: 'Search for agents by query', action: 'Search agents' },
					{ name: 'Update Agent', value: 'updateAgent', description: 'Update agent registration', action: 'Update agent' },
					{ name: 'Verify Agent', value: 'verifyAgent', description: 'Verify agent registration status', action: 'Verify agent' },
				],
				default: 'getAgentInfo',
			},

			// ============ ALMANAC OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['almanac'],
					},
				},
				options: [
					{ name: 'Get Agents by Protocol', value: 'getAgentsByProtocol', description: 'Find agents implementing a protocol', action: 'Get agents by protocol' },
					{ name: 'Get Almanac Entry', value: 'getEntry', description: 'Get agent entry from Almanac', action: 'Get almanac entry' },
					{ name: 'Get Expiry Info', value: 'getExpiryInfo', description: 'Get registration expiry time', action: 'Get expiry info' },
					{ name: 'Get Registration Cost', value: 'getRegistrationCost', description: 'Get cost to register in Almanac', action: 'Get registration cost' },
					{ name: 'Query Almanac', value: 'queryAlmanac', description: 'Query Almanac contract directly', action: 'Query almanac' },
					{ name: 'Register in Almanac', value: 'register', description: 'Register agent in Almanac', action: 'Register in almanac' },
					{ name: 'Renew Registration', value: 'renewRegistration', description: 'Renew agent registration', action: 'Renew registration' },
					{ name: 'Update Entry', value: 'updateEntry', description: 'Update Almanac registration', action: 'Update entry' },
				],
				default: 'getEntry',
			},

			// ============ DELTAV OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['deltav'],
					},
				},
				options: [
					{ name: 'Execute Function', value: 'executeFunction', description: 'Execute a DeltaV function directly', action: 'Execute function' },
					{ name: 'Get AI Recommendations', value: 'getRecommendations', description: 'Get AI-powered function recommendations', action: 'Get ai recommendations' },
					{ name: 'Get Available Services', value: 'getAvailableServices', description: 'Get list of available DeltaV services', action: 'Get available services' },
					{ name: 'Get Credits Balance', value: 'getCreditsBalance', description: 'Get DeltaV credits balance', action: 'Get credits balance' },
					{ name: 'Get Function Info', value: 'getFunctionInfo', description: 'Get details about a DeltaV function', action: 'Get function info' },
					{ name: 'Get Popular Functions', value: 'getPopularFunctions', description: 'Get most popular DeltaV functions', action: 'Get popular functions' },
					{ name: 'Get Task Results', value: 'getTaskResults', description: 'Get results of completed task', action: 'Get task results' },
					{ name: 'Get Task Status', value: 'getTaskStatus', description: 'Check status of a DeltaV task', action: 'Get task status' },
					{ name: 'Rate Service', value: 'rateService', description: 'Rate a DeltaV service', action: 'Rate service' },
					{ name: 'Search Functions', value: 'searchFunctions', description: 'Search for DeltaV functions', action: 'Search functions' },
					{ name: 'Submit Task', value: 'submitTask', description: 'Submit a new task to DeltaV AI engine', action: 'Submit task' },
				],
				default: 'submitTask',
			},

			// ============ AGENTVERSE OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['agentverse'],
					},
				},
				options: [
					{ name: 'Deploy Agent', value: 'deployAgent', description: 'Deploy a new agent to Agentverse', action: 'Deploy agent' },
					{ name: 'Get Agent Logs', value: 'getAgentLogs', description: 'Get logs from hosted agent', action: 'Get agent logs' },
					{ name: 'Get Agent Secrets', value: 'getAgentSecrets', description: 'Get secret keys for agent', action: 'Get agent secrets' },
					{ name: 'Get Agent Status', value: 'getAgentStatus', description: 'Get status of hosted agent', action: 'Get agent status' },
					{ name: 'Get Agentverse Agent', value: 'getAgentverseAgent', description: 'Get hosted agent info', action: 'Get agentverse agent' },
					{ name: 'Get Hosted Agents', value: 'getHostedAgents', description: 'Get all hosted agents', action: 'Get hosted agents' },
					{ name: 'Get Usage Stats', value: 'getUsageStats', description: 'Get agent usage statistics', action: 'Get usage stats' },
					{ name: 'Set Agent Secrets', value: 'setAgentSecrets', description: 'Set secrets for agent', action: 'Set agent secrets' },
					{ name: 'Start Agent', value: 'startAgent', description: 'Start a hosted agent', action: 'Start agent' },
					{ name: 'Stop Agent', value: 'stopAgent', description: 'Stop a hosted agent', action: 'Stop agent' },
					{ name: 'Update Agent Code', value: 'updateAgentCode', description: 'Update agent source code', action: 'Update agent code' },
				],
				default: 'getHostedAgents',
			},

			// ============ MESSAGING OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['messaging'],
					},
				},
				options: [
					{ name: 'Broadcast Message', value: 'broadcastMessage', description: 'Broadcast message to multiple agents', action: 'Broadcast message' },
					{ name: 'Create Envelope', value: 'createEnvelope', description: 'Create a message envelope', action: 'Create envelope' },
					{ name: 'Get Mailbox Messages', value: 'getMailboxMessages', description: 'Get messages from agent mailbox', action: 'Get mailbox messages' },
					{ name: 'Get Message Status', value: 'getMessageStatus', description: 'Get status of sent message', action: 'Get message status' },
					{ name: 'Send Message', value: 'sendMessage', description: 'Send message to an agent', action: 'Send message' },
					{ name: 'Verify Envelope', value: 'verifyEnvelope', description: 'Verify message envelope signature', action: 'Verify envelope' },
				],
				default: 'sendMessage',
			},

			// ============ CONTRACT OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contract'],
					},
				},
				options: [
					{ name: 'Execute Contract', value: 'executeContract', description: 'Execute a smart contract method', action: 'Execute contract' },
					{ name: 'Get Code Info', value: 'getCodeInfo', description: 'Get information about contract code', action: 'Get code info' },
					{ name: 'Get Contract Info', value: 'getContractInfo', description: 'Get contract metadata', action: 'Get contract info' },
					{ name: 'Instantiate Contract', value: 'instantiateContract', description: 'Create new contract instance', action: 'Instantiate contract' },
					{ name: 'Query Contract', value: 'queryContract', description: 'Query smart contract state', action: 'Query contract' },
					{ name: 'Simulate Execution', value: 'simulateExecution', description: 'Simulate contract execution for gas estimation', action: 'Simulate execution' },
					{ name: 'Upload Contract', value: 'uploadContract', description: 'Upload contract code to chain', action: 'Upload contract' },
				],
				default: 'queryContract',
			},

			// ============ STAKING OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['staking'],
					},
				},
				options: [
					{ name: 'Claim Rewards', value: 'claimRewards', description: 'Claim staking rewards', action: 'Claim rewards' },
					{ name: 'Delegate FET', value: 'delegate', description: 'Delegate FET to a validator', action: 'Delegate fet' },
					{ name: 'Get Delegations', value: 'getDelegations', description: 'Get all delegations', action: 'Get delegations' },
					{ name: 'Get Staking Rewards', value: 'getStakingRewards', description: 'Get pending staking rewards', action: 'Get staking rewards' },
					{ name: 'Get Unbonding', value: 'getUnbonding', description: 'Get unbonding delegations', action: 'Get unbonding' },
					{ name: 'Get Validator Info', value: 'getValidatorInfo', description: 'Get validator details', action: 'Get validator info' },
					{ name: 'Get Validators', value: 'getValidators', description: 'Get list of validators', action: 'Get validators' },
					{ name: 'Redelegate FET', value: 'redelegate', description: 'Move delegation between validators', action: 'Redelegate fet' },
					{ name: 'Undelegate FET', value: 'undelegate', description: 'Undelegate FET from validator', action: 'Undelegate fet' },
				],
				default: 'getValidators',
			},

			// ============ GOVERNANCE OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['governance'],
					},
				},
				options: [
					{ name: 'Deposit to Proposal', value: 'depositToProposal', description: 'Add deposit to a proposal', action: 'Deposit to proposal' },
					{ name: 'Get Proposal Info', value: 'getProposalInfo', description: 'Get proposal details', action: 'Get proposal info' },
					{ name: 'Get Proposal Votes', value: 'getProposalVotes', description: 'Get votes on a proposal', action: 'Get proposal votes' },
					{ name: 'Get Proposals', value: 'getProposals', description: 'Get list of proposals', action: 'Get proposals' },
					{ name: 'Get Voting Power', value: 'getVotingPower', description: 'Get voting power for address', action: 'Get voting power' },
					{ name: 'Vote on Proposal', value: 'voteOnProposal', description: 'Cast vote on a proposal', action: 'Vote on proposal' },
				],
				default: 'getProposals',
			},

			// ============ IBC OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['ibc'],
					},
				},
				options: [
					{ name: 'Get Denom Trace', value: 'getDenomTrace', description: 'Get IBC denom origin trace', action: 'Get denom trace' },
					{ name: 'Get IBC Channels', value: 'getIbcChannels', description: 'Get available IBC channels', action: 'Get ibc channels' },
					{ name: 'Get Transfer History', value: 'getTransferHistory', description: 'Get IBC transfer history', action: 'Get transfer history' },
					{ name: 'IBC Transfer', value: 'ibcTransfer', description: 'Transfer tokens via IBC', action: 'Ibc transfer' },
				],
				default: 'getIbcChannels',
			},

			// ============ NAME SERVICE OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['nameService'],
					},
				},
				options: [
					{ name: 'Get Name Info', value: 'getNameInfo', description: 'Get name registration details', action: 'Get name info' },
					{ name: 'Get Names by Owner', value: 'getNamesByOwner', description: 'Get names owned by address', action: 'Get names by owner' },
					{ name: 'Register Name', value: 'registerName', description: 'Register a new name', action: 'Register name' },
					{ name: 'Resolve Name', value: 'resolveName', description: 'Resolve name to address', action: 'Resolve name' },
					{ name: 'Reverse Lookup', value: 'reverseLookup', description: 'Get name for address', action: 'Reverse lookup' },
					{ name: 'Transfer Name', value: 'transferName', description: 'Transfer name ownership', action: 'Transfer name' },
					{ name: 'Update Name Records', value: 'updateNameRecords', description: 'Update name metadata', action: 'Update name records' },
				],
				default: 'resolveName',
			},

			// ============ TOKEN (CW-20) OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['token'],
					},
				},
				options: [
					{ name: 'Approve Spending', value: 'approveSpending', description: 'Approve token allowance', action: 'Approve spending' },
					{ name: 'Get Allowance', value: 'getAllowance', description: 'Get token allowance', action: 'Get allowance' },
					{ name: 'Get Token Balance', value: 'getTokenBalance', description: 'Get CW-20 token balance', action: 'Get token balance' },
					{ name: 'Get Token Info', value: 'getTokenInfo', description: 'Get token metadata', action: 'Get token info' },
					{ name: 'Get Total Supply', value: 'getTotalSupply', description: 'Get token total supply', action: 'Get total supply' },
					{ name: 'Transfer Token', value: 'transferToken', description: 'Transfer CW-20 tokens', action: 'Transfer token' },
				],
				default: 'getTokenBalance',
			},

			// ============ NFT (CW-721) OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['nft'],
					},
				},
				options: [
					{ name: 'Approve NFT', value: 'approveNft', description: 'Approve NFT for transfer', action: 'Approve nft' },
					{ name: 'Get Collection Info', value: 'getCollectionInfo', description: 'Get NFT collection info', action: 'Get collection info' },
					{ name: 'Get NFT Info', value: 'getNftInfo', description: 'Get NFT metadata', action: 'Get nft info' },
					{ name: 'Get NFT Owner', value: 'getNftOwner', description: 'Get NFT owner', action: 'Get nft owner' },
					{ name: 'Get NFTs by Owner', value: 'getNftsByOwner', description: 'Get NFTs owned by address', action: 'Get nfts by owner' },
					{ name: 'Transfer NFT', value: 'transferNft', description: 'Transfer NFT to address', action: 'Transfer nft' },
				],
				default: 'getNftInfo',
			},

			// ============ UTILITY OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['utility'],
					},
				},
				options: [
					{ name: 'Convert Units', value: 'convertUnits', description: 'Convert between FET and afet', action: 'Convert units' },
					{ name: 'Decode Address', value: 'decodeAddress', description: 'Decode Bech32 address', action: 'Decode address' },
					{ name: 'Encode Address', value: 'encodeAddress', description: 'Encode to Bech32 address', action: 'Encode address' },
					{ name: 'Get Chain ID', value: 'getChainId', description: 'Get current chain ID', action: 'Get chain id' },
					{ name: 'Get Node Info', value: 'getNodeInfo', description: 'Get connected node info', action: 'Get node info' },
					{ name: 'Get Sync Status', value: 'getSyncStatus', description: 'Check node sync status', action: 'Get sync status' },
					{ name: 'Hash Data', value: 'hashData', description: 'Hash data with SHA256', action: 'Hash data' },
					{ name: 'Verify Signature', value: 'verifySignature', description: 'Verify a cryptographic signature', action: 'Verify signature' },
				],
				default: 'convertUnits',
			},

			// ============ WALLET OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['wallet'],
					},
				},
				options: [
					{ name: 'Create Wallet', value: 'createWallet', description: 'Generate a new wallet', action: 'Create wallet' },
					{ name: 'Get Public Key', value: 'getPublicKey', description: 'Get wallet public key', action: 'Get public key' },
					{ name: 'Get Wallet Info', value: 'getWalletInfo', description: 'Get connected wallet info', action: 'Get wallet info' },
					{ name: 'Restore Wallet', value: 'restoreWallet', description: 'Restore wallet from mnemonic', action: 'Restore wallet' },
					{ name: 'Sign Message', value: 'signMessage', description: 'Sign arbitrary message', action: 'Sign message' },
				],
				default: 'getWalletInfo',
			},

			// ============ INDEXER OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['indexer'],
					},
				},
				options: [
					{ name: 'Get Account Transactions', value: 'getAccountTxs', description: 'Get transactions for account', action: 'Get account transactions' },
					{ name: 'Get Latest Transactions', value: 'getLatestTxs', description: 'Get most recent transactions', action: 'Get latest transactions' },
					{ name: 'Query Blocks', value: 'queryBlocks', description: 'Query block data', action: 'Query blocks' },
					{ name: 'Query Events', value: 'queryEvents', description: 'Query blockchain events', action: 'Query events' },
					{ name: 'Query Transactions', value: 'queryTxs', description: 'Search transactions', action: 'Query transactions' },
				],
				default: 'getLatestTxs',
			},

			// ============ PROTOCOL OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['protocol'],
					},
				},
				options: [
					{ name: 'Get Protocol Digest', value: 'getProtocolDigest', description: 'Compute protocol digest', action: 'Get protocol digest' },
					{ name: 'Get Protocol Info', value: 'getProtocolInfo', description: 'Get protocol details', action: 'Get protocol info' },
					{ name: 'Get Protocols by Agent', value: 'getProtocolsByAgent', description: 'Get protocols for agent', action: 'Get protocols by agent' },
					{ name: 'Search Protocols', value: 'searchProtocols', description: 'Search for protocols', action: 'Search protocols' },
					{ name: 'Verify Protocol', value: 'verifyProtocol', description: 'Verify protocol compatibility', action: 'Verify protocol' },
				],
				default: 'getProtocolInfo',
			},

			// ============ COMMON PARAMETERS ============

			// Address parameter (used by many operations)
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'fetch1...',
				description: 'Fetch.ai wallet address (fetch1...)',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountInfo', 'getBalance', 'getAllBalances', 'getTxHistory', 'getDelegations', 'getRewards', 'validateAddress'],
					},
				},
			},

			// Agent address parameter
			{
				displayName: 'Agent Address',
				name: 'agentAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'agent1q...',
				description: 'Agent address (agent1q...)',
				displayOptions: {
					show: {
						resource: ['agent', 'almanac', 'messaging'],
						operation: ['getAgentInfo', 'getAgentProtocols', 'getAgentEndpoints', 'verifyAgent', 'updateAgent', 'deregisterAgent', 'getEntry', 'getExpiryInfo', 'renewRegistration', 'updateEntry', 'sendMessage', 'getMailboxMessages'],
					},
				},
			},

			// Recipient address for transfers
			{
				displayName: 'Recipient Address',
				name: 'recipientAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'fetch1...',
				description: 'Recipient wallet address',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['transfer'],
					},
				},
			},

			// Amount parameter
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'string',
				default: '',
				required: true,
				placeholder: '1.5',
				description: 'Amount in FET (e.g., 1.5)',
				displayOptions: {
					show: {
						resource: ['account', 'staking'],
						operation: ['transfer', 'delegate', 'undelegate', 'redelegate'],
					},
				},
			},

			// Contract address parameter
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'fetch1...',
				description: 'Smart contract address',
				displayOptions: {
					show: {
						resource: ['contract', 'token', 'nft'],
						operation: ['queryContract', 'executeContract', 'getContractInfo', 'getTokenInfo', 'getTokenBalance', 'transferToken', 'getAllowance', 'approveSpending', 'getTotalSupply', 'getNftInfo', 'getNftOwner', 'getNftsByOwner', 'transferNft', 'approveNft', 'getCollectionInfo'],
					},
				},
			},

			// Query message for contracts
			{
				displayName: 'Query Message',
				name: 'queryMessage',
				type: 'json',
				default: '{}',
				required: true,
				description: 'JSON query message for contract',
				displayOptions: {
					show: {
						resource: ['contract', 'almanac'],
						operation: ['queryContract', 'queryAlmanac'],
					},
				},
			},

			// Execute message for contracts
			{
				displayName: 'Execute Message',
				name: 'executeMessage',
				type: 'json',
				default: '{}',
				required: true,
				description: 'JSON execute message for contract',
				displayOptions: {
					show: {
						resource: ['contract'],
						operation: ['executeContract'],
					},
				},
			},

			// DeltaV Task objective
			{
				displayName: 'Objective',
				name: 'objective',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Book a flight from London to New York',
				description: 'Natural language description of the task',
				displayOptions: {
					show: {
						resource: ['deltav'],
						operation: ['submitTask'],
					},
				},
			},

			// Task ID
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				default: '',
				required: true,
				description: 'DeltaV task ID',
				displayOptions: {
					show: {
						resource: ['deltav'],
						operation: ['getTaskStatus', 'getTaskResults'],
					},
				},
			},

			// Agent ID for Agentverse
			{
				displayName: 'Agent ID',
				name: 'agentId',
				type: 'string',
				default: '',
				required: true,
				description: 'Hosted agent ID',
				displayOptions: {
					show: {
						resource: ['agentverse'],
						operation: ['getAgentverseAgent', 'getAgentStatus', 'startAgent', 'stopAgent', 'getAgentLogs', 'updateAgentCode', 'getAgentSecrets', 'setAgentSecrets', 'getUsageStats'],
					},
				},
			},

			// Validator address for staking
			{
				displayName: 'Validator Address',
				name: 'validatorAddress',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'fetchvaloper1...',
				description: 'Validator address',
				displayOptions: {
					show: {
						resource: ['staking'],
						operation: ['delegate', 'undelegate', 'redelegate', 'getValidatorInfo'],
					},
				},
			},

			// Proposal ID for governance
			{
				displayName: 'Proposal ID',
				name: 'proposalId',
				type: 'number',
				default: 0,
				required: true,
				description: 'Governance proposal ID',
				displayOptions: {
					show: {
						resource: ['governance'],
						operation: ['getProposalInfo', 'getProposalVotes', 'voteOnProposal', 'depositToProposal'],
					},
				},
			},

			// Vote option
			{
				displayName: 'Vote Option',
				name: 'voteOption',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'yes' },
					{ name: 'No', value: 'no' },
					{ name: 'Abstain', value: 'abstain' },
					{ name: 'No With Veto', value: 'noWithVeto' },
				],
				default: 'yes',
				required: true,
				displayOptions: {
					show: {
						resource: ['governance'],
						operation: ['voteOnProposal'],
					},
				},
			},

			// Name for name service
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'myagent.fetch',
				description: 'Name to resolve or register',
				displayOptions: {
					show: {
						resource: ['nameService', 'agent'],
						operation: ['resolveName', 'registerName', 'getNameInfo', 'transferName', 'updateNameRecords', 'getAgentByName'],
					},
				},
			},

			// Token ID for NFT
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'string',
				default: '',
				required: true,
				description: 'NFT token ID',
				displayOptions: {
					show: {
						resource: ['nft'],
						operation: ['getNftInfo', 'getNftOwner', 'transferNft', 'approveNft'],
					},
				},
			},

			// Protocol digest
			{
				displayName: 'Protocol Digest',
				name: 'protocolDigest',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'proto:...',
				description: 'Protocol digest hash',
				displayOptions: {
					show: {
						resource: ['almanac', 'protocol'],
						operation: ['getAgentsByProtocol', 'getProtocolInfo', 'verifyProtocol'],
					},
				},
			},

			// Message payload
			{
				displayName: 'Message Payload',
				name: 'messagePayload',
				type: 'json',
				default: '{}',
				required: true,
				description: 'JSON message payload',
				displayOptions: {
					show: {
						resource: ['messaging'],
						operation: ['sendMessage', 'createEnvelope', 'broadcastMessage'],
					},
				},
			},

			// Schema digest for messaging
			{
				displayName: 'Schema Digest',
				name: 'schemaDigest',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'model:...',
				description: 'Message schema digest',
				displayOptions: {
					show: {
						resource: ['messaging'],
						operation: ['sendMessage', 'createEnvelope'],
					},
				},
			},

			// Target agent for messaging
			{
				displayName: 'Target Agent',
				name: 'targetAgent',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'agent1q...',
				description: 'Target agent address',
				displayOptions: {
					show: {
						resource: ['messaging'],
						operation: ['sendMessage'],
					},
				},
			},

			// Unit conversion
			{
				displayName: 'Conversion Direction',
				name: 'conversionDirection',
				type: 'options',
				options: [
					{ name: 'FET to afet', value: 'fetToAfet' },
					{ name: 'afet to FET', value: 'afetToFet' },
				],
				default: 'fetToAfet',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertUnits'],
					},
				},
			},
			{
				displayName: 'Value',
				name: 'conversionValue',
				type: 'string',
				default: '',
				required: true,
				description: 'Value to convert',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertUnits'],
					},
				},
			},

			// Search query
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				default: '',
				required: true,
				description: 'Search query string',
				displayOptions: {
					show: {
						resource: ['agent', 'deltav', 'protocol'],
						operation: ['searchAgents', 'searchFunctions', 'searchProtocols'],
					},
				},
			},

			// Agent code for deployment
			{
				displayName: 'Agent Code',
				name: 'agentCode',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				required: true,
				description: 'Python code for the agent',
				displayOptions: {
					show: {
						resource: ['agentverse'],
						operation: ['deployAgent', 'updateAgentCode'],
					},
				},
			},

			// Agent name for deployment
			{
				displayName: 'Agent Name',
				name: 'agentName',
				type: 'string',
				default: '',
				required: true,
				description: 'Name for the hosted agent',
				displayOptions: {
					show: {
						resource: ['agentverse'],
						operation: ['deployAgent'],
					},
				},
			},

			// Function ID for DeltaV
			{
				displayName: 'Function ID',
				name: 'functionId',
				type: 'string',
				default: '',
				required: true,
				description: 'DeltaV function ID',
				displayOptions: {
					show: {
						resource: ['deltav'],
						operation: ['getFunctionInfo', 'executeFunction', 'rateService'],
					},
				},
			},

			// Additional Options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Memo',
						name: 'memo',
						type: 'string',
						default: '',
						description: 'Transaction memo',
					},
					{
						displayName: 'Gas Limit',
						name: 'gasLimit',
						type: 'number',
						default: 200000,
						description: 'Gas limit for transaction',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 10,
						description: 'Maximum number of results',
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: 'Page number for pagination',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const networkCredentials = await this.getCredentials('fetchaiNetwork');
		let apiCredentials: { agentverseApiKey?: string; deltavApiKey?: string } = {};
		
		try {
			apiCredentials = await this.getCredentials('fetchaiApi') as typeof apiCredentials;
		} catch {
			// API credentials are optional
		}

		// Initialize clients
		const cosmosClient = await createCosmosClient({
			network: networkCredentials.network as string,
			mnemonic: networkCredentials.mnemonic as string,
			restEndpoint: networkCredentials.restEndpoint as string,
			rpcEndpoint: networkCredentials.rpcEndpoint as string,
			gasPrice: networkCredentials.gasPrice as string,
			prefix: networkCredentials.prefix as string,
		});

		const agentClient = createAgentClient({
			agentverseApiKey: apiCredentials?.agentverseApiKey,
		});

		const deltavClient = createDeltaVClient({
			apiKey: apiCredentials?.deltavApiKey,
		});

		const agentverseClient = createAgentverseClient({
			apiKey: apiCredentials?.agentverseApiKey,
		});

		const almanacClient = await createAlmanacClient({
			network: networkCredentials.network as string,
			mnemonic: networkCredentials.mnemonic as string,
			restEndpoint: networkCredentials.restEndpoint as string,
			rpcEndpoint: networkCredentials.rpcEndpoint as string,
		});

		try {
			for (let i = 0; i < items.length; i++) {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let result: unknown;

				// ============ ACCOUNT OPERATIONS ============
				if (resource === 'account') {
					if (operation === 'getBalance') {
						const address = this.getNodeParameter('address', i) as string;
						const balance = await cosmosClient.getBalance(address);
						result = {
							address,
							balance: afetToFet(balance.amount),
							balanceRaw: balance.amount,
							denom: 'FET',
							formatted: formatFet(balance.amount),
						};
					} else if (operation === 'getAllBalances') {
						const address = this.getNodeParameter('address', i) as string;
						const balances = await cosmosClient.getAllBalances(address);
						result = {
							address,
							balances: balances.map(b => ({
								denom: b.denom,
								amount: b.amount,
							})),
						};
					} else if (operation === 'getAccountInfo') {
						const address = this.getNodeParameter('address', i) as string;
						const info = await cosmosClient.getAccountInfo(address);
						result = info;
					} else if (operation === 'transfer') {
						const recipientAddress = this.getNodeParameter('recipientAddress', i) as string;
						const amount = this.getNodeParameter('amount', i) as string;
						const options = this.getNodeParameter('options', i) as { memo?: string };
						
						const coin = createFetCoin(amount);
						const txResult = await cosmosClient.sendTokens(
							recipientAddress,
							[coin],
							options.memo || 'Sent via n8n-nodes-fetchai'
						);
						result = {
							success: txResult.code === 0,
							txHash: txResult.txHash,
							height: txResult.height,
							gasUsed: txResult.gasUsed,
						};
					} else if (operation === 'validateAddress') {
						const address = this.getNodeParameter('address', i) as string;
						const isValid = validateFetchAddress(address);
						result = {
							address,
							valid: isValid,
							shortened: isValid ? shortenAddress(address) : null,
						};
					}
				}

				// ============ AGENT OPERATIONS ============
				else if (resource === 'agent') {
					if (operation === 'getAgentInfo') {
						const agentAddress = this.getNodeParameter('agentAddress', i) as string;
						result = await agentClient.getAgentInfo(agentAddress);
					} else if (operation === 'getAgentByName') {
						const name = this.getNodeParameter('name', i) as string;
						result = await agentClient.getAgentByName(name);
					} else if (operation === 'searchAgents') {
						const query = this.getNodeParameter('searchQuery', i) as string;
						const options = this.getNodeParameter('options', i) as { limit?: number };
						result = await agentClient.searchAgents(query, options.limit || 10);
					} else if (operation === 'getAgentProtocols') {
						const agentAddress = this.getNodeParameter('agentAddress', i) as string;
						result = await agentClient.getAgentProtocols(agentAddress);
					} else if (operation === 'getAgentEndpoints') {
						const agentAddress = this.getNodeParameter('agentAddress', i) as string;
						result = await agentClient.getAgentEndpoints(agentAddress);
					} else if (operation === 'verifyAgent') {
						const agentAddress = this.getNodeParameter('agentAddress', i) as string;
						result = await agentClient.verifyAgent(agentAddress);
					}
				}

				// ============ ALMANAC OPERATIONS ============
				else if (resource === 'almanac') {
					if (operation === 'getEntry') {
						const agentAddress = this.getNodeParameter('agentAddress', i) as string;
						result = await almanacClient.getAgentRecord(agentAddress);
					} else if (operation === 'getAgentsByProtocol') {
						const protocolDigest = this.getNodeParameter('protocolDigest', i) as string;
						result = await almanacClient.getAgentsByProtocol(protocolDigest);
					} else if (operation === 'getExpiryInfo') {
						const agentAddress = this.getNodeParameter('agentAddress', i) as string;
						const expiry = await almanacClient.getExpiryTime(agentAddress);
						const isExpiring = await almanacClient.isExpiringSoon(agentAddress);
						result = {
							agentAddress,
							expiryTimestamp: expiry,
							expiryDate: expiry ? new Date(expiry * 1000).toISOString() : null,
							isExpiringSoon: isExpiring,
						};
					} else if (operation === 'getRegistrationCost') {
						result = await almanacClient.getRegistrationCost();
					} else if (operation === 'queryAlmanac') {
						const queryMessage = this.getNodeParameter('queryMessage', i) as string;
						const query = JSON.parse(queryMessage);
						result = await cosmosClient.queryContract(
							almanacClient['almanacAddress'],
							query
						);
					}
				}

				// ============ DELTAV OPERATIONS ============
				else if (resource === 'deltav') {
					if (operation === 'submitTask') {
						const objective = this.getNodeParameter('objective', i) as string;
						result = await deltavClient.submitTask({ objective });
					} else if (operation === 'getTaskStatus') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						result = await deltavClient.getTaskStatus(taskId);
					} else if (operation === 'getTaskResults') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						result = await deltavClient.getTaskResults(taskId);
					} else if (operation === 'getAvailableServices') {
						result = await deltavClient.getAvailableServices();
					} else if (operation === 'searchFunctions') {
						const query = this.getNodeParameter('searchQuery', i) as string;
						result = await deltavClient.searchFunctions(query);
					} else if (operation === 'getFunctionInfo') {
						const functionId = this.getNodeParameter('functionId', i) as string;
						result = await deltavClient.getFunctionInfo(functionId);
					} else if (operation === 'getPopularFunctions') {
						const options = this.getNodeParameter('options', i) as { limit?: number };
						result = await deltavClient.getPopularFunctions(options.limit || 10);
					} else if (operation === 'getCreditsBalance') {
						result = await deltavClient.getCreditsBalance();
					} else if (operation === 'getRecommendations') {
						const query = this.getNodeParameter('searchQuery', i) as string;
						result = await deltavClient.getRecommendations(query);
					}
				}

				// ============ AGENTVERSE OPERATIONS ============
				else if (resource === 'agentverse') {
					if (operation === 'getHostedAgents') {
						result = await agentverseClient.getHostedAgents();
					} else if (operation === 'getAgentverseAgent') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						result = await agentverseClient.getAgent(agentId);
					} else if (operation === 'getAgentStatus') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						result = { status: await agentverseClient.getAgentStatus(agentId) };
					} else if (operation === 'startAgent') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const success = await agentverseClient.startAgent(agentId);
						result = { success };
					} else if (operation === 'stopAgent') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const success = await agentverseClient.stopAgent(agentId);
						result = { success };
					} else if (operation === 'getAgentLogs') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const options = this.getNodeParameter('options', i) as { limit?: number };
						result = await agentverseClient.getAgentLogs(agentId, { limit: options.limit });
					} else if (operation === 'deployAgent') {
						const agentName = this.getNodeParameter('agentName', i) as string;
						const agentCode = this.getNodeParameter('agentCode', i) as string;
						result = await agentverseClient.deployAgent({
							name: agentName,
							code: agentCode,
						});
					} else if (operation === 'updateAgentCode') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const agentCode = this.getNodeParameter('agentCode', i) as string;
						result = await agentverseClient.updateAgentCode(agentId, agentCode);
					} else if (operation === 'getUsageStats') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						result = await agentverseClient.getUsageStats(agentId);
					}
				}

				// ============ MESSAGING OPERATIONS ============
				else if (resource === 'messaging') {
					if (operation === 'sendMessage') {
						const targetAgent = this.getNodeParameter('targetAgent', i) as string;
						const payload = JSON.parse(this.getNodeParameter('messagePayload', i) as string);
						const schemaDigest = this.getNodeParameter('schemaDigest', i) as string;
						const senderAddress = cosmosClient.getAddress() || '';
						
						result = await agentClient.sendMessage(
							senderAddress,
							targetAgent,
							payload,
							schemaDigest
						);
					} else if (operation === 'getMailboxMessages') {
						const agentAddress = this.getNodeParameter('agentAddress', i) as string;
						result = await agentClient.getMailboxMessages(agentAddress);
					} else if (operation === 'createEnvelope') {
						const targetAgent = this.getNodeParameter('targetAgent', i) as string;
						const payload = JSON.parse(this.getNodeParameter('messagePayload', i) as string);
						const schemaDigest = this.getNodeParameter('schemaDigest', i) as string;
						const senderAddress = cosmosClient.getAddress() || '';
						
						result = createEnvelope(senderAddress, targetAgent, payload, schemaDigest);
					}
				}

				// ============ CONTRACT OPERATIONS ============
				else if (resource === 'contract') {
					if (operation === 'queryContract') {
						const contractAddress = this.getNodeParameter('contractAddress', i) as string;
						const queryMessage = JSON.parse(this.getNodeParameter('queryMessage', i) as string);
						result = await cosmosClient.queryContract(contractAddress, queryMessage);
					} else if (operation === 'executeContract') {
						const contractAddress = this.getNodeParameter('contractAddress', i) as string;
						const executeMessage = JSON.parse(this.getNodeParameter('executeMessage', i) as string);
						const options = this.getNodeParameter('options', i) as { memo?: string };
						result = await cosmosClient.executeContract(
							contractAddress,
							executeMessage,
							[],
							options.memo
						);
					} else if (operation === 'getContractInfo') {
						const contractAddress = this.getNodeParameter('contractAddress', i) as string;
						result = await cosmosClient.getContractInfo(contractAddress);
					}
				}

				// ============ STAKING OPERATIONS ============
				else if (resource === 'staking') {
					if (operation === 'delegate') {
						const validatorAddress = this.getNodeParameter('validatorAddress', i) as string;
						const amount = this.getNodeParameter('amount', i) as string;
						const options = this.getNodeParameter('options', i) as { memo?: string };
						
						const coin = createFetCoin(amount);
						result = await cosmosClient.delegate(validatorAddress, coin, options.memo);
					} else if (operation === 'undelegate') {
						const validatorAddress = this.getNodeParameter('validatorAddress', i) as string;
						const amount = this.getNodeParameter('amount', i) as string;
						const options = this.getNodeParameter('options', i) as { memo?: string };
						
						const coin = createFetCoin(amount);
						result = await cosmosClient.undelegate(validatorAddress, coin, options.memo);
					}
				}

				// ============ NAME SERVICE OPERATIONS ============
				else if (resource === 'nameService') {
					if (operation === 'resolveName') {
						const name = this.getNodeParameter('name', i) as string;
						const address = await almanacClient.resolveName(name);
						result = { name, address };
					} else if (operation === 'getNameInfo') {
						const name = this.getNodeParameter('name', i) as string;
						result = await almanacClient.getNameInfo(name);
					} else if (operation === 'getNamesByOwner') {
						const address = this.getNodeParameter('address', i) as string;
						const names = await almanacClient.getNamesByOwner(address);
						result = { owner: address, names };
					} else if (operation === 'reverseLookup') {
						const address = this.getNodeParameter('address', i) as string;
						const name = await almanacClient.reverseLookup(address);
						result = { address, name };
					} else if (operation === 'registerName') {
						const name = this.getNodeParameter('name', i) as string;
						const address = this.getNodeParameter('address', i) as string;
						result = await almanacClient.registerName(name, address);
					} else if (operation === 'transferName') {
						const name = this.getNodeParameter('name', i) as string;
						const recipientAddress = this.getNodeParameter('recipientAddress', i) as string;
						result = await almanacClient.transferName(name, recipientAddress);
					}
				}

				// ============ UTILITY OPERATIONS ============
				else if (resource === 'utility') {
					if (operation === 'convertUnits') {
						const direction = this.getNodeParameter('conversionDirection', i) as string;
						const value = this.getNodeParameter('conversionValue', i) as string;
						
						if (direction === 'fetToAfet') {
							const afet = fetToAfet(value);
							result = {
								input: value,
								inputUnit: 'FET',
								output: afet,
								outputUnit: 'afet',
							};
						} else {
							const fet = afetToFet(value);
							result = {
								input: value,
								inputUnit: 'afet',
								output: fet,
								outputUnit: 'FET',
								formatted: formatFet(value),
							};
						}
					} else if (operation === 'getChainId') {
						const chainId = await cosmosClient.getChainId();
						result = { chainId };
					} else if (operation === 'getNodeInfo') {
						const config = cosmosClient.getConfig();
						result = {
							network: config.name,
							chainId: config.chainId,
							rpcEndpoint: config.rpcEndpoint,
							restEndpoint: config.restEndpoint,
						};
					}
				}

				// ============ WALLET OPERATIONS ============
				else if (resource === 'wallet') {
					if (operation === 'getWalletInfo') {
						const address = cosmosClient.getAddress();
						if (address) {
							const balance = await cosmosClient.getBalance(address);
							const info = await cosmosClient.getAccountInfo(address);
							result = {
								address,
								balance: afetToFet(balance.amount),
								balanceFormatted: formatFet(balance.amount),
								...info,
							};
						} else {
							result = { error: 'No wallet connected' };
						}
					}
				}

				returnData.push({
					json: result as INodeExecutionData['json'],
					pairedItem: { item: i },
				});
			}
		} finally {
			cosmosClient.disconnect();
			almanacClient.disconnect();
		}

		return [returnData];
	}
}
