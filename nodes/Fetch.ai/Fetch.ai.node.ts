/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-fetchai/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Fetchai implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Fetch.ai',
    name: 'fetchai',
    icon: 'file:fetchai.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Fetch.ai API',
    defaults: {
      name: 'Fetch.ai',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'fetchaiApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Agents',
            value: 'agents',
          },
          {
            name: 'AgentCommunication',
            value: 'agentCommunication',
          },
          {
            name: 'AlmanacServices',
            value: 'almanacServices',
          },
          {
            name: 'DeltaVTasks',
            value: 'deltaVTasks',
          },
          {
            name: 'NetworkNodes',
            value: 'networkNodes',
          },
          {
            name: 'Wallets',
            value: 'wallets',
          }
        ],
        default: 'agents',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['agents'],
    },
  },
  options: [
    {
      name: 'Create Agent',
      value: 'createAgent',
      description: 'Create a new agent with specified behavior and protocols',
      action: 'Create agent',
    },
    {
      name: 'Get Agent',
      value: 'getAgent',
      description: 'Retrieve agent details and current status',
      action: 'Get agent',
    },
    {
      name: 'List Agents',
      value: 'listAgents',
      description: 'Get all agents for the authenticated user',
      action: 'List agents',
    },
    {
      name: 'Update Agent',
      value: 'updateAgent',
      description: 'Update agent configuration or code',
      action: 'Update agent',
    },
    {
      name: 'Delete Agent',
      value: 'deleteAgent',
      description: 'Remove agent from the platform',
      action: 'Delete agent',
    },
    {
      name: 'Deploy Agent',
      value: 'deployAgent',
      description: 'Deploy agent to the network',
      action: 'Deploy agent',
    },
    {
      name: 'Stop Agent',
      value: 'stopAgent',
      description: 'Stop a running agent',
      action: 'Stop agent',
    },
  ],
  default: 'createAgent',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
    },
  },
  options: [
    {
      name: 'Send Message',
      value: 'sendMessage',
      description: 'Send message to an agent',
      action: 'Send message to an agent',
    },
    {
      name: 'Get Messages',
      value: 'getMessages',
      description: 'Retrieve agent message history',
      action: 'Get agent message history',
    },
    {
      name: 'Get Message',
      value: 'getMessage',
      description: 'Get specific message details',
      action: 'Get specific message details',
    },
    {
      name: 'Register Protocol',
      value: 'registerProtocol',
      description: 'Register communication protocol for agent',
      action: 'Register communication protocol for agent',
    },
    {
      name: 'Get Protocols',
      value: 'getProtocols',
      description: 'List agent\'s registered protocols',
      action: 'Get agent protocols',
    },
  ],
  default: 'sendMessage',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
    },
  },
  options: [
    {
      name: 'Register Service',
      value: 'registerService',
      description: 'Register a new service in the Almanac',
      action: 'Register service',
    },
    {
      name: 'Get Service',
      value: 'getService',
      description: 'Retrieve service details',
      action: 'Get service',
    },
    {
      name: 'Search Services',
      value: 'searchServices',
      description: 'Search for services by criteria',
      action: 'Search services',
    },
    {
      name: 'Update Service',
      value: 'updateService',
      description: 'Update service information',
      action: 'Update service',
    },
    {
      name: 'Unregister Service',
      value: 'unregisterService',
      description: 'Remove service from Almanac',
      action: 'Unregister service',
    },
    {
      name: 'Get Service Reputation',
      value: 'getServiceReputation',
      description: 'Get service reputation score',
      action: 'Get service reputation',
    },
  ],
  default: 'registerService',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
    },
  },
  options: [
    {
      name: 'Create Task',
      value: 'createTask',
      description: 'Create a new task for AI agent execution',
      action: 'Create a new task',
    },
    {
      name: 'Get Task',
      value: 'getTask',
      description: 'Retrieve task details and status',
      action: 'Get task details',
    },
    {
      name: 'List Tasks',
      value: 'listTasks',
      description: "Get user's tasks",
      action: 'List user tasks',
    },
    {
      name: 'Update Task',
      value: 'updateTask',
      description: 'Modify task parameters',
      action: 'Update task parameters',
    },
    {
      name: 'Cancel Task',
      value: 'cancelTask',
      description: 'Cancel a pending or running task',
      action: 'Cancel a task',
    },
    {
      name: 'Accept Task Proposal',
      value: 'acceptTaskProposal',
      description: "Accept an agent's task proposal",
      action: 'Accept task proposal',
    },
  ],
  default: 'createTask',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['networkNodes'],
    },
  },
  options: [
    {
      name: 'Get Network Nodes',
      value: 'getNetworkNodes',
      description: 'List active network nodes',
      action: 'Get network nodes',
    },
    {
      name: 'Get Node Info',
      value: 'getNodeInfo',
      description: 'Get detailed node information',
      action: 'Get node info',
    },
    {
      name: 'Get Network Stats',
      value: 'getNetworkStats',
      description: 'Retrieve network statistics and health metrics',
      action: 'Get network stats',
    },
    {
      name: 'Get Validators',
      value: 'getValidators',
      description: 'List network validators',
      action: 'Get validators',
    },
    {
      name: 'Get Recent Blocks',
      value: 'getRecentBlocks',
      description: 'Get recent blockchain blocks',
      action: 'Get recent blocks',
    },
  ],
  default: 'getNetworkNodes',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
    },
  },
  options: [
    {
      name: 'Get Wallet',
      value: 'getWallet',
      description: 'Get wallet balance and information',
      action: 'Get wallet information',
    },
    {
      name: 'Get Transactions',
      value: 'getTransactions',
      description: 'Retrieve wallet transaction history',
      action: 'Get wallet transactions',
    },
    {
      name: 'Create Transfer',
      value: 'createTransfer',
      description: 'Initiate FET token transfer',
      action: 'Create token transfer',
    },
    {
      name: 'Get Stakes',
      value: 'getStakes',
      description: 'Get staking information for wallet',
      action: 'Get wallet stakes',
    },
    {
      name: 'Stake Tokens',
      value: 'stakeTokens',
      description: 'Stake FET tokens',
      action: 'Stake tokens',
    },
  ],
  default: 'getWallet',
},
      // Parameter definitions
{
  displayName: 'Agent Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['createAgent'],
    },
  },
  default: '',
  description: 'The name of the agent',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['createAgent'],
    },
  },
  default: '',
  description: 'Description of the agent',
},
{
  displayName: 'Code',
  name: 'code',
  type: 'string',
  typeOptions: {
    editor: 'code',
    editorLanguage: 'python',
  },
  required: true,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['createAgent'],
    },
  },
  default: '',
  description: 'Python code for the agent behavior',
},
{
  displayName: 'Protocols',
  name: 'protocols',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['createAgent'],
    },
  },
  default: '',
  description: 'Comma-separated list of protocols the agent supports',
},
{
  displayName: 'Agent ID',
  name: 'agentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['getAgent', 'updateAgent', 'deleteAgent', 'deployAgent', 'stopAgent'],
    },
  },
  default: '',
  description: 'The ID of the agent',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['listAgents'],
    },
  },
  default: 10,
  description: 'Maximum number of agents to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['listAgents'],
    },
  },
  default: 0,
  description: 'Number of agents to skip',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['listAgents'],
    },
  },
  options: [
    {
      name: 'All',
      value: '',
    },
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Inactive',
      value: 'inactive',
    },
    {
      name: 'Deployed',
      value: 'deployed',
    },
    {
      name: 'Stopped',
      value: 'stopped',
    },
  ],
  default: '',
  description: 'Filter agents by status',
},
{
  displayName: 'Agent Name',
  name: 'name',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['updateAgent'],
    },
  },
  default: '',
  description: 'Updated name of the agent',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['updateAgent'],
    },
  },
  default: '',
  description: 'Updated description of the agent',
},
{
  displayName: 'Code',
  name: 'code',
  type: 'string',
  typeOptions: {
    editor: 'code',
    editorLanguage: 'python',
  },
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['updateAgent'],
    },
  },
  default: '',
  description: 'Updated Python code for the agent behavior',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['agents'],
      operation: ['deployAgent'],
    },
  },
  options: [
    {
      name: 'Testnet',
      value: 'testnet',
    },
    {
      name: 'Mainnet',
      value: 'mainnet',
    },
  ],
  default: 'testnet',
  description: 'Network to deploy the agent to',
},
{
  displayName: 'Agent ID',
  name: 'agentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['sendMessage'],
    },
  },
  default: '',
  description: 'The ID of the agent to send message to',
},
{
  displayName: 'Content',
  name: 'content',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['sendMessage'],
    },
  },
  default: '',
  description: 'The message content to send',
},
{
  displayName: 'Message Type',
  name: 'messageType',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['sendMessage'],
    },
  },
  options: [
    {
      name: 'Text',
      value: 'text',
    },
    {
      name: 'JSON',
      value: 'json',
    },
    {
      name: 'Command',
      value: 'command',
    },
  ],
  default: 'text',
  description: 'The type of message being sent',
},
{
  displayName: 'Agent ID',
  name: 'agentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['getMessages'],
    },
  },
  default: '',
  description: 'The ID of the agent to get messages from',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['getMessages'],
    },
  },
  default: 50,
  description: 'Maximum number of messages to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['getMessages'],
    },
  },
  default: 0,
  description: 'Number of messages to skip',
},
{
  displayName: 'Agent ID',
  name: 'agentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['getMessage'],
    },
  },
  default: '',
  description: 'The ID of the agent',
},
{
  displayName: 'Message ID',
  name: 'messageId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['getMessage'],
    },
  },
  default: '',
  description: 'The ID of the specific message to retrieve',
},
{
  displayName: 'Agent ID',
  name: 'agentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['registerProtocol'],
    },
  },
  default: '',
  description: 'The ID of the agent to register protocol for',
},
{
  displayName: 'Protocol Name',
  name: 'protocolName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['registerProtocol'],
    },
  },
  default: '',
  description: 'The name of the protocol to register',
},
{
  displayName: 'Protocol Specification',
  name: 'protocolSpec',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['registerProtocol'],
    },
  },
  default: '{}',
  description: 'The protocol specification as JSON',
},
{
  displayName: 'Agent ID',
  name: 'agentId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['agentCommunication'],
      operation: ['getProtocols'],
    },
  },
  default: '',
  description: 'The ID of the agent to get protocols for',
},
{
  displayName: 'Service Name',
  name: 'name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
      operation: ['registerService', 'updateService'],
    },
  },
  default: '',
  description: 'The name of the service',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
      operation: ['registerService', 'updateService'],
    },
  },
  default: '',
  description: 'Service description',
},
{
  displayName: 'Endpoints',
  name: 'endpoints',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
      operation: ['registerService', 'updateService'],
    },
  },
  default: '',
  description: 'Service endpoints (comma-separated)',
},
{
  displayName: 'Protocols',
  name: 'protocols',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
      operation: ['registerService'],
    },
  },
  default: '',
  description: 'Supported protocols (comma-separated)',
},
{
  displayName: 'Service ID',
  name: 'serviceId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
      operation: ['getService', 'updateService', 'unregisterService', 'getServiceReputation'],
    },
  },
  default: '',
  description: 'The unique service identifier',
},
{
  displayName: 'Query',
  name: 'query',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
      operation: ['searchServices'],
    },
  },
  default: '',
  description: 'Search query string',
},
{
  displayName: 'Category',
  name: 'category',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
      operation: ['searchServices'],
    },
  },
  default: '',
  description: 'Service category filter',
},
{
  displayName: 'Location',
  name: 'location',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['almanacServices'],
      operation: ['searchServices'],
    },
  },
  default: '',
  description: 'Location filter',
},
{
  displayName: 'Task ID',
  name: 'taskId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['getTask', 'updateTask', 'cancelTask', 'acceptTaskProposal'],
    },
  },
  default: '',
  description: 'The unique identifier of the task',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['createTask'],
    },
  },
  default: '',
  description: 'Task description for AI agent execution',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['updateTask'],
    },
  },
  default: '',
  description: 'Updated task description',
},
{
  displayName: 'Requirements',
  name: 'requirements',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['createTask', 'updateTask'],
    },
  },
  default: '',
  description: 'Specific requirements for the task execution',
},
{
  displayName: 'Budget',
  name: 'budget',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['createTask', 'updateTask'],
    },
  },
  default: 0,
  description: 'Budget allocated for the task execution',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['listTasks'],
    },
  },
  options: [
    {
      name: 'All',
      value: '',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
    {
      name: 'Running',
      value: 'running',
    },
    {
      name: 'Completed',
      value: 'completed',
    },
    {
      name: 'Failed',
      value: 'failed',
    },
    {
      name: 'Cancelled',
      value: 'cancelled',
    },
  ],
  default: '',
  description: 'Filter tasks by status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['listTasks'],
    },
  },
  default: 50,
  description: 'Maximum number of tasks to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['listTasks'],
    },
  },
  default: 0,
  description: 'Number of tasks to skip for pagination',
},
{
  displayName: 'Proposal ID',
  name: 'proposalId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deltaVTasks'],
      operation: ['acceptTaskProposal'],
    },
  },
  default: '',
  description: 'The unique identifier of the agent proposal to accept',
},
{
  displayName: 'Node Type',
  name: 'nodeType',
  type: 'options',
  options: [
    { name: 'All', value: 'all' },
    { name: 'Validator', value: 'validator' },
    { name: 'RPC', value: 'rpc' },
    { name: 'Seed', value: 'seed' },
  ],
  displayOptions: {
    show: {
      resource: ['networkNodes'],
      operation: ['getNetworkNodes'],
    },
  },
  default: 'all',
  description: 'Filter by node type',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: [
    { name: 'All', value: 'all' },
    { name: 'Active', value: 'active' },
    { name: 'Inactive', value: 'inactive' },
    { name: 'Syncing', value: 'syncing' },
  ],
  displayOptions: {
    show: {
      resource: ['networkNodes'],
      operation: ['getNetworkNodes'],
    },
  },
  default: 'all',
  description: 'Filter by node status',
},
{
  displayName: 'Location',
  name: 'location',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['networkNodes'],
      operation: ['getNetworkNodes'],
    },
  },
  default: '',
  description: 'Filter by geographic location',
},
{
  displayName: 'Node ID',
  name: 'nodeId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['networkNodes'],
      operation: ['getNodeInfo'],
    },
  },
  default: '',
  description: 'The unique identifier of the node',
},
{
  displayName: 'Timeframe',
  name: 'timeframe',
  type: 'options',
  options: [
    { name: '1 Hour', value: '1h' },
    { name: '24 Hours', value: '24h' },
    { name: '7 Days', value: '7d' },
    { name: '30 Days', value: '30d' },
  ],
  displayOptions: {
    show: {
      resource: ['networkNodes'],
      operation: ['getNetworkStats'],
    },
  },
  default: '24h',
  description: 'Timeframe for statistics',
},
{
  displayName: 'Active Only',
  name: 'active',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['networkNodes'],
      operation: ['getValidators'],
    },
  },
  default: true,
  description: 'Whether to show only active validators',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['networkNodes'],
      operation: ['getValidators', 'getRecentBlocks'],
    },
  },
  default: 50,
  description: 'Maximum number of items to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['networkNodes'],
      operation: ['getRecentBlocks'],
    },
  },
  default: 0,
  description: 'Number of items to skip',
},
{
  displayName: 'Wallet Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['getWallet'],
    },
  },
  default: '',
  description: 'The wallet address to get information for',
},
{
  displayName: 'Wallet Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['getTransactions'],
    },
  },
  default: '',
  description: 'The wallet address to get transactions for',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['getTransactions'],
    },
  },
  default: 50,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['getTransactions'],
    },
  },
  default: 0,
  description: 'Number of transactions to skip',
},
{
  displayName: 'From Address',
  name: 'fromAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['createTransfer'],
    },
  },
  default: '',
  description: 'The sender wallet address',
},
{
  displayName: 'To Address',
  name: 'toAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['createTransfer'],
    },
  },
  default: '',
  description: 'The recipient wallet address',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['createTransfer'],
    },
  },
  default: '',
  description: 'Amount of FET tokens to transfer',
},
{
  displayName: 'Memo',
  name: 'memo',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['createTransfer'],
    },
  },
  default: '',
  description: 'Optional memo for the transaction',
},
{
  displayName: 'Wallet Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['getStakes'],
    },
  },
  default: '',
  description: 'The wallet address to get staking information for',
},
{
  displayName: 'Wallet Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['stakeTokens'],
    },
  },
  default: '',
  description: 'The wallet address to stake from',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['stakeTokens'],
    },
  },
  default: '',
  description: 'Amount of FET tokens to stake',
},
{
  displayName: 'Validator',
  name: 'validator',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallets'],
      operation: ['stakeTokens'],
    },
  },
  default: '',
  description: 'The validator address to stake to',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'agents':
        return [await executeAgentsOperations.call(this, items)];
      case 'agentCommunication':
        return [await executeAgentCommunicationOperations.call(this, items)];
      case 'almanacServices':
        return [await executeAlmanacServicesOperations.call(this, items)];
      case 'deltaVTasks':
        return [await executeDeltaVTasksOperations.call(this, items)];
      case 'networkNodes':
        return [await executeNetworkNodesOperations.call(this, items)];
      case 'wallets':
        return [await executeWalletsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAgentsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fetchaiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createAgent': {
          const name = this.getNodeParameter('name', i) as string;
          const description = this.getNodeParameter('description', i) as string;
          const code = this.getNodeParameter('code', i) as string;
          const protocols = this.getNodeParameter('protocols', i) as string;

          const body: any = {
            name,
            code,
          };

          if (description) {
            body.description = description;
          }

          if (protocols) {
            body.protocols = protocols.split(',').map((p: string) => p.trim());
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/agents`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAgent': {
          const agentId = this.getNodeParameter('agentId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/agents/${agentId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listAgents': {
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const status = this.getNodeParameter('status', i) as string;

          const queryParams: string[] = [];
          if (limit) queryParams.push(`limit=${limit}`);
          if (offset) queryParams.push(`offset=${offset}`);
          if (status) queryParams.push(`status=${status}`);

          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/agents${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateAgent': {
          const agentId = this.getNodeParameter('agentId', i) as string;
          const name = this.getNodeParameter('name', i) as string;
          const description = this.getNodeParameter('description', i) as string;
          const code = this.getNodeParameter('code', i) as string;

          const body: any = {};
          if (name) body.name = name;
          if (description) body.description = description;
          if (code) body.code = code;

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/agents/${agentId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteAgent': {
          const agentId = this.getNodeParameter('agentId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/agents/${agentId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deployAgent': {
          const agentId = this.getNodeParameter('agentId', i) as string;
          const network = this.getNodeParameter('network', i) as string;

          const body: any = {};
          if (network) body.network = network;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/agents/${agentId}/deploy`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'stopAgent': {
          const agentId = this.getNodeParameter('agentId', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/agents/${agentId}/stop`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {},
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeAgentCommunicationOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fetchaiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'sendMessage': {
          const agentId = this.getNodeParameter('agentId', i) as string;
          const content = this.getNodeParameter('content', i) as string;
          const messageType = this.getNodeParameter('messageType', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/agents/${agentId}/messages`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              content,
              messageType,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMessages': {
          const agentId = this.getNodeParameter('agentId', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/agents/${agentId}/messages`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs: {
              limit,
              offset,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getMessage': {
          const agentId = this.getNodeParameter('agentId', i) as string;
          const messageId = this.getNodeParameter('messageId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/agents/${agentId}/messages/${messageId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'registerProtocol': {
          const agentId = this.getNodeParameter('agentId', i) as string;
          const protocolName = this.getNodeParameter('protocolName', i) as string;
          const protocolSpec = this.getNodeParameter('protocolSpec', i) as any;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/agents/${agentId}/protocols`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              protocolName,
              protocolSpec: typeof protocolSpec === 'string' ? JSON.parse(protocolSpec) : protocolSpec,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getProtocols': {
          const agentId = this.getNodeParameter('agentId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/agents/${agentId}/protocols`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeAlmanacServicesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fetchaiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'registerService': {
          const name = this.getNodeParameter('name', i) as string;
          const description = this.getNodeParameter('description', i) as string;
          const endpoints = this.getNodeParameter('endpoints', i) as string;
          const protocols = this.getNodeParameter('protocols', i) as string;

          const body: any = {
            name,
            description,
            endpoints: endpoints.split(',').map((endpoint: string) => endpoint.trim()),
            protocols: protocols.split(',').map((protocol: string) => protocol.trim()),
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/almanac/services`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getService': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/almanac/services/${serviceId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'searchServices': {
          const query = this.getNodeParameter('query', i) as string;
          const category = this.getNodeParameter('category', i) as string;
          const location = this.getNodeParameter('location', i) as string;

          const searchParams = new URLSearchParams();
          if (query) searchParams.append('query', query);
          if (category) searchParams.append('category', category);
          if (location) searchParams.append('location', location);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/almanac/services?${searchParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateService': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;
          const name = this.getNodeParameter('name', i) as string;
          const description = this.getNodeParameter('description', i) as string;
          const endpoints = this.getNodeParameter('endpoints', i) as string;

          const body: any = {
            name,
            description,
            endpoints: endpoints.split(',').map((endpoint: string) => endpoint.trim()),
          };

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/almanac/services/${serviceId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'unregisterService': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/almanac/services/${serviceId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getServiceReputation': {
          const serviceId = this.getNodeParameter('serviceId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/almanac/services/${serviceId}/reputation`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeDeltaVTasksOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fetchaiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createTask': {
          const description = this.getNodeParameter('description', i) as string;
          const requirements = this.getNodeParameter('requirements', i) as string;
          const budget = this.getNodeParameter('budget', i) as number;

          const body: any = {
            description,
          };

          if (requirements) {
            body.requirements = requirements;
          }
          if (budget > 0) {
            body.budget = budget;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/deltav/tasks`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTask': {
          const taskId = this.getNodeParameter('taskId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/deltav/tasks/${taskId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listTasks': {
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams: any = {};
          
          if (status) {
            queryParams.status = status;
          }
          if (limit) {
            queryParams.limit = limit.toString();
          }
          if (offset) {
            queryParams.offset = offset.toString();
          }

          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString() 
            : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/deltav/tasks${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateTask': {
          const taskId = this.getNodeParameter('taskId', i) as string;
          const description = this.getNodeParameter('description', i) as string;
          const requirements = this.getNodeParameter('requirements', i) as string;
          const budget = this.getNodeParameter('budget', i) as number;

          const body: any = {};

          if (description) {
            body.description = description;
          }
          if (requirements) {
            body.requirements = requirements;
          }
          if (budget > 0) {
            body.budget = budget;
          }

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/deltav/tasks/${taskId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'cancelTask': {
          const taskId = this.getNodeParameter('taskId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/deltav/tasks/${taskId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'acceptTaskProposal': {
          const taskId = this.getNodeParameter('taskId', i) as string;
          const proposalId = this.getNodeParameter('proposalId', i) as string;

          const body: any = {
            proposalId,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/deltav/tasks/${taskId}/accept`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        if (error.cause && error.cause.response) {
          const statusCode = error.cause.response.statusCode;
          const message = error.cause.response.body?.message || error.message;
          throw new NodeApiError(this.getNode(), { message, status: statusCode });
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeNetworkNodesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fetchaiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getNetworkNodes': {
          const nodeType = this.getNodeParameter('nodeType', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const location = this.getNodeParameter('location', i) as string;
          
          const queryParams: string[] = [];
          if (nodeType && nodeType !== 'all') queryParams.push(`nodeType=${encodeURIComponent(nodeType)}`);
          if (status && status !== 'all') queryParams.push(`status=${encodeURIComponent(status)}`);
          if (location) queryParams.push(`location=${encodeURIComponent(location)}`);
          
          const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/network/nodes${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getNodeInfo': {
          const nodeId = this.getNodeParameter('nodeId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/network/nodes/${encodeURIComponent(nodeId)}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getNetworkStats': {
          const timeframe = this.getNodeParameter('timeframe', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/network/stats?timeframe=${encodeURIComponent(timeframe)}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getValidators': {
          const active = this.getNodeParameter('active', i) as boolean;
          const limit = this.getNodeParameter('limit', i) as number;
          
          const queryParams: string[] = [];
          if (typeof active === 'boolean') queryParams.push(`active=${active}`);
          if (limit) queryParams.push(`limit=${limit}`);
          
          const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/network/validators${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getRecentBlocks': {
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          
          const queryParams: string[] = [];
          if (limit) queryParams.push(`limit=${limit}`);
          if (offset) queryParams.push(`offset=${offset}`);
          
          const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/network/blocks${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }
  
  return returnData;
}

async function executeWalletsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('fetchaiApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getWallet': {
          const address = this.getNodeParameter('address', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/wallets/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const limit = this.getNodeParameter('limit', i, 50) as number;
          const offset = this.getNodeParameter('offset', i, 0) as number;

          const queryParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/wallets/${address}/transactions?${queryParams}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createTransfer': {
          const fromAddress = this.getNodeParameter('fromAddress', i) as string;
          const toAddress = this.getNodeParameter('toAddress', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const memo = this.getNodeParameter('memo', i, '') as string;

          const body: any = {
            fromAddress,
            toAddress,
            amount,
          };

          if (memo) {
            body.memo = memo;
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/wallets/transfer`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getStakes': {
          const address = this.getNodeParameter('address', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/wallets/${address}/stakes`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'stakeTokens': {
          const address = this.getNodeParameter('address', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const validator = this.getNodeParameter('validator', i) as string;

          const body: any = {
            amount,
            validator,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/wallets/${address}/stake`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
            itemIndex: i,
          });
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        }
        throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
      }
    }
  }

  return returnData;
}
