/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	validateFetchAddress,
	validateAgentAddress,
	shortenAddress,
	isSameAddress,
} from '../../nodes/Fetchai/utils/addressUtils';

describe('addressUtils', () => {
	describe('validateFetchAddress', () => {
		it('should validate correct fetch addresses', () => {
			expect(validateFetchAddress('fetch1abcdefghijklmnopqrstuvwxyz123456')).toBe(true);
		});

		it('should reject invalid addresses', () => {
			expect(validateFetchAddress('invalid')).toBe(false);
			expect(validateFetchAddress('')).toBe(false);
			expect(validateFetchAddress('cosmos1abc')).toBe(false);
		});

		it('should validate addresses with custom prefix', () => {
			expect(validateFetchAddress('fetchvaloper1abc123', 'fetchvaloper')).toBe(true);
		});
	});

	describe('validateAgentAddress', () => {
		it('should validate correct agent addresses', () => {
			expect(validateAgentAddress('agent1qabcdefghijklmnopqrstuvwxyz123456')).toBe(true);
		});

		it('should reject invalid agent addresses', () => {
			expect(validateAgentAddress('invalid')).toBe(false);
			expect(validateAgentAddress('fetch1abc')).toBe(false);
		});
	});

	describe('shortenAddress', () => {
		it('should shorten addresses correctly', () => {
			const address = 'fetch1abcdefghijklmnopqrstuvwxyz123456';
			const shortened = shortenAddress(address);
			expect(shortened).toMatch(/^fetch1.*\.\.\..*$/);
		});

		it('should handle custom lengths', () => {
			const address = 'fetch1abcdefghijklmnopqrstuvwxyz123456';
			const shortened = shortenAddress(address, 10, 10);
			expect(shortened.length).toBeLessThan(address.length);
		});

		it('should return original if shorter than combined lengths', () => {
			const address = 'fetch1abc';
			expect(shortenAddress(address, 6, 6)).toBe(address);
		});
	});

	describe('isSameAddress', () => {
		it('should return true for same addresses', () => {
			const addr = 'fetch1abcdefghijklmnopqrstuvwxyz123456';
			expect(isSameAddress(addr, addr)).toBe(true);
		});

		it('should be case insensitive', () => {
			expect(isSameAddress('FETCH1ABC', 'fetch1abc')).toBe(true);
		});

		it('should return false for different addresses', () => {
			expect(isSameAddress('fetch1abc', 'fetch1xyz')).toBe(false);
		});
	});
});
