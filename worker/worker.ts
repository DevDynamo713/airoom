export interface Env { AIROOM_DO: DurableObjectNamespace; }
export class AIRoomDO {
  private state: DurableObjectState;
  private models: Map<string, any> = new Map();
  private websockets: WebSocket[] = [];
  constructor(state: DurableObjectState, env: Env) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (url.pathname === '/models' && request.method === 'GET') {
      return Response.json(Array.from(this.models.values()));
    }
    if (url.pathname === '/model' && request.method === 'POST') {
      const data = await request.json();
      const model = { ...data, id: crypto.randomUUID(), totalCalls: 0, avgLatencyMs: 0 };
      this.models.set(model.id, model);
      this.broadcast(JSON.stringify({ type: 'model', data: model }));
      return Response.json({ success: true, model });
    }
    return new Response('Not Found', { status: 404 });
  }
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) { }
  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) { this.websockets = this.websockets.filter(w => w !== ws); }
  private broadcast(msg: string) { for (const ws of this.websockets) { if (ws.readyState === 1) ws.send(msg); } }
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.AIROOM_DO.idFromName(url.pathname);
    const stub = env.AIROOM_DO.get(id);
    return stub.fetch(request);
  }
}