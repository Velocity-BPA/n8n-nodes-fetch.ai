/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration Tests for n8n-nodes-fetchai
 * 
 * These tests require a connection to Fetch.ai testnet.
 * Set the following environment variables before running:
 * 
 * - FETCHAI_MNEMONIC: 24-word mnemonic for testnet wallet
 * - FETCHAI_NETWORK: 'testnet' (default) or 'mainnet'
 * 
 * To run integration tests:
 * npm run test:integration
 */

import { CosmosClient } from '../../nodes/Fetchai/transport/cosmosClient';

// Skip integration tests if no credentials provided
const SKIP_INTEGRATION = !process.env.FETCHAI_MNEMONIC;

describe('Integration Tests', () => {
	if (SKIP_INTEGRATION) {
		it.skip('Integration tests skipped - no credentials provided', () => {});
		return;
	}

	describe('CosmosClient', () => {
		let client: CosmosClient;

		beforeAll(async () => {
			client = new CosmosClient({
				network: process.env.FETCHAI_NETWORK || 'testnet',
				mnemonic: process.env.FETCHAI_MNEMONIC,
			});
			await client.connect();
		});

		afterAll(() => {
			client?.disconnect();
		});

		it('should connect to network', async () => {
			const chainId = await client.getChainId();
			expect(chainId).toBeDefined();
		});

		it('should get block height', async () => {
			const height = await client.getBlockHeight();
			expect(height).toBeGreaterThan(0);
		});

		it('should have wallet address', () => {
			const address = client.getAddress();
			expect(address).toBeDefined();
			expect(address).toMatch(/^fetch1/);
		});

		it('should get balance', async () => {
			const address = client.getAddress();
			if (address) {
				const balance = await client.getBalance(address);
				expect(balance).toBeDefined();
				expect(balance.denom).toBe('afet');
			}
		});
	});
});
