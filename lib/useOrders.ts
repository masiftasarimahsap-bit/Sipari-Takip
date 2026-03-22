'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus, Currency } from './types';

const STORAGE_KEY = 'masif_siparis_orders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // invoiced alanı olmayan eski kayıtlar için default false
        setOrders(parsed.map((o: Partial<Order> & { id: string; createdAt: string; updatedAt: string }) => ({
          invoiced: false,
          cargoDelivered: false,
          satisfactionSent: false,
          currency: 'TRY' as Currency,
          ...o,
        } as Order)));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, loaded]);

  const addOrder = useCallback((data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const order: Order = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const updateOrder = useCallback((id: string, data: Partial<Omit<Order, 'id' | 'createdAt'>>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o))
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    updateOrder(id, { status });
  }, [updateOrder]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masif_siparisler_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [orders]);

  const exportCSV = useCallback(() => {
    const headers = ['Sipariş Başlığı', 'Müşteri', 'Kaynak', 'Durum', 'Kazanç', 'Para Birimi', 'Son Teslim Tarihi', 'Fatura', 'Kargo', 'Memnuniyet', 'Notlar', 'Oluşturulma'];
    const rows = orders.map((o) => [
      o.orderTitle,
      o.customerName,
      o.source,
      o.status,
      o.income,
      o.currency,
      o.deadline,
      o.invoiced ? 'Evet' : 'Hayır',
      o.cargoDelivered ? 'Evet' : 'Hayır',
      o.satisfactionSent ? 'Evet' : 'Hayır',
      o.notes.replace(/,/g, ' '),
      o.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masif_siparisler_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [orders]);

  return { orders, loaded, addOrder, updateOrder, deleteOrder, updateStatus, exportJSON, exportCSV };
}
