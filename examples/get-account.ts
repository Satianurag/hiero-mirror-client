/**
 * Example: Fetch account details from the Hiero Mirror Node.
 *
 * Run with: node --import tsx examples/get-account.ts
 */

import { MirrorNodeClient } from '@satianurag/hiero-mirror-client';

const client = new MirrorNodeClient({ network: 'testnet' });

const account = await client.accounts.get('0.0.98');
console.log('Account ID:', account.account);
console.log('Balance:', account.balance);
console.log('Key:', account.key);

client.destroy();
