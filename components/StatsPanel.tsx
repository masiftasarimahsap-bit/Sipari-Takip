'use client';

import { Order } from '@/lib/types';
import { TrendingUp, CheckCircle, Clock, BarChart2 } from 'lucide-react';

interface Props {
  orders: Order[];
}

export default function StatsPanel({ orders }: Props) {
  const now = new Date();
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.income, 0);
  const monthIncome = thisMonth.filter(o => o.status === 'completed').reduce((s, o) => s + o.income, 0);
  const completed = orders.filter((o) => o.status === 'completed').length;
  const pending = orders.filter((o) => o.status === 'pending').length;
  const processing = orders.filter((o) => o.status === 'processing').length;
  const cancelled = orders.filter((o) => o.status === 'cancelled').length;
  const completionRate = orders.length > 0 ? Math.round((completed / orders.length) * 100) : 0;

  const sourceStats = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.source] = (acc[o.source] || 0) + 1;
    return acc;
  }, {});
  const topSources = Object.entries(sourceStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const card = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`${card} flex flex-col gap-1`}>
          <div className="flex items-center gap-2 text-amber-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Bu Ay Kazanç</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₺{monthIncome.toLocaleString('tr-TR')}
          </p>
          <p className="text-xs text-gray-500">{thisMonth.length} sipariş</p>
        </div>
        <div className={`${card} flex flex-col gap-1`}>
          <div className="flex items-center gap-2 text-emerald-500">
            <BarChart2 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Toplam Kazanç</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₺{totalIncome.toLocaleString('tr-TR')}
          </p>
          <p className="text-xs text-gray-500">{orders.length} toplam sipariş</p>
        </div>
        <div className={`${card} flex flex-col gap-1`}>
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Tamamlanan</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completed}</p>
          <p className="text-xs text-gray-500">%{completionRate} başarı oranı</p>
        </div>
        <div className={`${card} flex flex-col gap-1`}>
          <div className="flex items-center gap-2 text-blue-500">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Aktif</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{pending + processing}</p>
          <p className="text-xs text-gray-500">{pending} bekleyen · {processing} hazırlanıyor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={card}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Sipariş Durumları</h3>
          <div className="space-y-3">
            {[
              { label: 'Tamamlandı', value: completed, color: 'bg-green-500', total: orders.length },
              { label: 'Beklemede', value: pending, color: 'bg-yellow-400', total: orders.length },
              { label: 'Hazırlanıyor', value: processing, color: 'bg-blue-500', total: orders.length },
              { label: 'İptal Edildi', value: cancelled, color: 'bg-red-400', total: orders.length },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Kaynak Dağılımı</h3>
          {topSources.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Henüz sipariş yok</p>
          ) : (
            <div className="space-y-3">
              {topSources.map(([source, count]) => (
                <div key={source}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{source}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${(count / orders.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
