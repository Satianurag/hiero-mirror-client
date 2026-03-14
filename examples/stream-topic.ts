/**
 * Example: Stream topic messages in real time.
 *
 * Run with: node --import tsx examples/stream-topic.ts
 */

import { MirrorNodeClient } from '@satianurag/hiero-mirror-client';

const client = new MirrorNodeClient({ network: 'testnet' });

const TOPIC_ID = '0.0.7399425';

console.log(`Streaming messages from topic ${TOPIC_ID}...`);
console.log('Press Ctrl+C to stop.\n');

const stream = client.topics.stream(TOPIC_ID, {
  startTimestamp: '0',
  limit: 5,
});

for await (const message of stream) {
  console.log(`#${message.sequence_number}: ${message.message}`);
}

client.destroy();
