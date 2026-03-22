# @satianurag/hiero-mirror-client

Standalone TypeScript client for the **Hedera / Hiero Mirror Node REST API**.

Built for precision, type safety, and developer ergonomics — no silent data corruption, no manual pagination, no guesswork.

## Features

- **Full API coverage** — 49 methods across 9 resource groups
- **Safe JSON parsing** — int64 values preserved as strings (no precision loss)
- **Three pagination patterns** — `await`, `for await...of`, `.pages()`
- **Adaptive HCS streaming** — topic message polling with auto-backoff
- **ETag caching** — automatic conditional requests with `If-None-Match`
- **Typed errors** — structured error hierarchy (`HieroNotFoundError`, `HieroRateLimitError`, etc.)
- **Dual output** — ESM + CJS with full `.d.ts` declarations
- **Zero platform dependencies** — works in Node.js 22+, Deno, Bun, and browsers
- **HBAR conversion utilities** — `tinybarToHbar`, `hbarToTinybar`, `formatHbar`
- **Scheduled transaction helpers** — poll execution, track signatures, filter by account
- **Transaction confirmation poller** — `waitFor()` bridges consensus-to-mirror-node lag
- **MCP tool descriptors** — AI agent integration via Model Context Protocol

## Installation

```bash
npm install @satianurag/hiero-mirror-client
```

## Quick Start

```typescript
import { MirrorNodeClient } from '@satianurag/hiero-mirror-client';

const client = new MirrorNodeClient({ network: 'mainnet' });

// Get an account
const account = await client.accounts.get('0.0.800');
console.log(account.balance);

// List tokens (first page)
const page = await client.tokens.list({ limit: 10 });
console.log(page.data);
```

## Pagination

Three ergonomic patterns for consuming paginated results:

```typescript
// 1. Await — get the first page
const firstPage = await client.accounts.list({ limit: 25 });
console.log(firstPage.data);      // AccountSummary[]
console.log(firstPage.links.next); // cursor or null

// 2. Auto-paginate items
for await (const account of client.accounts.list()) {
  console.log(account.account);
}

// 3. Page-by-page
for await (const page of client.accounts.list({ limit: 100 }).pages()) {
  console.log(`Got ${page.data.length} accounts`);
}
```

## Topic Streaming

Subscribe to Hedera Consensus Service messages with adaptive polling:

```typescript
const controller = new AbortController();

for await (const msg of client.topics.stream('0.0.12345', {
  signal: controller.signal,
})) {
  console.log(msg.consensus_timestamp, msg.message);
}

// Cancel anytime
controller.abort();
```

## Error Handling

All errors extend `HieroError` for easy pattern matching:

```typescript
import {
  HieroNotFoundError,
  HieroRateLimitError,
  HieroValidationError,
} from '@satianurag/hiero-mirror-client';

try {
  await client.accounts.get('0.0.999999999');
} catch (error) {
  if (error instanceof HieroNotFoundError) {
    console.log('Account not found');
  } else if (error instanceof HieroRateLimitError) {
    console.log(`Rate limited, retry after ${error.retryAfter}ms`);
  }
}
```

## Configuration

```typescript
const client = new MirrorNodeClient({
  // Network preset (or use baseUrl for custom)
  network: 'testnet',   // 'mainnet' | 'testnet' | 'previewnet'
  // baseUrl: 'https://custom-mirror.example.com',

  timeout: 30_000,      // Request timeout (default: 30s)
  maxRetries: 2,        // Retry count (default: 2)
  rateLimitRps: 50,     // Rate limit (default: 50 req/s)
  logger: console,      // Optional logger (silent by default)
});
```

### Network URLs

| Network | URL |
|---------|-----|
| `mainnet` | `https://mainnet-public.mirrornode.hedera.com` |
| `testnet` | `https://testnet.mirrornode.hedera.com` |
| `previewnet` | `https://previewnet.mirrornode.hedera.com` |

## Resources

| Resource | Methods | Key Operations |
|----------|---------|----------------|
| `accounts` | 10 | list, get, NFTs, tokens, rewards, allowances, airdrops |
| `balances` | 3 | list, getForAccount, getTokenBalance |
| `blocks` | 2 | list, get |
| `contracts` | 12 | list, get, call (POST), results, actions, logs, state, opcodes |
| `network` | 6 | exchangeRate, fees, estimateFees (POST), nodes, stake, supply |
| `schedules` | 2 | list, get |
| `tokens` | 6 | list, get, balances, NFTs, NFT transactions |
| `topics` | 5 | get, messages, stream |
| `transactions` | 3 | list, get, waitFor |

