/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Almanac Registry Credentials
 * 
 * The Almanac is Fetch.ai's decentralized agent registry contract.
 * It stores agent endpoints, protocols, and metadata on-chain.
 * 
 * Agents register in the Almanac to be discoverable by other agents
 * and by the DeltaV AI engine.
 */
export class Almanac implements ICredentialType {
	name = 'almanac';
	displayName = 'Fetch.ai Almanac';
	documentationUrl = 'https://docs.fetch.ai/references/contracts/uagents-almanac/almanac-overview';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet (Dorado)',
					value: 'testnet',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'Select the network for Almanac operations',
		},
		{
			displayName: 'Almanac Contract Address',
			name: 'contractAddress',
			type: 'string',
			default: '',
			placeholder: 'fetch1...',
			description: 'Almanac contract address. Leave empty for default based on network.',
		},
		{
			displayName: 'Name Service Contract Address',
			name: 'nameServiceAddress',
			type: 'string',
			default: '',
			placeholder: 'fetch1...',
			description: 'Name service contract address. Leave empty for default.',
		},
		{
			displayName: 'API Endpoint',
			name: 'apiEndpoint',
			type: 'string',
			default: 'https://almanac-api.fetch.ai',
			description: 'Almanac REST API endpoint for querying agents',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Registration TTL (seconds)',
			name: 'registrationTtl',
			type: 'number',
			default: 86400,
			description: 'Time-to-live for agent registrations in seconds (default: 24 hours)',
		},
		{
			displayName: 'Auto-Renew Registration',
			name: 'autoRenew',
			type: 'boolean',
			default: true,
			description: 'Whether to automatically renew agent registrations before expiry',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://rest-fetchhub.fetch.ai" : $credentials.network === "testnet" ? "https://rest-dorado.fetch.ai" : $credentials.apiEndpoint}}',
			url: '/cosmos/base/tendermint/v1beta1/node_info',
			method: 'GET',
		},
	};
}
