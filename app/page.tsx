'use client';

import { useState, useMemo } from 'react';
import { useOrders } from '@/lib/useOrders';
import { Order, OrderStatus, STATUS_LABELS } from '@/lib/types';
import OrderCard from '@/components/OrderCard';
import OrderForm from '@/components/OrderForm';
import StatsPanel from '@/components/StatsPanel';
import { Plus, Search, Download, BarChart2, Package, Moon, Sun, SortAsc, SortDesc } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

type Tab = 'orders' | 'stats';
type SortField = 'createdAt' | 'deadline' | 'income';

function App() {
  const { orders, loaded, addOrder, updateOrder, deleteOrder, updateStatus, exportJSON, exportCSV } = useOrders();
  const [tab, setTab] = useState<Tab>('orders');
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [dark, setDark] = useState(false);

  function toggleDark() {
    setDark((d) => {
      document.documentElement.classList.toggle('dark', !d);
      return !d;
    });
  }

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== 'all') list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o.orderTitle.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.notes.toLowerCase().includes(q) ||
        o.source.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va: number, vb: number;
      if (sortField === 'income') { va = a.income; vb = b.income; }
      else if (sortField === 'deadline') {
        va = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        vb = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      } else {
        va = new Date(a.createdAt).getTime();
        vb = new Date(b.createdAt).getTime();
      }
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [orders, statusFilter, search, sortField, sortAsc]);

  function handleEdit(order: Order) {
    setEditOrder(order);
    setShowForm(true);
  }

  function handleSave(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editOrder) {
      updateOrder(editOrder.id, data);
    } else {
      addOrder(data);
    }
    setEditOrder(null);
  }

  function handleClose() {
    setShowForm(false);
    setEditOrder(null);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Masif Special
              </h1>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium -mt-0.5">Sipariş Takibi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="relative group">
              <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                <Download className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden min-w-[140px] z-50">
                <button onClick={exportJSON} className="px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  JSON İndir
                </button>
                <button onClick={exportCSV} className="px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  CSV İndir
                </button>
              </div>
            </div>
            <button onClick={() => { setEditOrder(null); setShowForm(true); }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Sipariş</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {([['orders', Package, 'Siparişler'], ['stats', BarChart2, 'İstatistikler']] as const).map(([t, Icon, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'stats' ? (
          <StatsPanel orders={orders} />
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Sipariş, müşteri, kaynak ara..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="all">Tüm Durumlar</option>
                  {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)}
                  className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="createdAt">Tarihe Göre</option>
                  <option value="deadline">Termine Göre</option>
                  <option value="income">Kazanca Göre</option>
                </select>
                <button onClick={() => setSortAsc((a) => !a)}
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-amber-600">
                  {sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Orders Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">📭</span>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {orders.length === 0 ? 'Henüz sipariş yok' : 'Filtrelere uyan sipariş bulunamadı'}
                </p>
                {orders.length === 0 && (
                  <button onClick={() => setShowForm(true)}
                    className="mt-4 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                    <Plus className="w-4 h-4" />
                    İlk Siparişi Ekle
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((order) => (
                  <OrderCard key={order.id} order={order}
                    onEdit={handleEdit}
                    onDelete={deleteOrder}
                    onStatusChange={updateStatus} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile FAB */}
      <button onClick={() => { setEditOrder(null); setShowForm(true); }}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40">
        <Plus className="w-6 h-6" />
      </button>

      {showForm && (
        <OrderForm
          initial={editOrder ?? undefined}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
