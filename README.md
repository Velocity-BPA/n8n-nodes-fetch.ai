# n8n-nodes-fetchai

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

---

[![npm version](https://badge.fury.io/js/n8n-nodes-fetchai.svg)](https://www.npmjs.com/package/n8n-nodes-fetchai)
[![License: BUSL-1.1](https://img.shields.io/badge/License-BUSL--1.1-blue.svg)](LICENSE)

A comprehensive n8n community node package for the **Fetch.ai blockchain** and its ecosystem of autonomous agents. This package provides seamless integration with uAgents, Almanac registry, DeltaV AI engine, Agentverse platform, CosmWasm smart contracts, and more.

**Author:** [Velocity BPA](https://velobpa.com)  
**GitHub:** [Velocity-BPA](https://github.com/Velocity-BPA)  
**Website:** [velobpa.com](https://velobpa.com)

---

## 🌟 Features

### Blockchain Operations
- **Account Management** - Get balances, transfer FET, view transaction history
- **Staking** - Delegate, undelegate, redelegate FET to validators
- **Governance** - View and vote on proposals
- **IBC Transfers** - Cross-chain token transfers via IBC protocol

### Agent Ecosystem
- **uAgents** - Create, register, and manage autonomous AI agents
- **Almanac Registry** - Register and discover agents on-chain
- **Agent Messaging** - Send and receive messages between agents
- **Protocol Management** - Define and verify communication protocols

### AI & Automation
- **DeltaV Integration** - Submit tasks to AI engine, search functions
- **Agentverse** - Deploy and manage hosted agents in the cloud

### Smart Contracts
- **CosmWasm Contracts** - Query and execute smart contracts
- **CW-20 Tokens** - Interact with fungible tokens
- **CW-721 NFTs** - Manage non-fungible tokens

### Utilities
- **Unit Conversion** - Convert between FET and afet (10^18)
- **Address Validation** - Validate Fetch.ai and agent addresses
- **Name Service** - Register and resolve .fetch names

---

## 📦 Installation

### Via npm (Recommended)

```bash
npm install n8n-nodes-fetchai
```

### Via n8n Community Nodes

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-fetchai`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom extensions folder
cd ~/.n8n/custom

# Clone and build
git clone https://github.com/Velocity-BPA/n8n-nodes-fetch.ai.git
cd n8n-nodes-fetchai
npm install
npm run build

# Restart n8n
```

---

## 🚀 Quick Start

### 1. Configure Credentials

#### Fetch.ai Network Credentials
- **Network**: Select Mainnet, Testnet (Dorado), or Custom
- **Mnemonic**: Your 24-word wallet recovery phrase
- **Gas Price**: Default is 5000000000 afet

#### Fetch.ai API Credentials (Optional)
- **Agentverse API Key**: For hosted agent management
- **DeltaV API Key**: For AI engine access

### 2. Basic Examples

#### Get FET Balance

```json
{
  "resource": "account",
  "operation": "getBalance",
  "address": "fetch1abc123..."
}
```

#### Transfer FET

```json
{
  "resource": "account",
  "operation": "transfer",
  "recipientAddress": "fetch1xyz789...",
  "amount": "10"
}
```

#### Submit DeltaV Task

```json
{
  "resource": "deltav",
  "operation": "submitTask",
  "objective": "Book a flight from London to New York for next Monday"
}
```

#### Send Message to Agent

```json
{
  "resource": "messaging",
  "operation": "sendMessage",
  "targetAgent": "agent1q...",
  "messagePayload": {"type": "greeting", "content": "Hello!"},
  "schemaDigest": "model:greeting-v1"
}
```

---

## 📚 Resources & Operations

### Account
| Operation | Description |
|-----------|-------------|
| Get Account Info | Get account details including sequence number |
| Get FET Balance | Get FET token balance |
| Get All Balances | Get all token balances including IBC tokens |
| Transfer FET | Send FET to another address |
| Validate Address | Check if address format is valid |
| Get Delegations | View staking delegations |
| Get Rewards | View pending staking rewards |

### Agent (uAgents)
| Operation | Description |
|-----------|-------------|
| Get Agent Info | Get agent details from Almanac |
| Register Agent | Register new agent in Almanac |
| Get Agent Protocols | List protocols agent supports |
| Get Agent Endpoints | Get agent communication endpoints |
| Search Agents | Search for agents by query |
| Verify Agent | Check agent registration status |

### Almanac
| Operation | Description |
|-----------|-------------|
| Get Almanac Entry | Get agent's Almanac record |
| Get Agents by Protocol | Find agents implementing a protocol |
| Get Registration Cost | Get cost to register |
| Get Expiry Info | Check registration expiry |
| Renew Registration | Extend registration period |

### DeltaV (AI Engine)
| Operation | Description |
|-----------|-------------|
| Submit Task | Submit natural language task |
| Get Task Status | Check task progress |
| Get Task Results | Get completed task results |
| Search Functions | Search available AI functions |
| Get Recommendations | Get AI-powered suggestions |
| Get Credits Balance | Check DeltaV credits |

### Agentverse
| Operation | Description |
|-----------|-------------|
| Get Hosted Agents | List all hosted agents |
| Deploy Agent | Deploy new agent to cloud |
| Start/Stop Agent | Control agent execution |
| Get Agent Logs | View agent logs |
| Update Agent Code | Push code updates |
| Set Agent Secrets | Configure environment variables |

### Contract (CosmWasm)
| Operation | Description |
|-----------|-------------|
| Query Contract | Read contract state |
| Execute Contract | Call contract method |
| Instantiate Contract | Create contract instance |
| Get Contract Info | Get contract metadata |

### Staking
| Operation | Description |
|-----------|-------------|
| Get Validators | List all validators |
| Delegate FET | Stake tokens with validator |
| Undelegate FET | Unstake tokens |
| Redelegate FET | Move stake between validators |
| Get Staking Rewards | View pending rewards |
| Claim Rewards | Withdraw rewards |

### Governance
| Operation | Description |
|-----------|-------------|
| Get Proposals | List governance proposals |
| Get Proposal Info | Get proposal details |
| Vote on Proposal | Cast vote |
| Get Voting Power | Check voting weight |

### Name Service (FNS)
| Operation | Description |
|-----------|-------------|
| Resolve Name | Convert name to address |
| Register Name | Register new name |
| Reverse Lookup | Get name for address |
| Transfer Name | Change name ownership |

### Token (CW-20)
| Operation | Description |
|-----------|-------------|
| Get Token Info | Get token metadata |
| Get Token Balance | Check token balance |
| Transfer Token | Send tokens |
| Get Allowance | Check spending approval |
| Approve Spending | Allow token spending |

### NFT (CW-721)
| Operation | Description |
|-----------|-------------|
| Get NFT Info | Get NFT metadata |
| Get NFT Owner | Check NFT ownership |
| Get NFTs by Owner | List owned NFTs |
| Transfer NFT | Send NFT |

### Utility
| Operation | Description |
|-----------|-------------|
| Convert Units | FET ↔ afet conversion |
| Get Chain ID | Get network chain ID |
| Get Node Info | Get connected node details |
| Hash Data | SHA256 hash data |

---

## ⚡ Trigger Events

The **Fetch.ai Trigger** node monitors real-time events:

### Account Events
- Balance Changed
- FET Received / Sent
- Delegation Changed
- Rewards Available

### Agent Events
- Agent Registered
- Message Received
- Status Changed
- Task Completed

### DeltaV Events
- Task Submitted / Completed / Failed

### Block Events
- New Block
- Transaction Confirmed

### Governance Events
- New Proposal
- Proposal Passed / Failed

---

## 🔧 Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/Velocity-BPA/n8n-nodes-fetch.ai.git
cd n8n-nodes-fetchai

# Install dependencies
npm install

# Build
npm run build

# Watch mode for development
npm run dev
```

### Project Structure

```
n8n-nodes-fetchai/
├── credentials/
│   ├── FetchaiNetwork.credentials.ts
│   ├── FetchaiApi.credentials.ts
│   └── Almanac.credentials.ts
├── nodes/
│   └── Fetchai/
│       ├── Fetchai.node.ts
│       ├── FetchaiTrigger.node.ts
│       ├── fetchai.svg
│       ├── transport/
│       │   ├── cosmosClient.ts
│       │   ├── agentClient.ts
│       │   ├── almanacClient.ts
│       │   ├── deltavClient.ts
│       │   └── agentverseClient.ts
│       ├── constants/
│       │   ├── networks.ts
│       │   ├── protocols.ts
│       │   ├── contracts.ts
│       │   └── agents.ts
│       └── utils/
│           ├── addressUtils.ts
│           ├── messageUtils.ts
│           ├── protocolUtils.ts
│           └── unitConverter.ts
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
├── COMMERCIAL_LICENSE.md
└── LICENSING_FAQ.md
```

---

## 🧪 Testing Locally

### Step 1: Build the Package

```bash
cd n8n-nodes-fetchai
npm install
npm run build
```

### Step 2: Link to n8n

```bash
# Create global link
npm link

# Navigate to n8n installation
cd ~/.n8n

# Create custom folder if needed
mkdir -p custom
cd custom

# Link the package
npm link n8n-nodes-fetchai
```

### Step 3: Configure n8n

Add to your n8n environment or `~/.n8n/.env`:

```env
N8N_CUSTOM_EXTENSIONS="~/.n8n/custom"
```

### Step 4: Restart n8n

```bash
# If running n8n locally
n8n start

# Or restart the n8n service
systemctl restart n8n
```

### Step 5: Verify Installation

1. Open n8n in your browser
2. Create a new workflow
3. Search for "Fetch.ai" in the nodes panel
4. You should see both "Fetch.ai" and "Fetch.ai Trigger" nodes

---

## 🔐 Security Considerations

⚠️ **Important Security Notes:**

1. **Never share your mnemonic phrase** - It provides full access to your wallet
2. **Use testnet for development** - Avoid risking real funds
3. **Validate addresses** - Always verify recipient addresses before transfers
4. **Secure API keys** - Store Agentverse/DeltaV keys securely
5. **Review contract interactions** - Understand what contracts do before executing

---

## 📖 Fetch.ai Concepts

| Term | Description |
|------|-------------|
| **uAgents** | Autonomous AI agents that can communicate and transact |
| **Almanac** | Decentralized registry for agent discovery |
| **Protocol** | Message schema for agent communication |
| **Agentverse** | Cloud platform for hosting agents |
| **DeltaV** | AI engine connecting users with agent services |
| **Envelope** | Signed message container for secure communication |
| **FET** | Native token (merging to ASI Alliance token) |
| **afet** | Smallest unit (1 FET = 10^18 afet) |

---

## 🌐 Network Information

### Mainnet (fetchhub-4)
- **REST**: https://rest-fetchhub.fetch.ai
- **RPC**: https://rpc-fetchhub.fetch.ai
- **Explorer**: https://explore-fetchhub.fetch.ai

### Testnet Dorado (dorado-1)
- **REST**: https://rest-dorado.fetch.ai
- **RPC**: https://rpc-dorado.fetch.ai
- **Faucet**: https://faucet-dorado.fetch.ai

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

---

## 🙏 Acknowledgments

- [Fetch.ai](https://fetch.ai) for the amazing autonomous agent ecosystem
- [n8n](https://n8n.io) for the powerful workflow automation platform
- [CosmJS](https://github.com/cosmos/cosmjs) for Cosmos SDK JavaScript libraries

---

## 📞 Support

- **Documentation**: [Fetch.ai Docs](https://docs.fetch.ai)
- **Discord**: [Fetch.ai Discord](https://discord.gg/fetchai)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-fetch.ai/issues)

---

**Made with ❤️ by [Velocity BPA](https://velobpa.com)**
