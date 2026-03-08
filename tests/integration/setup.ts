/**
 * Integration test setup — shared client instance for all integration tests.
 */
import { MirrorNodeClient } from '../../src/client.js';

export const client = new MirrorNodeClient({
  network: 'testnet',
  rateLimitRps: 10, // Be respectful to testnet
});

/**
 * Well-known testnet account (treasury).
 */
export const KNOWN_ACCOUNT = '0.0.2';

/**
 * Well-known testnet account with tokens.
 * Account 0.0.800 is the Hedera node account that holds many tokens.
 */
export const KNOWN_TOKEN_HOLDER = '0.0.800';

/**
 * Timeout for integration tests (network dependent).
 */
export const INTEGRATION_TIMEOUT = 30_000;
