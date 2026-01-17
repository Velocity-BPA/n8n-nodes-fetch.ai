/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	fetToAfet,
	afetToFet,
	formatFet,
	parseAmount,
	createFetCoin,
} from '../../nodes/Fetchai/utils/unitConverter';

describe('unitConverter', () => {
	describe('fetToAfet', () => {
		it('should convert FET to afet correctly', () => {
			expect(fetToAfet('1')).toBe('1000000000000000000');
			expect(fetToAfet('0.5')).toBe('500000000000000000');
			expect(fetToAfet('10')).toBe('10000000000000000000');
		});

		it('should handle number input', () => {
			expect(fetToAfet(1)).toBe('1000000000000000000');
			expect(fetToAfet(0.001)).toBe('1000000000000000');
		});

		it('should handle zero', () => {
			expect(fetToAfet('0')).toBe('0');
			expect(fetToAfet(0)).toBe('0');
		});
	});

	describe('afetToFet', () => {
		it('should convert afet to FET correctly', () => {
			expect(afetToFet('1000000000000000000')).toBe('1');
			expect(afetToFet('500000000000000000')).toBe('0.5');
		});

		it('should handle small amounts', () => {
			const result = afetToFet('1');
			expect(parseFloat(result)).toBeLessThan(0.000001);
		});

		it('should handle zero', () => {
			expect(afetToFet('0')).toBe('0');
		});
	});

	describe('formatFet', () => {
		it('should format FET amounts with symbol', () => {
			expect(formatFet('1000000000000000000')).toContain('FET');
		});

		it('should format with custom decimals', () => {
			const result = formatFet('1500000000000000000', 2);
			expect(result).toContain('1.5');
		});
	});

	describe('parseAmount', () => {
		it('should parse amount strings', () => {
			expect(parseAmount('100 FET')).toBe('100');
			expect(parseAmount('50.5FET')).toBe('50.5');
		});

		it('should handle plain numbers', () => {
			expect(parseAmount('100')).toBe('100');
			expect(parseAmount('0.001')).toBe('0.001');
		});
	});

	describe('createFetCoin', () => {
		it('should create coin object with afet denom', () => {
			const coin = createFetCoin('1');
			expect(coin.denom).toBe('afet');
			expect(coin.amount).toBe('1000000000000000000');
		});

		it('should handle decimal amounts', () => {
			const coin = createFetCoin('0.5');
			expect(coin.amount).toBe('500000000000000000');
		});
	});
});
