"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [models, setModels] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('llm');
  const [provider, setProvider] = useState('openai');
  const [tokensPerSec, setTokensPerSec] = useState('100');
  const [costPerToken, setCostPerToken] = useState('0.0001');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://airoom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'model') {
        setModels(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://airoom.devdynamo713.com/room/${params.id}/models`);
      if (res.ok) setModels(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addModel = async () => {
    const data = { name, type, provider, status: 'ready', tokensPerSec: parseInt(tokensPerSec), costPerToken: parseFloat(costPerToken) };
    await fetch(`https://airoom.devdynamo713.com/room/${params.id}/model`, { method: 'POST', body: JSON.stringify(data) });
    setName(''); setTokensPerSec('100'); setCostPerToken('0.0001');
  };
  const statusColor: Record<string, string> = { ready: '#4ade80', loading: '#fbbf24', idle: '#60a5fa', inference: '#a78bfa', error: '#f87171' };
  const healthScore = models.length > 0 ? Math.round(models.reduce((s, m) => {
    if (m.status === 'error') return s;
    if (m.status === 'loading') return s + 25;
    if (m.status === 'idle') return s + 50;
    if (m.status === 'inference') return s + 75;
    return s + 100;
  }, 0) / models.length) : 100;
  const totalTps = models.reduce((s, m) => s + m.tokensPerSec, 0);
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>AIRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, border: `1px solid ${healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171'}`, borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Fleet Health</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171' }}>{healthScore}%</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Total Throughput</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#60a5fa' }}>{totalTps} tok/s</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Models Registered</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#a78bfa' }}>{models.length}</div>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="model name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <select value={type} onChange={(e) => setType(e.target.value)} className="type-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="llm">llm</option>
          <option value="vision">vision</option>
          <option value="embedding">embedding</option>
          <option value="diffusion">diffusion</option>
          <option value="audio">audio</option>
        </select>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="provider-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="openai">openai</option>
          <option value="anthropic">anthropic</option>
          <option value="google">google</option>
          <option value="meta">meta</option>
          <option value="self-hosted">self-hosted</option>
        </select>
        <input value={tokensPerSec} onChange={(e) => setTokensPerSec(e.target.value)} placeholder="tok/s" className="tps-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa', width: 70 }} />
        <input value={costPerToken} onChange={(e) => setCostPerToken(e.target.value)} placeholder="$ / token" className="cost-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa', width: 90 }} />
        <button className="add-btn" onClick={addModel} disabled={!name.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Register Model</button>
      </div>
      <div className="model-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {models.map(m => (
          <div key={m.id} style={{ padding: 16, border: `1px solid ${statusColor[m.status]}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: statusColor[m.status] }}>{m.name}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>{m.type} / {m.provider}</div>
            <div style={{ marginTop: 4, color: '#60a5fa', fontSize: 13 }}>{m.tokensPerSec} tok/s | ${m.costPerToken}/tok</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: statusColor[m.status], textTransform: 'uppercase' }}>{m.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}