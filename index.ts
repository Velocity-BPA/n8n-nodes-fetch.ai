/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * n8n-nodes-fetchai
 * 
 * A comprehensive n8n community node package for Fetch.ai blockchain
 * and its ecosystem of autonomous agents.
 * 
 * Features:
 * - Account management and FET token transfers
 * - uAgents creation, registration, and messaging
 * - Almanac registry operations
 * - DeltaV AI engine integration
 * - Agentverse hosted platform management
 * - CosmWasm smart contract interaction
 * - Staking and governance
 * - IBC cross-chain transfers
 * - Name service (FNS) operations
 * - CW-20 token operations
 * - CW-721 NFT operations
 * 
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 * @license MIT
 */

// Export credentials
export { FetchaiNetwork } from './credentials/FetchaiNetwork.credentials';
export { FetchaiApi } from './credentials/FetchaiApi.credentials';
export { Almanac } from './credentials/Almanac.credentials';

// Export nodes
export { Fetchai } from './nodes/Fetchai/Fetchai.node';
export { FetchaiTrigger } from './nodes/Fetchai/FetchaiTrigger.node';
