'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus, Currency } from './types';
import { supabase } from './supabase';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Verileri Supabase'den yükle
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data.map(rowToOrder));
      }
      setLoaded(true);
    }
    load();
  }, []);

  const addOrder = useCallback(async (input: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = uuidv4();
    const order: Order = { ...input, id, createdAt: now, updatedAt: now };

    const { error } = await supabase.from('orders').insert(orderToRow(order));
    if (!error) setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const updateOrder = useCallback(async (id: string, data: Partial<Omit<Order, 'id' | 'createdAt'>>) => {
    const updatedAt = new Date().toISOString();
    const { error } = await supabase
      .from('orders')
      .update({ ...partialToRow(data), updated_at: updatedAt })
      .eq('id', id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...data, updatedAt } : o))
      );
    }
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) setOrders((prev) => prev.filter((o) => o.id !== id));
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
      o.orderTitle, o.customerName, o.source, o.status, o.income, o.currency,
      o.deadline, o.invoiced ? 'Evet' : 'Hayır', o.cargoDelivered ? 'Evet' : 'Hayır',
      o.satisfactionSent ? 'Evet' : 'Hayır', o.notes.replace(/,/g, ' '), o.createdAt,
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

// ----- Dönüşüm yardımcıları -----

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    customerName: (row.customer_name as string) ?? '',
    orderTitle: (row.order_title as string) ?? '',
    source: (row.source as string) ?? 'diğer',
    image: (row.image as string) ?? '',
    notes: (row.notes as string) ?? '',
    income: (row.income as number) ?? 0,
    currency: ((row.currency as string) ?? 'TRY') as Currency,
    deadline: (row.deadline as string) ?? '',
    status: (row.status as OrderStatus) ?? 'pending',
    invoiced: (row.invoiced as boolean) ?? false,
    cargoDelivered: (row.cargo_delivered as boolean) ?? false,
    satisfactionSent: (row.satisfaction_sent as boolean) ?? false,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

function orderToRow(o: Order) {
  return {
    id: o.id,
    customer_name: o.customerName,
    order_title: o.orderTitle,
    source: o.source,
    image: o.image,
    notes: o.notes,
    income: o.income,
    currency: o.currency,
    deadline: o.deadline || null,
    status: o.status,
    invoiced: o.invoiced,
    cargo_delivered: o.cargoDelivered,
    satisfaction_sent: o.satisfactionSent,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
  };
}

function partialToRow(data: Partial<Omit<Order, 'id' | 'createdAt'>>) {
  const row: Record<string, unknown> = {};
  if (data.customerName !== undefined) row.customer_name = data.customerName;
  if (data.orderTitle !== undefined) row.order_title = data.orderTitle;
  if (data.source !== undefined) row.source = data.source;
  if (data.image !== undefined) row.image = data.image;
  if (data.notes !== undefined) row.notes = data.notes;
  if (data.income !== undefined) row.income = data.income;
  if (data.currency !== undefined) row.currency = data.currency;
  if (data.deadline !== undefined) row.deadline = data.deadline || null;
  if (data.status !== undefined) row.status = data.status;
  if (data.invoiced !== undefined) row.invoiced = data.invoiced;
  if (data.cargoDelivered !== undefined) row.cargo_delivered = data.cargoDelivered;
  if (data.satisfactionSent !== undefined) row.satisfaction_sent = data.satisfactionSent;
  return row;
}
