import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FetchaiApi implements ICredentialType {
	name = 'fetchaiApi';
	displayName = 'Fetch.ai API';
	documentationUrl = 'https://docs.fetch.ai/concepts/agents/agentverse';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'API key for Fetch.ai Agentverse platform. Obtain from your Agentverse dashboard.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://agentverse.ai/api/v1',
			required: true,
			description: 'Base URL for the Fetch.ai API',
		},
	];
}