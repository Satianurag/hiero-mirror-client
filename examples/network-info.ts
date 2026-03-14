/**
 * Example: Fetch network information (exchange rate, supply, stake).
 *
 * Run with: node --import tsx examples/network-info.ts
 */

import { MirrorNodeClient } from '@satianurag/hiero-mirror-client';

const client = new MirrorNodeClient({ network: 'testnet' });

const [rate, supply, stake] = await Promise.all([
  client.network.getExchangeRate(),
  client.network.getSupply(),
  client.network.getStake(),
]);

console.log('Exchange Rate:');
console.log(
  `  Current: ${rate.current_rate.cent_equivalent} cents / ${rate.current_rate.hbar_equivalent} hbar`,
);

console.log('\nSupply:');
console.log(`  Total: ${supply.total_supply}`);
console.log(`  Released: ${supply.released_supply}`);

console.log('\nStake:');
console.log(`  Staking period:`, stake.staking_period);

client.destroy();
