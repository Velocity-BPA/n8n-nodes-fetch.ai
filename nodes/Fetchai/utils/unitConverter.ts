/**
 * Fetch.ai Unit Converter Utilities
 * 
 * Handles conversion between FET (display unit) and afet (smallest unit).
 * 1 FET = 10^18 afet (similar to ETH/wei relationship)
 */

/**
 * Decimal places for FET token
 */
export const FET_DECIMALS = 18;

/**
 * Denomination strings
 */
export const FET_DENOM = 'afet';
export const FET_DISPLAY_DENOM = 'FET';

/**
 * One FET in afet (10^18)
 */
export const ONE_FET_IN_AFET = BigInt('1000000000000000000');

/**
 * Convert FET to afet (smallest unit)
 * @param fet - Amount in FET (can be decimal)
 * @returns Amount in afet as string
 */
export function fetToAfet(fet: string | number): string {
	const fetStr = typeof fet === 'number' ? fet.toString() : fet;
	
	// Handle empty or zero
	if (!fetStr || fetStr === '0') {
		return '0';
	}
	
	// Parse the decimal
	const parts = fetStr.split('.');
	const wholePart = parts[0] || '0';
	let decimalPart = parts[1] || '';
	
	// Pad or truncate decimal part to 18 digits
	if (decimalPart.length < FET_DECIMALS) {
		decimalPart = decimalPart.padEnd(FET_DECIMALS, '0');
	} else {
		decimalPart = decimalPart.slice(0, FET_DECIMALS);
	}
	
	// Combine and remove leading zeros
	const result = (wholePart + decimalPart).replace(/^0+/, '') || '0';
	return result;
}

/**
 * Convert afet to FET
 * @param afet - Amount in afet
 * @returns Amount in FET as string
 */
export function afetToFet(afet: string | bigint): string {
	const afetStr = typeof afet === 'bigint' ? afet.toString() : afet;
	
	// Handle empty or zero
	if (!afetStr || afetStr === '0') {
		return '0';
	}
	
	// Pad with leading zeros if necessary
	const paddedAfet = afetStr.padStart(FET_DECIMALS + 1, '0');
	
	// Split into whole and decimal parts
	const splitPoint = paddedAfet.length - FET_DECIMALS;
	const wholePart = paddedAfet.slice(0, splitPoint).replace(/^0+/, '') || '0';
	const decimalPart = paddedAfet.slice(splitPoint).replace(/0+$/, '');
	
	// Combine
	if (decimalPart) {
		return `${wholePart}.${decimalPart}`;
	}
	return wholePart;
}

/**
 * Format FET amount for display
 * @param afet - Amount in afet
 * @param maxDecimals - Maximum decimal places to show
 * @returns Formatted string with FET symbol
 */
export function formatFet(afet: string | bigint, maxDecimals: number = 6): string {
	const fet = afetToFet(afet);
	const parts = fet.split('.');
	
	if (parts.length === 1) {
		return `${parts[0]} FET`;
	}
	
	const truncatedDecimal = parts[1].slice(0, maxDecimals);
	if (truncatedDecimal) {
		return `${parts[0]}.${truncatedDecimal} FET`;
	}
	return `${parts[0]} FET`;
}

/**
 * Parse amount with optional denomination
 * @param input - Input like "1.5 FET" or "1500000000000000000 afet" or just "1.5"
 * @returns Amount in afet
 */
export function parseAmount(input: string): string {
	const trimmed = input.trim().toLowerCase();
	
	// Check for denomination suffix
	if (trimmed.endsWith('afet')) {
		return trimmed.replace(/\s*afet$/, '').trim();
	}
	
	if (trimmed.endsWith('fet')) {
		const amount = trimmed.replace(/\s*fet$/, '').trim();
		return fetToAfet(amount);
	}
	
	// If no denomination, assume FET for decimal numbers, afet for integers
	if (trimmed.includes('.')) {
		return fetToAfet(trimmed);
	}
	
	// Large integers are likely afet, small are likely FET
	const value = BigInt(trimmed);
	if (value > BigInt(1000000)) {
		return trimmed; // Assume afet
	}
	return fetToAfet(trimmed); // Assume FET
}

/**
 * Add two amounts in afet
 */
export function addAfet(a: string, b: string): string {
	return (BigInt(a) + BigInt(b)).toString();
}

/**
 * Subtract two amounts in afet
 */
export function subtractAfet(a: string, b: string): string {
	const result = BigInt(a) - BigInt(b);
	if (result < 0) {
		throw new Error('Subtraction would result in negative amount');
	}
	return result.toString();
}

/**
 * Multiply afet amount by a factor
 */
export function multiplyAfet(amount: string, factor: number): string {
	const amountBigInt = BigInt(amount);
	const factorBigInt = BigInt(Math.floor(factor * 1000000));
	return ((amountBigInt * factorBigInt) / BigInt(1000000)).toString();
}

/**
 * Compare two amounts
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareAfet(a: string, b: string): number {
	const aBigInt = BigInt(a);
	const bBigInt = BigInt(b);
	
	if (aBigInt < bBigInt) return -1;
	if (aBigInt > bBigInt) return 1;
	return 0;
}

/**
 * Check if amount is valid (positive integer string)
 */
export function isValidAmount(amount: string): boolean {
	if (!amount || !/^\d+$/.test(amount)) {
		return false;
	}
	try {
		BigInt(amount);
		return true;
	} catch {
		return false;
	}
}

/**
 * Create coin object for Cosmos SDK
 */
export function createCoin(amount: string, denom: string = FET_DENOM): { amount: string; denom: string } {
	return { amount, denom };
}

/**
 * Create FET coin from FET amount
 */
export function createFetCoin(fetAmount: string | number): { amount: string; denom: string } {
	return createCoin(fetToAfet(fetAmount), FET_DENOM);
}

/**
 * Calculate gas fee
 */
export function calculateGasFee(gasLimit: number, gasPrice: string = '5000000000'): { amount: string; denom: string } {
	const fee = BigInt(gasLimit) * BigInt(gasPrice);
	return createCoin(fee.toString(), FET_DENOM);
}
