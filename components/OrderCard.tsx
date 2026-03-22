'use client';

import { Order, OrderStatus, STATUS_LABELS, STATUS_COLORS, SOURCE_OPTIONS } from '@/lib/types';
import { Pencil, Trash2, Clock, AlertTriangle, ImageIcon } from 'lucide-react';

interface Props {
  order: Order;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

function getDeadlineInfo(deadline: string) {
  if (!deadline) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)} gün gecikti`, danger: true };
  if (diff === 0) return { label: 'Bugün teslim!', danger: true };
  if (diff === 1) return { label: 'Yarın teslim!', danger: true };
  return { label: `${diff} gün kaldı`, danger: false };
}

function getSourceIcon(source: string) {
  const found = SOURCE_OPTIONS.find((s) => s.value === source);
  return found ? `${found.icon} ${found.label}` : `📦 ${source}`;
}

function Badge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
      active
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
    }`}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export default function OrderCard({ order, onEdit, onDelete, onStatusChange }: Props) {
  const deadline = getDeadlineInfo(order.deadline);
  const currencySymbol = order.currency === 'USD' ? '$' : '₺';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
      {order.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={order.image} alt={order.orderTitle} className="w-full" />
      ) : (
        <div className="w-full h-20 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-750 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-amber-300 dark:text-gray-600" />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{order.orderTitle}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.customerName}</p>
          </div>
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full px-2 py-0.5">
            {getSourceIcon(order.source)}
          </span>
          {order.income > 0 && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 rounded-full px-2 py-0.5">
              {currencySymbol}{order.income.toLocaleString('tr-TR')}
            </span>
          )}
        </div>

        {deadline && (
          <div className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 ${
            deadline.danger
              ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}>
            {deadline.danger ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            Son teslim: {deadline.label}
          </div>
        )}

        {/* Durum rozetleri */}
        <div className="flex flex-wrap gap-1.5">
          <Badge active={order.invoiced} activeLabel="🧾 Fatura Kesildi" inactiveLabel="🧾 Fatura Yok" />
          <Badge active={order.cargoDelivered} activeLabel="📦 Kargo Teslim" inactiveLabel="📦 Kargo Bekliyor" />
          <Badge active={order.satisfactionSent} activeLabel="😊 Mesaj Atıldı" inactiveLabel="😊 Mesaj Yok" />
        </div>

        {order.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{order.notes}</p>
        )}

        <div className="pt-1 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className="flex-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button onClick={() => onEdit(order)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-amber-600 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(order.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-500 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
