/**
 * Fetch.ai Message Utilities
 * 
 * Handles creation, signing, and verification of agent messages
 * using the envelope format for secure communication.
 */

import * as crypto from 'crypto';
import { ENVELOPE_VERSION, DEFAULT_MESSAGE_EXPIRY, AgentEnvelope } from '../constants/protocols';

/**
 * Message model interface
 */
export interface MessageModel {
	type: string;
	payload: Record<string, unknown>;
}

/**
 * Create a unique session ID
 */
export function createSessionId(): string {
	return crypto.randomUUID();
}

/**
 * Create a unique nonce for message
 */
export function createNonce(): string {
	return crypto.randomBytes(16).toString('hex');
}

/**
 * Calculate message expiry timestamp
 */
export function calculateExpiry(ttlSeconds: number = DEFAULT_MESSAGE_EXPIRY): number {
	return Math.floor(Date.now() / 1000) + ttlSeconds;
}

/**
 * Check if message has expired
 */
export function isExpired(expiryTimestamp: number): boolean {
	return Math.floor(Date.now() / 1000) > expiryTimestamp;
}

/**
 * Compute schema digest from message model
 */
export function computeSchemaDigest(model: Record<string, unknown>): string {
	const sortedJson = JSON.stringify(model, Object.keys(model).sort());
	const hash = crypto.createHash('sha256').update(sortedJson).digest();
	return `model:${hash.toString('base64').slice(0, 32)}`;
}

/**
 * Create an unsigned envelope
 */
export function createEnvelope(
	sender: string,
	target: string,
	payload: Record<string, unknown>,
	schemaDigest: string,
	options: {
		session?: string;
		protocolDigest?: string;
		expirySeconds?: number;
	} = {}
): AgentEnvelope {
	const payloadJson = JSON.stringify(payload);
	const payloadBase64 = Buffer.from(payloadJson).toString('base64');
	
	return {
		version: ENVELOPE_VERSION,
		sender,
		target,
		session: options.session || createSessionId(),
		schemaDigest,
		protocolDigest: options.protocolDigest,
		payload: payloadBase64,
		expires: calculateExpiry(options.expirySeconds || DEFAULT_MESSAGE_EXPIRY),
		nonce: createNonce(),
	};
}

/**
 * Sign an envelope with private key
 */
export function signEnvelope(
	envelope: AgentEnvelope,
	privateKey: Uint8Array
): AgentEnvelope {
	// Create signing payload
	const signingPayload = JSON.stringify({
		version: envelope.version,
		sender: envelope.sender,
		target: envelope.target,
		session: envelope.session,
		schemaDigest: envelope.schemaDigest,
		payload: envelope.payload,
		expires: envelope.expires,
		nonce: envelope.nonce,
	});
	
	// Sign with Ed25519 or secp256k1
	const sign = crypto.createSign('SHA256');
	sign.update(signingPayload);
	const signature = sign.sign({
		key: Buffer.from(privateKey),
		format: 'der',
		type: 'pkcs8',
	});
	
	return {
		...envelope,
		signature: signature.toString('base64'),
	};
}

/**
 * Verify envelope signature
 */
export function verifyEnvelope(
	envelope: AgentEnvelope,
	publicKey: Uint8Array
): boolean {
	if (!envelope.signature) {
		return false;
	}
	
	const signingPayload = JSON.stringify({
		version: envelope.version,
		sender: envelope.sender,
		target: envelope.target,
		session: envelope.session,
		schemaDigest: envelope.schemaDigest,
		payload: envelope.payload,
		expires: envelope.expires,
		nonce: envelope.nonce,
	});
	
	try {
		const verify = crypto.createVerify('SHA256');
		verify.update(signingPayload);
		return verify.verify(
			{ key: Buffer.from(publicKey), format: 'der', type: 'spki' },
			Buffer.from(envelope.signature, 'base64')
		);
	} catch {
		return false;
	}
}

/**
 * Decode envelope payload
 */
export function decodePayload<T = Record<string, unknown>>(envelope: AgentEnvelope): T {
	const jsonStr = Buffer.from(envelope.payload, 'base64').toString('utf-8');
	return JSON.parse(jsonStr) as T;
}

/**
 * Encode payload for envelope
 */
export function encodePayload(payload: Record<string, unknown>): string {
	return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Validate envelope structure
 */
export function validateEnvelope(envelope: AgentEnvelope): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	
	if (envelope.version !== ENVELOPE_VERSION) {
		errors.push(`Invalid version: expected ${ENVELOPE_VERSION}, got ${envelope.version}`);
	}
	
	if (!envelope.sender || typeof envelope.sender !== 'string') {
		errors.push('Missing or invalid sender');
	}
	
	if (!envelope.target || typeof envelope.target !== 'string') {
		errors.push('Missing or invalid target');
	}
	
	if (!envelope.session || typeof envelope.session !== 'string') {
		errors.push('Missing or invalid session');
	}
	
	if (!envelope.schemaDigest || typeof envelope.schemaDigest !== 'string') {
		errors.push('Missing or invalid schemaDigest');
	}
	
	if (!envelope.payload || typeof envelope.payload !== 'string') {
		errors.push('Missing or invalid payload');
	}
	
	if (envelope.expires && isExpired(envelope.expires)) {
		errors.push('Message has expired');
	}
	
	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Create a response envelope for a received message
 */
export function createResponseEnvelope(
	originalEnvelope: AgentEnvelope,
	sender: string,
	responsePayload: Record<string, unknown>,
	responseSchemaDigest: string
): AgentEnvelope {
	return createEnvelope(
		sender,
		originalEnvelope.sender,
		responsePayload,
		responseSchemaDigest,
		{
			session: originalEnvelope.session,
			protocolDigest: originalEnvelope.protocolDigest,
		}
	);
}

/**
 * Serialize envelope for transmission
 */
export function serializeEnvelope(envelope: AgentEnvelope): string {
	return JSON.stringify(envelope);
}

/**
 * Deserialize envelope from transmission
 */
export function deserializeEnvelope(data: string): AgentEnvelope {
	return JSON.parse(data) as AgentEnvelope;
}

/**
 * Create error response envelope
 */
export function createErrorEnvelope(
	originalEnvelope: AgentEnvelope,
	sender: string,
	errorCode: string,
	errorMessage: string
): AgentEnvelope {
	return createEnvelope(
		sender,
		originalEnvelope.sender,
		{
			type: 'error',
			code: errorCode,
			message: errorMessage,
		},
		'model:error-v1',
		{ session: originalEnvelope.session }
	);
}
