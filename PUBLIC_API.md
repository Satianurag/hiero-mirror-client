# Public API Reference — `@satianurag/hiero-mirror-client`

## Constructor

```typescript
new MirrorNodeClient(options: MirrorNodeClientOptions)
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `network` | `'mainnet' \| 'testnet' \| 'previewnet'` | — | Network preset |
| `baseUrl` | `string` | — | Custom mirror node URL |
| `timeout` | `number` | `30000` | Request timeout (ms) |
| `maxRetries` | `number` | `2` | Retry count for 5xx/network errors |
| `rateLimitRps` | `number` | `50` | Max requests per second |
| `logger` | `Logger` | `{}` | Optional logger with `debug/info/warn/error` |

> Either `network` or `baseUrl` must be provided.

---

## Resource Groups

### `client.accounts` — AccountsResource (10 methods)

| Method | Signature | Returns |
|--------|-----------|---------|
| `list` | `(params?: AccountListParams)` | `Paginator<AccountSummary>` |
| `get` | `(idOrAliasOrEvmAddress: string)` | `Promise<AccountDetail>` |
| `getNFTs` | `(id: string, params?: AccountNftsParams)` | `Paginator<TokenNft>` |
| `getTokens` | `(id: string, params?: AccountTokensParams)` | `Paginator<TokenRelationship>` |
| `getRewards` | `(id: string, params?: AccountRewardsParams)` | `Paginator<StakingReward>` |
| `getCryptoAllowances` | `(id: string, params?: AllowanceCryptoParams)` | `Paginator<CryptoAllowance>` |
| `getTokenAllowances` | `(id: string, params?: AllowanceTokenParams)` | `Paginator<TokenAllowance>` |
| `getNftAllowances` | `(id: string, params?: AllowanceNftParams)` | `Paginator<NftAllowance>` |
| `getOutstandingAirdrops` | `(id: string, params?: AirdropParams)` | `Paginator<Airdrop>` |
| `getPendingAirdrops` | `(id: string, params?: AirdropParams)` | `Paginator<Airdrop>` |

### `client.balances` — BalancesResource (1 method)

| Method | Signature | Returns |
|--------|-----------|---------|
| `list` | `(params?: BalanceListParams)` | `Paginator<BalanceEntry>` |

### `client.blocks` — BlocksResource (2 methods)

| Method | Signature | Returns |
|--------|-----------|---------|
| `list` | `(params?: BlockListParams)` | `Paginator<Block>` |
| `get` | `(hashOrNumber: string \| number)` | `Promise<Block>` |

### `client.contracts` — ContractsResource (12 methods)

| Method | Signature | Returns |
|--------|-----------|---------|
| `list` | `(params?: ContractListParams)` | `Paginator<ContractSummary>` |
| `get` | `(contractIdOrAddress: string)` | `Promise<ContractDetail>` |
| `call` | `(request: ContractCallRequest)` | `Promise<ContractCallResponse>` |
| `getResults` | `(params?: ContractResultsParams)` | `Paginator<ContractResult>` |
| `getResultsByContract` | `(id: string, params?)` | `Paginator<ContractResult>` |
| `getResultByTimestamp` | `(id: string, timestamp: string)` | `Promise<ContractResult>` |
| `getResultByTransactionIdOrHash` | `(txIdOrHash: string)` | `Promise<ContractResult>` |
| `getActions` | `(txIdOrHash: string)` | `Paginator<ContractAction>` |
| `getLogs` | `(params?: ContractLogsParams)` | `Paginator<ContractLog>` |
| `getLogsByContract` | `(id: string, params?)` | `Paginator<ContractLog>` |
| `getState` | `(id: string, params?)` | `Paginator<StateChange>` |
| `getOpcodes` | `(txIdOrHash: string)` | `Promise<unknown>` |

### `client.network` — NetworkResource (6 methods)

| Method | Signature | Returns |
|--------|-----------|---------|
| `getExchangeRate` | `()` | `Promise<ExchangeRateSet>` |
| `getFees` | `(params?: NetworkFeeParams)` | `Promise<FeeSchedule>` |
| `estimateFees` | `(body: Uint8Array)` | `Promise<unknown>` |
| `getNodes` | `(params?: NetworkNodeParams)` | `Paginator<NetworkNode>` |
| `getStake` | `()` | `Promise<NetworkStake>` |
| `getSupply` | `(params?: NetworkSupplyParams)` | `Promise<Supply>` |

### `client.schedules` — SchedulesResource (2 methods)

| Method | Signature | Returns |
|--------|-----------|---------|
| `list` | `(params?: ScheduleListParams)` | `Paginator<Schedule>` |
| `get` | `(scheduleId: string)` | `Promise<Schedule>` |

### `client.tokens` — TokensResource (6 methods)

| Method | Signature | Returns |
|--------|-----------|---------|
| `list` | `(params?: TokenListParams)` | `Paginator<TokenSummary>` |
| `get` | `(tokenId: string)` | `Promise<TokenDetail>` |
| `getBalances` | `(tokenId: string, params?)` | `Paginator<TokenBalanceEntry>` |
| `getNFTs` | `(tokenId: string, params?)` | `Paginator<TokenNft>` |
| `getNFTBySerial` | `(tokenId: string, serial: number)` | `Promise<TokenNft>` |
| `getNFTTransactions` | `(tokenId: string, serial: number, params?)` | `Paginator<NftTransaction>` |

### `client.topics` — TopicsResource (5 methods)

| Method | Signature | Returns |
|--------|-----------|---------|
| `get` | `(topicId: string)` | `Promise<TopicInfo>` |
| `getMessages` | `(topicId: string, params?)` | `Paginator<TopicMessage>` |
| `getMessageBySequence` | `(topicId: string, seq: number)` | `Promise<TopicMessage>` |
| `getMessageByTimestamp` | `(timestamp: string)` | `Promise<TopicMessage>` |
| `stream` | `(topicId: string, options?)` | `AsyncIterable<TopicMessage>` |

### `client.transactions` — TransactionsResource (2 methods)

| Method | Signature | Returns |
|--------|-----------|---------|
| `list` | `(params?: TransactionListParams)` | `Paginator<Transaction>` |
| `get` | `(transactionId: string, params?)` | `Promise<Transaction>` |

---

## Error Hierarchy

| Error Class | When Thrown | Properties |
|-------------|------------|------------|
| `HieroError` | Base class | `message`, `statusCode?`, `cause?` |
| `HieroNetworkError` | DNS, connection refused | — |
| `HieroTimeoutError` | Request timeout | `timeoutMs` |
| `HieroRateLimitError` | HTTP 429 | `retryAfter?` |
| `HieroNotFoundError` | HTTP 404 | `entityId?` |
| `HieroValidationError` | HTTP 400, 415 | `parameter?` |
| `HieroServerError` | HTTP 5xx | — |
| `HieroParseError` | Malformed JSON | `body?` |
| `HieroCapabilityError` | Disabled features | — |

---

## Utilities (`/utils` subpath)

```typescript
import { ... } from '@satianurag/hiero-mirror-client/utils';
```

### Encoding

| Function | Signature | Description |
|----------|-----------|-------------|
| `base64ToHex` | `(b64: string) → string` | Base64 → `0x`-prefixed hex |
| `hexToBase64` | `(hex: string) → string` | Hex → Base64 |
| `bytesToHex` | `(bytes: Uint8Array) → string` | Bytes → hex |
| `hexToBytes` | `(hex: string) → Uint8Array` | Hex → bytes |

### Timestamps

| Function | Signature | Description |
|----------|-----------|-------------|
| `fromString` | `(ts: string) → HieroTimestamp` | Parse `"seconds.nanos"` |
| `fromDate` | `(date: Date) → HieroTimestamp` | Date → timestamp |
| `fromParts` | `(seconds: bigint, nanos: number) → HieroTimestamp` | Components → timestamp |
| `now` | `() → HieroTimestamp` | Current time |
| `toDate` | `(ts: HieroTimestamp) → Date` | Timestamp → Date |
| `compare` | `(a, b: HieroTimestamp) → -1 \| 0 \| 1` | Compare two timestamps |

### `HieroTimestamp` interface

```typescript
interface HieroTimestamp {
  readonly seconds: bigint;
  readonly nanos: number;
  toString(): string; // "seconds.nanos" (9-digit padded)
}
```

---

## Pagination Types

```typescript
interface Page<T> {
  data: T[];
  links: { next: string | null };
}

class Paginator<T> implements PromiseLike<Page<T>>, AsyncIterable<T> {
  pages(): AsyncIterable<Page<T>>;
}
```
