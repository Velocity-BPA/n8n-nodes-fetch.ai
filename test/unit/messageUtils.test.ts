/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	createSessionId,
	createNonce,
	calculateExpiry,
	isExpired,
	computeSchemaDigest,
	createEnvelope,
	serializeEnvelope,
	deserializeEnvelope,
	validateEnvelope,
} from '../../nodes/Fetchai/utils/messageUtils';

describe('messageUtils', () => {
	describe('createSessionId', () => {
		it('should create unique session IDs', () => {
			const id1 = createSessionId();
			const id2 = createSessionId();
			expect(id1).not.toBe(id2);
		});

		it('should return a valid UUID format', () => {
			const id = createSessionId();
			expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
		});
	});

	describe('createNonce', () => {
		it('should create unique nonces', () => {
			const nonce1 = createNonce();
			const nonce2 = createNonce();
			expect(nonce1).not.toBe(nonce2);
		});

		it('should return a hex string', () => {
			const nonce = createNonce();
			expect(nonce).toMatch(/^[0-9a-f]+$/i);
		});
	});

	describe('calculateExpiry', () => {
		it('should calculate future expiry', () => {
			const expiry = calculateExpiry(3600);
			const now = Math.floor(Date.now() / 1000);
			expect(expiry).toBeGreaterThan(now);
			expect(expiry).toBeLessThanOrEqual(now + 3600 + 1);
		});

		it('should use default TTL when not specified', () => {
			const expiry = calculateExpiry();
			const now = Math.floor(Date.now() / 1000);
			expect(expiry).toBeGreaterThan(now);
		});
	});

	describe('isExpired', () => {
		it('should return true for past timestamps', () => {
			const pastTimestamp = Math.floor(Date.now() / 1000) - 3600;
			expect(isExpired(pastTimestamp)).toBe(true);
		});

		it('should return false for future timestamps', () => {
			const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
			expect(isExpired(futureTimestamp)).toBe(false);
		});
	});

	describe('computeSchemaDigest', () => {
		it('should compute consistent digest for same model', () => {
			const model = { name: 'test', type: 'string' };
			const digest1 = computeSchemaDigest(model);
			const digest2 = computeSchemaDigest(model);
			expect(digest1).toBe(digest2);
		});

		it('should return model: prefix', () => {
			const model = { test: 'value' };
			const digest = computeSchemaDigest(model);
			expect(digest).toMatch(/^model:/);
		});
	});

	describe('createEnvelope', () => {
		it('should create valid envelope', () => {
			const envelope = createEnvelope(
				'agent1qsender',
				'agent1qtarget',
				{ message: 'test' },
				'model:test123'
			);

			expect(envelope.sender).toBe('agent1qsender');
			expect(envelope.target).toBe('agent1qtarget');
			expect(envelope.payload).toEqual({ message: 'test' });
			expect(envelope.schemaDigest).toBe('model:test123');
			expect(envelope.session).toBeDefined();
		});
	});

	describe('serializeEnvelope', () => {
		it('should serialize envelope to JSON string', () => {
			const envelope = createEnvelope(
				'agent1qsender',
				'agent1qtarget',
				{ test: 'data' },
				'model:test'
			);
			const serialized = serializeEnvelope(envelope);
			expect(typeof serialized).toBe('string');
			expect(() => JSON.parse(serialized)).not.toThrow();
		});
	});

	describe('deserializeEnvelope', () => {
		it('should deserialize JSON to envelope', () => {
			const original = createEnvelope(
				'agent1qsender',
				'agent1qtarget',
				{ test: 'data' },
				'model:test'
			);
			const serialized = serializeEnvelope(original);
			const deserialized = deserializeEnvelope(serialized);
			expect(deserialized.sender).toBe(original.sender);
			expect(deserialized.target).toBe(original.target);
		});
	});

	describe('validateEnvelope', () => {
		it('should validate correct envelope', () => {
			const envelope = createEnvelope(
				'agent1qsender',
				'agent1qtarget',
				{ test: 'data' },
				'model:test'
			);
			const result = validateEnvelope(envelope);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});
	});
});
