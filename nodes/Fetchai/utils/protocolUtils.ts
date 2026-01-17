/**
 * Fetch.ai Protocol Utilities
 * 
 * Handles protocol digest computation, validation, and management
 * for uAgents communication protocols.
 */

import * as crypto from 'crypto';
import { ProtocolManifest, ModelDefinition, HandlerDefinition } from '../constants/protocols';

/**
 * Compute protocol digest from manifest
 * The digest is a hash of the sorted, canonicalized protocol definition
 */
export function computeProtocolDigest(manifest: ProtocolManifest): string {
	// Sort models by name
	const sortedModels = [...manifest.models].sort((a, b) => a.name.localeCompare(b.name));
	
	// Create canonical representation
	const canonical = {
		name: manifest.name,
		version: manifest.version,
		models: sortedModels.map(m => ({
			name: m.name,
			schema: canonicalizeSchema(m.schema),
		})),
	};
	
	const jsonStr = JSON.stringify(canonical);
	const hash = crypto.createHash('sha256').update(jsonStr).digest();
	
	return `proto:${hash.toString('base64').replace(/[+/=]/g, '').slice(0, 32)}`;
}

/**
 * Canonicalize a JSON schema for consistent hashing
 */
function canonicalizeSchema(schema: Record<string, unknown>): Record<string, unknown> {
	const sorted: Record<string, unknown> = {};
	const keys = Object.keys(schema).sort();
	
	for (const key of keys) {
		const value = schema[key];
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			sorted[key] = canonicalizeSchema(value as Record<string, unknown>);
		} else if (Array.isArray(value)) {
			sorted[key] = value.map(item =>
				typeof item === 'object' && item !== null
					? canonicalizeSchema(item as Record<string, unknown>)
					: item
			);
		} else {
			sorted[key] = value;
		}
	}
	
	return sorted;
}

/**
 * Compute model digest
 */
export function computeModelDigest(model: ModelDefinition): string {
	const canonical = {
		name: model.name,
		schema: canonicalizeSchema(model.schema),
	};
	
	const jsonStr = JSON.stringify(canonical);
	const hash = crypto.createHash('sha256').update(jsonStr).digest();
	
	return `model:${hash.toString('base64').replace(/[+/=]/g, '').slice(0, 32)}`;
}

/**
 * Create a basic protocol manifest
 */
export function createProtocolManifest(
	name: string,
	version: string,
	models: ModelDefinition[],
	handlers: HandlerDefinition[] = [],
	description?: string
): ProtocolManifest {
	const manifest: ProtocolManifest = {
		name,
		version,
		digest: '', // Will be computed
		description,
		models,
		handlers,
	};
	
	manifest.digest = computeProtocolDigest(manifest);
	return manifest;
}

/**
 * Validate protocol manifest structure
 */
export function validateProtocolManifest(manifest: ProtocolManifest): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	
	if (!manifest.name || typeof manifest.name !== 'string') {
		errors.push('Missing or invalid protocol name');
	}
	
	if (!manifest.version || typeof manifest.version !== 'string') {
		errors.push('Missing or invalid protocol version');
	}
	
	if (!manifest.models || !Array.isArray(manifest.models)) {
		errors.push('Missing or invalid models array');
	} else {
		manifest.models.forEach((model, index) => {
			if (!model.name) {
				errors.push(`Model at index ${index} missing name`);
			}
			if (!model.schema || typeof model.schema !== 'object') {
				errors.push(`Model ${model.name || index} missing or invalid schema`);
			}
		});
	}
	
	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Check if two protocols are compatible
 * Protocols are compatible if they share at least one model
 */
export function areProtocolsCompatible(
	protocol1: ProtocolManifest,
	protocol2: ProtocolManifest
): boolean {
	const models1 = new Set(protocol1.models.map(m => computeModelDigest(m)));
	const models2 = protocol2.models.map(m => computeModelDigest(m));
	
	return models2.some(digest => models1.has(digest));
}

/**
 * Merge protocols (combine models and handlers)
 */
export function mergeProtocols(
	protocol1: ProtocolManifest,
	protocol2: ProtocolManifest,
	newName: string,
	newVersion: string
): ProtocolManifest {
	const modelMap = new Map<string, ModelDefinition>();
	
	// Add models from both protocols (deduplicated by digest)
	for (const model of [...protocol1.models, ...protocol2.models]) {
		const digest = computeModelDigest(model);
		if (!modelMap.has(digest)) {
			modelMap.set(digest, model);
		}
	}
	
	const handlers = [...(protocol1.handlers || []), ...(protocol2.handlers || [])];
	
	return createProtocolManifest(
		newName,
		newVersion,
		Array.from(modelMap.values()),
		handlers,
		`Merged from ${protocol1.name} and ${protocol2.name}`
	);
}

/**
 * Extract model names from protocol
 */
export function getModelNames(protocol: ProtocolManifest): string[] {
	return protocol.models.map(m => m.name);
}

/**
 * Get handler for specific message type
 */
export function getHandler(
	protocol: ProtocolManifest,
	messageType: string
): HandlerDefinition | undefined {
	return protocol.handlers?.find(h => h.messageType === messageType);
}

/**
 * Create a simple request-response protocol
 */
export function createSimpleProtocol(
	name: string,
	version: string,
	requestSchema: Record<string, unknown>,
	responseSchema: Record<string, unknown>
): ProtocolManifest {
	return createProtocolManifest(
		name,
		version,
		[
			{ name: 'Request', schema: requestSchema },
			{ name: 'Response', schema: responseSchema },
		],
		[
			{ name: 'handleRequest', messageType: 'Request', responseType: 'Response' },
		],
		`Simple request-response protocol for ${name}`
	);
}

/**
 * Parse protocol digest string
 */
export function parseProtocolDigest(digest: string): { type: 'proto' | 'model' | 'unknown'; hash: string } {
	if (digest.startsWith('proto:')) {
		return { type: 'proto', hash: digest.slice(6) };
	}
	if (digest.startsWith('model:')) {
		return { type: 'model', hash: digest.slice(6) };
	}
	return { type: 'unknown', hash: digest };
}

/**
 * Format protocol info for display
 */
export function formatProtocolInfo(manifest: ProtocolManifest): string {
	const lines = [
		`Protocol: ${manifest.name} v${manifest.version}`,
		`Digest: ${manifest.digest}`,
		`Models: ${manifest.models.map(m => m.name).join(', ')}`,
	];
	
	if (manifest.handlers && manifest.handlers.length > 0) {
		lines.push(`Handlers: ${manifest.handlers.map(h => h.name).join(', ')}`);
	}
	
	if (manifest.description) {
		lines.push(`Description: ${manifest.description}`);
	}
	
	return lines.join('\n');
}
