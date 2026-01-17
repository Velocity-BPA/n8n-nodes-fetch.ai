/**
 * Fetch.ai Address Utilities
 * 
 * Handles Bech32 address encoding/decoding for Fetch.ai blockchain
 * and agent address validation/generation.
 */

import { bech32 } from 'bech32';
import * as crypto from 'crypto';

/**
 * Default address prefix for Fetch.ai
 */
export const FETCH_PREFIX = 'fetch';
export const AGENT_PREFIX = 'agent';
export const VALIDATOR_PREFIX = 'fetchvaloper';
export const VALIDATOR_CONSENSUS_PREFIX = 'fetchvalcons';

/**
 * Encode bytes to Bech32 address
 */
export function encodeBech32(prefix: string, data: Uint8Array): string {
	const words = bech32.toWords(data);
	return bech32.encode(prefix, words);
}

/**
 * Decode Bech32 address to bytes
 */
export function decodeBech32(address: string): { prefix: string; data: Uint8Array } {
	const decoded = bech32.decode(address);
	const data = new Uint8Array(bech32.fromWords(decoded.words));
	return { prefix: decoded.prefix, data };
}

/**
 * Validate a Fetch.ai address
 */
export function validateFetchAddress(address: string): boolean {
	try {
		if (!address.startsWith(FETCH_PREFIX)) {
			return false;
		}
		const decoded = decodeBech32(address);
		return decoded.prefix === FETCH_PREFIX && decoded.data.length === 20;
	} catch {
		return false;
	}
}

/**
 * Validate an agent address
 */
export function validateAgentAddress(address: string): boolean {
	try {
		if (!address.startsWith(AGENT_PREFIX)) {
			return false;
		}
		// Agent addresses have a different format
		return /^agent1[a-z0-9]{38,}$/.test(address);
	} catch {
		return false;
	}
}

/**
 * Validate a validator address
 */
export function validateValidatorAddress(address: string): boolean {
	try {
		if (!address.startsWith(VALIDATOR_PREFIX)) {
			return false;
		}
		const decoded = decodeBech32(address);
		return decoded.prefix === VALIDATOR_PREFIX && decoded.data.length === 20;
	} catch {
		return false;
	}
}

/**
 * Convert wallet address to validator address
 */
export function walletToValidator(walletAddress: string): string {
	const decoded = decodeBech32(walletAddress);
	return encodeBech32(VALIDATOR_PREFIX, decoded.data);
}

/**
 * Convert validator address to wallet address
 */
export function validatorToWallet(validatorAddress: string): string {
	const decoded = decodeBech32(validatorAddress);
	return encodeBech32(FETCH_PREFIX, decoded.data);
}

/**
 * Generate address from public key
 */
export function pubKeyToAddress(pubKey: Uint8Array, prefix: string = FETCH_PREFIX): string {
	// SHA256 hash then RIPEMD160
	const sha256Hash = crypto.createHash('sha256').update(pubKey).digest();
	const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();
	return encodeBech32(prefix, ripemd160Hash);
}

/**
 * Generate agent address from seed
 */
export function generateAgentAddress(seed: string): string {
	const hash = crypto.createHash('sha256').update(seed).digest();
	// Take first 20 bytes and encode
	const addressBytes = hash.slice(0, 20);
	// Agent addresses use base32 encoding instead of bech32
	const base32 = Buffer.from(addressBytes).toString('hex');
	return `${AGENT_PREFIX}1q${base32}`;
}

/**
 * Extract address type from address string
 */
export function getAddressType(address: string): 'wallet' | 'agent' | 'validator' | 'unknown' {
	if (address.startsWith(FETCH_PREFIX + '1')) {
		return 'wallet';
	}
	if (address.startsWith(AGENT_PREFIX + '1')) {
		return 'agent';
	}
	if (address.startsWith(VALIDATOR_PREFIX + '1')) {
		return 'validator';
	}
	return 'unknown';
}

/**
 * Check if two addresses are the same (handles different prefixes)
 */
export function isSameAddress(addr1: string, addr2: string): boolean {
	try {
		const decoded1 = decodeBech32(addr1);
		const decoded2 = decodeBech32(addr2);
		return Buffer.from(decoded1.data).equals(Buffer.from(decoded2.data));
	} catch {
		return false;
	}
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, prefixLength: number = 10, suffixLength: number = 6): string {
	if (address.length <= prefixLength + suffixLength + 3) {
		return address;
	}
	return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Parse address from various formats
 */
export function parseAddress(input: string): { address: string; type: string } | null {
	const trimmed = input.trim().toLowerCase();
	
	// Check for Fetch.ai wallet address
	if (trimmed.startsWith('fetch1')) {
		if (validateFetchAddress(trimmed)) {
			return { address: trimmed, type: 'wallet' };
		}
	}
	
	// Check for agent address
	if (trimmed.startsWith('agent1')) {
		if (validateAgentAddress(trimmed)) {
			return { address: trimmed, type: 'agent' };
		}
	}
	
	// Check for validator address
	if (trimmed.startsWith('fetchvaloper1')) {
		if (validateValidatorAddress(trimmed)) {
			return { address: trimmed, type: 'validator' };
		}
	}
	
	return null;
}
