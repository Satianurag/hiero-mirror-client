/**
 * MCP-compatible tool descriptors for Hiero Mirror Node operations.
 *
 * Each descriptor follows the Model Context Protocol tool definition format,
 * making every resource method discoverable by any MCP-compatible AI agent.
 *
 * These are **read-only** mirror node queries — safe for autonomous agent usage.
 *
 * @packageDocumentation
 */

import type { MirrorNodeClient } from '../client.js';

// ---------------------------------------------------------------------------
// Tool descriptor types
// ---------------------------------------------------------------------------

export interface ToolInputProperty {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, ToolInputProperty>;
  required: string[];
}

export interface ToolDescriptor {
  /** Unique tool name following `hedera_<action>` convention. */
  name: string;
  /** Human-readable description of what the tool does. */
  description: string;
  /** JSON Schema for the tool's input parameters. */
  inputSchema: ToolInputSchema;
  /** Executes the tool with the given client and input. */
  execute: (
    client: MirrorNodeClient,
    input: Record<string, string | undefined>,
  ) => Promise<unknown>;
}

// ---------------------------------------------------------------------------
// Tool descriptors
// ---------------------------------------------------------------------------

export const mirrorNodeTools: ToolDescriptor[] = [
  // -- Accounts --
  {
    name: 'hedera_get_account',
    description:
      'Get detailed information about a Hedera account including balance, key, and staking info',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'Hedera account ID, alias, or EVM address (e.g., 0.0.98)',
        },
      },
      required: ['accountId'],
    },
    execute: async (client, input) => client.accounts.get(input.accountId!),
  },
  {
    name: 'hedera_list_accounts',
    description: 'List Hedera accounts with optional filtering by account ID or public key',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'string', description: 'Maximum number of results (default: 25)' },
      },
      required: [],
    },
    execute: async (client, input) => {
      const page = await client.accounts.list({
        limit: input.limit ? Number(input.limit) : undefined,
      });
      return page.data;
    },
  },

  // -- Balances --
  {
    name: 'hedera_get_account_balance',
    description:
      'Get the HBAR and token balances for a Hedera account from the global balances endpoint',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'Hedera account ID (e.g., 0.0.98)',
        },
      },
      required: ['accountId'],
    },
    execute: async (client, input) => {
      const page = await client.balances.list({ 'account.id': input.accountId, limit: 1 });
      return page.data[0] ?? null;
    },
  },

  // -- Tokens --
  {
    name: 'hedera_get_token',
    description: 'Get detailed information about a Hedera token (fungible or NFT)',
    inputSchema: {
      type: 'object',
      properties: {
        tokenId: {
          type: 'string',
          description: 'Hedera token ID (e.g., 0.0.1234)',
        },
      },
      required: ['tokenId'],
    },
    execute: async (client, input) => client.tokens.get(input.tokenId!),
  },
  {
    name: 'hedera_list_tokens',
    description: 'List Hedera tokens with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'string', description: 'Maximum number of results (default: 25)' },
      },
      required: [],
    },
    execute: async (client, input) => {
      const page = await client.tokens.list({
        limit: input.limit ? Number(input.limit) : undefined,
      });
      return page.data;
    },
  },

  // -- Transactions --
  {
    name: 'hedera_get_transaction',
    description: 'Get a transaction by its transaction ID',
    inputSchema: {
      type: 'object',
      properties: {
        transactionId: {
          type: 'string',
          description: 'Hedera transaction ID (e.g., 0.0.1234@1615422161.673238162)',
        },
      },
      required: ['transactionId'],
    },
    execute: async (client, input) => client.transactions.get(input.transactionId!),
  },
  {
    name: 'hedera_list_transactions',
    description: 'List recent Hedera transactions with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'Filter by account ID involved in the transaction',
        },
        limit: { type: 'string', description: 'Maximum number of results (default: 25)' },
      },
      required: [],
    },
    execute: async (client, input) => {
      const page = await client.transactions.list({
        'account.id': input.accountId,
        limit: input.limit ? Number(input.limit) : undefined,
      });
      return page.data;
    },
  },

  // -- Schedules --
  {
    name: 'hedera_get_schedule',
    description: 'Get a scheduled transaction by its schedule ID',
    inputSchema: {
      type: 'object',
      properties: {
        scheduleId: {
          type: 'string',
          description: 'Hedera schedule ID (e.g., 0.0.1234)',
        },
      },
      required: ['scheduleId'],
    },
    execute: async (client, input) => client.schedules.get(input.scheduleId!),
  },

  // -- Topics --
  {
    name: 'hedera_get_topic',
    description: 'Get information about an HCS topic',
    inputSchema: {
      type: 'object',
      properties: {
        topicId: {
          type: 'string',
          description: 'Hedera topic ID (e.g., 0.0.1234)',
        },
      },
      required: ['topicId'],
    },
    execute: async (client, input) => client.topics.get(input.topicId!),
  },
  {
    name: 'hedera_get_topic_messages',
    description: 'List messages for an HCS topic',
    inputSchema: {
      type: 'object',
      properties: {
        topicId: {
          type: 'string',
          description: 'Hedera topic ID (e.g., 0.0.1234)',
        },
        limit: { type: 'string', description: 'Maximum number of results (default: 25)' },
      },
      required: ['topicId'],
    },
    execute: async (client, input) => {
      const page = await client.topics.getMessages(input.topicId!, {
        limit: input.limit ? Number(input.limit) : undefined,
      });
      return page.data;
    },
  },

  // -- Contracts --
  {
    name: 'hedera_get_contract',
    description: 'Get detailed information about a smart contract',
    inputSchema: {
      type: 'object',
      properties: {
        contractId: {
          type: 'string',
          description: 'Hedera contract ID or EVM address (e.g., 0.0.1234)',
        },
      },
      required: ['contractId'],
    },
    execute: async (client, input) => client.contracts.get(input.contractId!),
  },

  // -- Blocks --
  {
    name: 'hedera_get_block',
    description: 'Get a block by number or hash',
    inputSchema: {
      type: 'object',
      properties: {
        blockNumberOrHash: {
          type: 'string',
          description: 'Block number or hash',
        },
      },
      required: ['blockNumberOrHash'],
    },
    execute: async (client, input) => client.blocks.get(input.blockNumberOrHash!),
  },

  // -- Network --
  {
    name: 'hedera_get_exchange_rate',
    description: 'Get the current HBAR to USD exchange rate from the Hedera network',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async (client) => client.network.getExchangeRate(),
  },
  {
    name: 'hedera_get_network_supply',
    description: 'Get the total and released HBAR supply on the Hedera network',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async (client) => client.network.getSupply(),
  },
  {
    name: 'hedera_get_network_fees',
    description: 'Get the current fee schedule for the Hedera network',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async (client) => client.network.getFees(),
  },
  {
    name: 'hedera_get_network_stake',
    description: 'Get network staking information including staking period and reward rate',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async (client) => client.network.getStake(),
  },
];
