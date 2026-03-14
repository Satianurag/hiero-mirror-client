/**
 * Example: Paginate through tokens on the Hiero Mirror Node.
 *
 * Run with: node --import tsx examples/list-tokens.ts
 */

import { MirrorNodeClient } from '@satianurag/hiero-mirror-client';

const client = new MirrorNodeClient({ network: 'testnet' });

const paginator = client.tokens.list({ limit: 5 });
const page = await paginator.next();

console.log(`Fetched ${page.data.length} tokens:`);
for (const token of page.data) {
  console.log(`  ${token.token_id} — ${token.name} (${token.symbol})`);
}

client.destroy();
