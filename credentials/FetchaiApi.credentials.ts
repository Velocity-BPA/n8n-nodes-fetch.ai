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
 * Fetch.ai API Credentials
 * 
 * Provides authentication for Fetch.ai cloud services:
 * - Agentverse (hosted agent platform)
 * - DeltaV (AI engine for agent discovery and task execution)
 * - Agent communication APIs
 * 
 * These credentials are separate from blockchain network access
 * and are used for Fetch.ai's managed services.
 */
export class FetchaiApi implements ICredentialType {
	name = 'fetchaiApi';
	displayName = 'Fetch.ai API';
	documentationUrl = 'https://fetch.ai/docs/apis';
	properties: INodeProperties[] = [
		{
			displayName: 'API Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Staging',
					value: 'staging',
				},
			],
			default: 'production',
			description: 'Select the API environment',
		},
		{
			displayName: 'Agentverse API Key',
			name: 'agentverseApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for Agentverse hosted agent platform',
		},
		{
			displayName: 'DeltaV API Key',
			name: 'deltavApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for DeltaV AI engine',
		},
		{
			displayName: 'Agentverse Endpoint',
			name: 'agentverseEndpoint',
			type: 'string',
			default: 'https://agentverse.ai/api',
			description: 'Agentverse API endpoint',
		},
		{
			displayName: 'DeltaV Endpoint',
			name: 'deltavEndpoint',
			type: 'string',
			default: 'https://deltav.agentverse.ai/api',
			description: 'DeltaV AI engine API endpoint',
		},
		{
			displayName: 'Agent Mailbox Endpoint',
			name: 'mailboxEndpoint',
			type: 'string',
			default: 'https://mailbox.agentverse.ai',
			description: 'Agent mailbox service endpoint for async messaging',
		},
		{
			displayName: 'User Email',
			name: 'userEmail',
			type: 'string',
			default: '',
			description: 'Email associated with your Fetch.ai account (optional)',
		},
		{
			displayName: 'Request Timeout (ms)',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'API request timeout in milliseconds',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.agentverseApiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.agentverseEndpoint}}',
			url: '/v1/user/info',
			method: 'GET',
		},
	};
}
