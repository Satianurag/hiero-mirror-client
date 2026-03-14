/**
 * Example: Paginate through recent transactions.
 *
 * Run with: node --import tsx examples/paginate-transactions.ts
 */

import { MirrorNodeClient } from '@satianurag/hiero-mirror-client';

const client = new MirrorNodeClient({ network: 'testnet' });

const paginator = client.transactions.list({ limit: 10 });

// Fetch two pages
for (let i = 0; i < 2; i++) {
  const page = await paginator.next();
  console.log(`\n--- Page ${i + 1} (${page.data.length} transactions) ---`);
  for (const tx of page.data) {
    console.log(`  ${tx.transaction_id} — ${tx.result}`);
  }

  if (!page.hasNext) {
    console.log('\nNo more pages.');
    break;
  }
}

client.destroy();