## Transaction Confirmation Poller

Bridge the consensus-to-mirror-node ingestion lag (typically 3-7s):

```typescript
// Poll until the transaction appears on the mirror node
const tx = await client.transactions.waitFor(
  '0.0.1234@1615422161.673238162',
  { timeout: 15_000 },
);
console.log(tx.result, tx.consensus_timestamp);
```

## Balance Helpers

Convenience methods for the most common balance queries:

```typescript
// Get full balance for an account (HBAR + tokens)
const balance = await client.balances.getForAccount('0.0.98');
console.log(balance.account, balance.balance, balance.tokens);

// Get a specific token balance
const tokenBal = await client.balances.getTokenBalance('0.0.98', '0.0.456');
if (tokenBal) {
  console.log(tokenBal.token_id, tokenBal.balance);
}
```

## Scheduled Transaction Helpers

High-level workflows for scheduled transactions:

```typescript
import {
  waitForExecution,
  getSignatureProgress,
  listSchedulesByAccount,
  decodeTransactionBody,
} from '@satianurag/hiero-mirror-client';

// Poll until a schedule executes, is deleted, or expires
const result = await waitForExecution(client.schedules, '0.0.1234', {
  interval: 2000,
  timeout: 120_000,
  onPoll: (schedule) => console.log('Polling...', schedule.schedule_id),
});
console.log(result.status); // 'executed' | 'deleted' | 'expired'

// Check signature progress
const progress = await getSignatureProgress(client.schedules, '0.0.1234');
console.log(progress.signatureCount, progress.signedKeys);

// List schedules by creator account, filtered by status
const pending = await listSchedulesByAccount(client.schedules, '0.0.100', {
  status: 'pending',
});

// Decode the base64 transaction body
const decoded = decodeTransactionBody(schedule);
console.log(decoded.hex, decoded.byteLength);
```

## Utilities

Additional utilities available via the `/utils` subpath:

```typescript
import {
  base64ToHex, hexToBase64, fromString, toDate,
  tinybarToHbar, hbarToTinybar, formatHbar,
} from '@satianurag/hiero-mirror-client/utils';

// HBAR conversion (BigInt-safe, handles up to 8 decimal places)
tinybarToHbar('100000000');   // '1'
tinybarToHbar('150000000');   // '1.5'
tinybarToHbar('1');           // '0.00000001'
hbarToTinybar('2.5');         // '250000000'
formatHbar('100000000');      // '1 HBAR'

// Encoding conversions
const hex = base64ToHex('bZL5Ig==');  // '0x6d92f922'

// Timestamp handling with full nanosecond precision
// Returns a ParsedTimestamp: { seconds: bigint, nanos: number, toString() }
const ts = fromString('1710000000.123456789');
ts.seconds; // 1710000000n (BigInt)
ts.nanos;   // 123456789
```

## MCP Tool Descriptors (AI Agent Integration)

Export MCP-compatible tool descriptors for AI agent frameworks:

```typescript
import { MirrorNodeClient, mirrorNodeTools } from '@satianurag/hiero-mirror-client';

const client = new MirrorNodeClient({ network: 'mainnet' });

// Register with any MCP-compatible server
for (const tool of mirrorNodeTools) {
  server.registerTool(tool.name, tool.description, tool.inputSchema, (input) =>
    tool.execute(client, input),
  );
}

// 16 tools covering: accounts, balances, tokens, transactions,
// schedules, topics, contracts, blocks, and network
```

## TypeScript

All types are exported for full TypeScript support:

```typescript
import type {
  AccountDetail,
  TokenSummary,
  Transaction,
  NetworkStake,
  // Helper types
  WaitForExecutionOptions,
  ExecutionResult,
  SignatureProgress,
  WaitForTransactionOptions,
  ToolDescriptor,
} from '@satianurag/hiero-mirror-client';

// Utility types from the /utils subpath
import type { ParsedTimestamp } from '@satianurag/hiero-mirror-client/utils';
```

## Int64 Safety

The SDK automatically preserves precision for all large integer values. Fields like `balance`, `stake`, and `total_supply` that exceed `Number.MAX_SAFE_INTEGER` are returned as strings — never silently truncated.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding guidelines, and the pull request process.

This project uses the [Developer Certificate of Origin (DCO)](https://developercertificate.org/). All commits must be signed off (`git commit -s`).

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.
