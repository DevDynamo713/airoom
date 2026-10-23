export type ModelStatus = 'idle' | 'loading' | 'ready' | 'inference' | 'error';
export type ModelType = 'llm' | 'vision' | 'embedding' | 'diffusion' | 'audio';
export interface Model { id: string; name: string; type: ModelType; provider: string; status: ModelStatus; tokensPerSec: number; totalCalls: number; avgLatencyMs: number; costPerToken: number }
export function modelHealth(m: Model): number {
  if (m.status === 'error') return 0;
  if (m.status === 'loading') return 25;
  if (m.status === 'idle') return 50;
  if (m.status === 'inference') return 75;
  return 100;
}
export function fleetHealth(models: Model[]): number {
  if (models.length === 0) return 100;
  return Math.round(models.reduce((s, m) => s + modelHealth(m), 0) / models.length);
}
export function totalThroughput(models: Model[]): number {
  return models.reduce((s, m) => s + m.tokensPerSec, 0);
}
export function formatModel(m: Model): string { return `${m.name} [${m.type}/${m.provider}] ${m.status} ${m.tokensPerSec}tok/s ${m.avgLatencyMs}ms`; }