import { ServerResponse } from "http";

const subscribers = new Map<string, Set<ServerResponse>>();

export const addRealtimeClient = (clientId: string, res: ServerResponse) => {
  if (!subscribers.has(clientId)) {
    subscribers.set(clientId, new Set());
  }
  subscribers.get(clientId)!.add(res);
  console.log(`[Realtime SSE] Client connected for client_id=${clientId}. Total listeners: ${subscribers.get(clientId)!.size}`);
};

export const removeRealtimeClient = (clientId: string, res: ServerResponse) => {
  const clientSet = subscribers.get(clientId);
  if (clientSet) {
    clientSet.delete(res);
    console.log(`[Realtime SSE] Client disconnected for client_id=${clientId}. Remaining: ${clientSet.size}`);
    if (clientSet.size === 0) {
      subscribers.delete(clientId);
    }
  }
};

export const broadcastRealtimeEvent = (
  clientId: string,
  payload: { type: string; entity?: string; action?: string; [key: string]: any }
) => {
  const clientSet = subscribers.get(clientId);
  if (!clientSet || clientSet.size === 0) {
    return;
  }

  const data = JSON.stringify({
    ...payload,
    timestamp: Date.now(),
  });

  const msg = `data: ${data}\n\n`;

  for (const res of Array.from(clientSet)) {
    try {
      res.write(msg);
    } catch {
      clientSet.delete(res);
    }
  }
  console.log(`[Realtime SSE] Broadcasted '${payload.type}:${payload.entity || ""}' to ${clientSet.size} client(s).`);
};
