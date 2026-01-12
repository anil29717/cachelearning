import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

type StreamEvent =
  | { type: 'payment_captured'; paymentId: string; orderId: string | null; amount: number; currency: string; at: string }
  | { type: 'enrollment_created'; user_id: number; course_id: number; order_id: string | null; price?: number; title?: string; at: string };

export default function AdminPurchaseStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const backendBase = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const socket = io(backendBase, { transports: ['websocket'], reconnection: true });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('payment_captured', (payload: any) => {
      const ev: StreamEvent = { type: 'payment_captured', paymentId: payload.paymentId, orderId: payload.orderId || null, amount: Number(payload.amount || 0), currency: String(payload.currency || 'INR'), at: payload.at || new Date().toISOString() };
      setEvents(prev => [ev, ...prev].slice(0, 200));
    });
    socket.on('enrollment_created', (payload: any) => {
      const ev: StreamEvent = { type: 'enrollment_created', user_id: Number(payload.user_id), course_id: Number(payload.course_id), order_id: payload.order_id || null, price: payload.price !== undefined ? Number(payload.price) : undefined, title: payload.title, at: payload.at || new Date().toISOString() };
      setEvents(prev => [ev, ...prev].slice(0, 200));
    });
    return () => {
      socket.close();
    };
  }, [backendBase]);

  const items = useMemo(() => events.map((e, idx) => ({ id: idx, e })), [events]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Purchase Stream</CardTitle>
          <Badge variant={connected ? 'default' : 'outline'}>{connected ? 'Live' : 'Offline'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-gray-600">No events yet</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-auto">
            {items.map(item => {
              const e = item.e;
              return (
                <div key={item.id} className="flex items-center justify-between p-2 rounded border border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <Badge variant={e.type === 'payment_captured' ? 'default' : 'secondary'}>{e.type === 'payment_captured' ? 'Payment' : 'Enrollment'}</Badge>
                    {e.type === 'payment_captured' ? (
                      <div className="text-sm">
                        <span className="font-medium">₹{(e.amount / 100).toFixed(2)}</span>
                        <span className="text-gray-500 ml-2">Payment ID: {e.paymentId}</span>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <span className="font-medium">Course #{e.course_id}</span>
                        {e.title ? <span className="text-gray-500 ml-2">{e.title}</span> : null}
                        {e.price !== undefined ? <span className="text-gray-500 ml-2">₹{e.price}</span> : null}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{new Date(e.at).toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
