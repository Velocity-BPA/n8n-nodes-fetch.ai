# n8n-nodes-fetch.ai

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Fetch.ai's decentralized AI platform, offering 6 core resources including agent management, communication protocols, and blockchain network operations. Enable autonomous AI agents to interact, negotiate, and execute tasks within decentralized networks directly from your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Fetch.ai](https://img.shields.io/badge/Fetch.ai-AI%20Agents-purple)
![Blockchain](https://img.shields.io/badge/Blockchain-Cosmos%20SDK-green)
![DeFi](https://img.shields.io/badge/DeFi-Ready-orange)

## Features

- **Agent Lifecycle Management** - Create, configure, deploy, and monitor autonomous AI agents with custom behaviors and capabilities
- **Inter-Agent Communication** - Facilitate secure message passing, negotiation protocols, and coordination between distributed agents
- **Almanac Service Integration** - Register and discover agent services, capabilities, and availability within the Fetch.ai network
- **DeltaV Task Automation** - Execute complex multi-agent tasks and workflows through Fetch.ai's conversational AI interface
- **Network Node Operations** - Manage validator nodes, stake FET tokens, and participate in network governance and consensus
- **Wallet & Transaction Management** - Handle FET token transfers, smart contract interactions, and blockchain transaction monitoring

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-fetch.ai`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-fetch.ai
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-fetch.ai.git
cd n8n-nodes-fetch.ai
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-fetch.ai
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Fetch.ai platform API key for authentication | Yes |
| Wallet Address | Your FET wallet address for blockchain operations | No |
| Private Key | Private key for signing transactions (encrypted storage) | No |
| Network | Target network (mainnet, testnet, or dorado) | Yes |

## Resources & Operations

### 1. Agents

| Operation | Description |
|-----------|-------------|
| Create Agent | Deploy a new autonomous agent with specified capabilities and behaviors |
| Get Agent | Retrieve agent details, status, and current configuration |
| Update Agent | Modify agent parameters, skills, or operational settings |
| Delete Agent | Decommission and remove an agent from the network |
| List Agents | Get all agents associated with your account or organization |
| Start Agent | Activate an agent to begin autonomous operations |
| Stop Agent | Pause agent operations while maintaining registration |
| Get Agent Logs | Retrieve operational logs and activity history for debugging |

### 2. Agent Communication

| Operation | Description |
|-----------|-------------|
| Send Message | Send structured messages between agents using FIPA protocols |
| Receive Messages | Poll for incoming messages from other agents or services |
| Create Channel | Establish a dedicated communication channel between agent groups |
| Join Channel | Subscribe an agent to an existing communication channel |
| Leave Channel | Unsubscribe an agent from a communication channel |
| Broadcast Message | Send messages to multiple agents simultaneously |
| Get Message History | Retrieve conversation logs between specific agents |
| Set Message Filters | Configure message routing and filtering rules |

### 3. Almanac Services

| Operation | Description |
|-----------|-------------|
| Register Service | Register an agent's capabilities and services in the Almanac |
| Discover Services | Search for available services by type, location, or capability |
| Update Service | Modify service descriptions, availability, or pricing |
| Unregister Service | Remove a service from the Almanac directory |
| Get Service Details | Retrieve detailed information about a specific service |
| Rate Service | Submit ratings and reviews for services used |
| Search by Location | Find services within specific geographic boundaries |
| Get Service Statistics | Retrieve usage metrics and performance data |

### 4. DeltaV Tasks

| Operation | Description |
|-----------|-------------|
| Create Task | Define and submit a new task for agent execution |
| Get Task Status | Monitor task progress and current execution state |
| Cancel Task | Terminate a running task and release allocated resources |
| List Tasks | Retrieve all tasks with filtering by status or date range |
| Get Task Results | Fetch completed task outputs and generated artifacts |
| Update Task | Modify task parameters or constraints during execution |
| Schedule Task | Set up recurring or future task executions |
| Get Task Metrics | Retrieve performance metrics and cost analysis |

### 5. Network Nodes

| Operation | Description |
|-----------|-------------|
| Get Node Info | Retrieve information about network validator nodes |
| Stake Tokens | Delegate FET tokens to validator nodes for rewards |
| Unstake Tokens | Withdraw staked tokens (subject to unbonding period) |
| Get Staking Rewards | Check accumulated staking rewards and distribution |
| Vote on Proposals | Participate in network governance voting |
| Get Network Status | Check overall network health and consensus status |
| List Validators | Get information about active and inactive validators |
| Get Delegation Info | Retrieve details about your staking delegations |

### 6. Wallets

| Operation | Description |
|-----------|-------------|
| Get Balance | Check FET token balance and other asset holdings |
| Send Tokens | Transfer FET tokens to other addresses |
| Get Transaction History | Retrieve transaction logs and payment history |
| Create Transaction | Prepare and sign blockchain transactions |
| Get Transaction Status | Check confirmation status of submitted transactions |
| Estimate Gas | Calculate transaction fees before submission |
| Get Address Info | Retrieve address details and associated metadata |
| Generate Address | Create new wallet addresses for receiving payments |

## Usage Examples

```javascript
// Create and deploy an autonomous trading agent
const agent = {
  "name": "crypto-arbitrage-bot",
  "capabilities": ["trading", "market-analysis"],
  "budget": 1000,
  "risk_tolerance": "medium",
  "trading_pairs": ["FET/USDC", "FET/ETH"]
};

// Register a data analysis service in the Almanac
const service = {
  "name": "crypto-sentiment-analysis",
  "description": "Real-time cryptocurrency sentiment analysis from social media",
  "category": "data-analysis",
  "pricing": {
    "model": "per-request",
    "amount": 0.1,
    "currency": "FET"
  },
  "availability": "24/7"
};

// Execute a complex multi-agent task through DeltaV
const task = {
  "type": "market-research",
  "description": "Analyze DeFi trends and provide investment recommendations",
  "requirements": {
    "data_sources": ["coinmarketcap", "defilipulse", "twitter"],
    "analysis_depth": "comprehensive",
    "timeline": "7-day-forecast"
  },
  "budget": 50
};

// Stake FET tokens to earn rewards
const stakingOperation = {
  "validator_address": "fetchvaloper1abc123...",
  "amount": "1000",
  "auto_compound": true
};
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| InvalidApiKey | API key is missing or invalid | Verify API key in credentials configuration |
| InsufficientBalance | Not enough FET tokens for transaction | Check wallet balance and add funds if needed |
| AgentNotFound | Specified agent ID does not exist | Verify agent ID or create the agent first |
| NetworkTimeout | Request timed out waiting for response | Check network connectivity and retry operation |
| ValidationError | Invalid parameters in request payload | Review required fields and data formats |
| RateLimitExceeded | Too many API requests in time window | Implement request throttling and retry logic |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-fetch.ai/issues)
- **Fetch.ai Documentation**: [docs.fetch.ai](https://docs.fetch.ai)
- **Community Forum**: [community.fetch.ai](https://community.fetch.ai)