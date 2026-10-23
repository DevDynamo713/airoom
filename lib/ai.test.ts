import { describe, it, expect } from 'vitest';
import { modelHealth, fleetHealth, totalThroughput, formatModel } from './ai';
describe('ai', () => {
  it('modelHealth ready = 100', () => {
    const m = { id: '1', name: 'gpt-4', type: 'llm', provider: 'openai', status: 'ready', tokensPerSec: 100, totalCalls: 50, avgLatencyMs: 200, costPerToken: 0.0001 };
    expect(modelHealth(m)).toBe(100);
  });
  it('modelHealth error = 0', () => {
    const m = { id: '2', name: 'gpt-4', type: 'llm', provider: 'openai', status: 'error', tokensPerSec: 0, totalCalls: 0, avgLatencyMs: 0, costPerToken: 0.0001 };
    expect(modelHealth(m)).toBe(0);
  });
  it('modelHealth loading = 25', () => {
    const m = { id: '3', name: 'gpt-4', type: 'llm', provider: 'openai', status: 'loading', tokensPerSec: 0, totalCalls: 0, avgLatencyMs: 0, costPerToken: 0.0001 };
    expect(modelHealth(m)).toBe(25);
  });
  it('fleetHealth averages correctly', () => {
    const models = [
      { id: '1', name: 'gpt-4', type: 'llm', provider: 'openai', status: 'ready', tokensPerSec: 100, totalCalls: 50, avgLatencyMs: 200, costPerToken: 0.0001 },
      { id: '2', name: 'claude', type: 'llm', provider: 'anthropic', status: 'error', tokensPerSec: 0, totalCalls: 0, avgLatencyMs: 0, costPerToken: 0.0001 }
    ];
    expect(fleetHealth(models)).toBe(50);
  });
  it('totalThroughput sums correctly', () => {
    const models = [
      { id: '1', name: 'gpt-4', type: 'llm', provider: 'openai', status: 'ready', tokensPerSec: 100, totalCalls: 50, avgLatencyMs: 200, costPerToken: 0.0001 },
      { id: '2', name: 'claude', type: 'llm', provider: 'anthropic', status: 'ready', tokensPerSec: 80, totalCalls: 30, avgLatencyMs: 250, costPerToken: 0.0001 }
    ];
    expect(totalThroughput(models)).toBe(180);
  });
  it('formats correctly', () => {
    const m = { id: '1', name: 'gpt-4', type: 'llm', provider: 'openai', status: 'ready', tokensPerSec: 100, totalCalls: 50, avgLatencyMs: 200, costPerToken: 0.0001 };
    expect(formatModel(m)).toBe('gpt-4 [llm/openai] ready 100tok/s 200ms');
  });
});