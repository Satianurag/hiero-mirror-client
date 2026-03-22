import { describe, expect, it, vi } from 'vitest';
import { MirrorNodeClient } from '../../src/client.js';
import { AccountsResource } from '../../src/resources/accounts.js';
import { BalancesResource } from '../../src/resources/balances.js';
import { BlocksResource } from '../../src/resources/blocks.js';
import { ContractsResource } from '../../src/resources/contracts.js';
import { NetworkResource } from '../../src/resources/network.js';
import { SchedulesResource } from '../../src/resources/schedules.js';
import { TokensResource } from '../../src/resources/tokens.js';
import { TopicsResource } from '../../src/resources/topics.js';
import { TransactionsResource } from '../../src/resources/transactions.js';

describe('MirrorNodeClient', () => {
  it('defaults to mainnet when no options are provided', () => {
    const client = new MirrorNodeClient();
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('uses mainnet URL for network: mainnet', () => {
    const client = new MirrorNodeClient({ network: 'mainnet' });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('uses testnet URL for network: testnet', () => {
    const client = new MirrorNodeClient({ network: 'testnet' });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('uses previewnet URL for network: previewnet', () => {
    const client = new MirrorNodeClient({ network: 'previewnet' });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('uses custom baseUrl when provided', () => {
    const client = new MirrorNodeClient({ baseUrl: 'https://custom-mirror.example.com' });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('baseUrl takes precedence over network', () => {
    const client = new MirrorNodeClient({
      baseUrl: 'https://custom.example.com',
      network: 'testnet',
    });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('initializes all 9 resource groups', () => {
    const client = new MirrorNodeClient({ network: 'testnet' });
    expect(client.accounts).toBeInstanceOf(AccountsResource);
    expect(client.balances).toBeInstanceOf(BalancesResource);
    expect(client.blocks).toBeInstanceOf(BlocksResource);
    expect(client.contracts).toBeInstanceOf(ContractsResource);
    expect(client.network).toBeInstanceOf(NetworkResource);
    expect(client.schedules).toBeInstanceOf(SchedulesResource);
    expect(client.tokens).toBeInstanceOf(TokensResource);
    expect(client.topics).toBeInstanceOf(TopicsResource);
    expect(client.transactions).toBeInstanceOf(TransactionsResource);
    client.destroy();
  });

  it('passes timeout option through to HttpClient', () => {
    const client = new MirrorNodeClient({ network: 'testnet', timeout: 5000 });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('passes maxRetries option through to HttpClient', () => {
    const client = new MirrorNodeClient({ network: 'testnet', maxRetries: 5 });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('passes rateLimitRps option through to HttpClient', () => {
    const client = new MirrorNodeClient({ network: 'testnet', rateLimitRps: 10 });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('passes logger option through to HttpClient', () => {
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const client = new MirrorNodeClient({ network: 'testnet', logger });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('passes custom fetch through to HttpClient', () => {
    const customFetch = vi.fn();
    const client = new MirrorNodeClient({ network: 'testnet', fetch: customFetch as never });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('passes beforeRequest hooks through to HttpClient', () => {
    const hook = vi.fn();
    const client = new MirrorNodeClient({ network: 'testnet', beforeRequest: [hook] });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('passes afterResponse hooks through to HttpClient', () => {
    const hook = vi.fn();
    const client = new MirrorNodeClient({ network: 'testnet', afterResponse: [hook] });
    expect(client.httpClient).toBeDefined();
    client.destroy();
  });

  it('destroy() calls httpClient.destroy()', () => {
    const client = new MirrorNodeClient({ network: 'testnet' });
    const destroySpy = vi.spyOn(client.httpClient, 'destroy');
    client.destroy();
    expect(destroySpy).toHaveBeenCalledOnce();
  });
});
