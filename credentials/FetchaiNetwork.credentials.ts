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
 * Fetch.ai Network Credentials
 * 
 * Provides connectivity to Fetch.ai blockchain networks including:
 * - Mainnet (fetchhub-4)
 * - Testnet Dorado (dorado-1)
 * - Local development nodes
 * - Custom network endpoints
 * 
 * Credentials include wallet mnemonic for signing transactions
 * and network endpoints for REST/RPC/gRPC connectivity.
 */
export class FetchaiNetwork implements ICredentialType {
	name = 'fetchaiNetwork';
	displayName = 'Fetch.ai Network';
	documentationUrl = 'https://docs.fetch.ai/';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet (fetchhub-4)',
					value: 'mainnet',
				},
				{
					name: 'Testnet Dorado (dorado-1)',
					value: 'testnet',
				},
				{
					name: 'Local Development',
					value: 'local',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'Select the Fetch.ai network to connect to',
		},
		{
			displayName: 'REST Endpoint',
			name: 'restEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://rest-fetchhub.fetch.ai',
			description: 'REST API endpoint for the network. Leave empty for default based on network selection.',
			displayOptions: {
				show: {
					network: ['custom', 'local'],
				},
			},
		},
		{
			displayName: 'RPC Endpoint',
			name: 'rpcEndpoint',
			type: 'string',
			default: '',
			placeholder: 'https://rpc-fetchhub.fetch.ai',
			description: 'RPC endpoint for the network. Leave empty for default based on network selection.',
			displayOptions: {
				show: {
					network: ['custom', 'local'],
				},
			},
		},
		{
			displayName: 'gRPC Endpoint',
			name: 'grpcEndpoint',
			type: 'string',
			default: '',
			placeholder: 'grpc-fetchhub.fetch.ai:443',
			description: 'Optional gRPC endpoint for advanced operations',
		},
		{
			displayName: 'Mnemonic Phrase',
			name: 'mnemonic',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Enter your 24-word mnemonic phrase',
			description: 'Your wallet mnemonic phrase (24 words). Keep this secret!',
		},
		{
			displayName: 'HD Derivation Path',
			name: 'derivationPath',
			type: 'string',
			default: "m/44'/118'/0'/0/0",
			description: 'BIP44 derivation path for wallet. Default is Cosmos SDK path.',
		},
		{
			displayName: 'Address Prefix',
			name: 'prefix',
			type: 'string',
			default: 'fetch',
			description: 'Bech32 address prefix. Default is "fetch" for Fetch.ai.',
		},
		{
			displayName: 'Chain ID',
			name: 'chainId',
			type: 'string',
			default: '',
			placeholder: 'fetchhub-4',
			description: 'Chain ID for the network. Leave empty for default based on network selection.',
			displayOptions: {
				show: {
					network: ['custom', 'local'],
				},
			},
		},
		{
			displayName: 'Gas Price',
			name: 'gasPrice',
			type: 'string',
			default: '5000000000',
			description: 'Default gas price in afet (smallest unit)',
		},
		{
			displayName: 'Gas Adjustment',
			name: 'gasAdjustment',
			type: 'number',
			default: 1.3,
			description: 'Gas estimation multiplier for safety margin',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://rest-fetchhub.fetch.ai" : $credentials.network === "testnet" ? "https://rest-dorado.fetch.ai" : $credentials.restEndpoint}}',
			url: '/cosmos/base/tendermint/v1beta1/node_info',
			method: 'GET',
		},
	};
}
