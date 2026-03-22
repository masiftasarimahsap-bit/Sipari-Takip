'use client';

import { useState, useRef } from 'react';
import { Order, OrderStatus, OrderSource, Currency, SOURCE_OPTIONS, STATUS_LABELS } from '@/lib/types';
import { X, Upload } from 'lucide-react';

interface Props {
  initial?: Order;
  onSave: (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        className={`w-10 h-6 rounded-full transition-colors flex items-center ${value ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
        onClick={onChange}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

export default function OrderForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    customerName: initial?.customerName ?? '',
    orderTitle: initial?.orderTitle ?? '',
    source: (initial?.source ?? 'etsy-ana') as OrderSource,
    customSource: '',
    image: initial?.image ?? '',
    notes: initial?.notes ?? '',
    income: initial?.income ?? 0,
    currency: (initial?.currency ?? 'TRY') as Currency,
    deadline: initial?.deadline ?? '',
    status: (initial?.status ?? 'pending') as OrderStatus,
    invoiced: initial?.invoiced ?? false,
    cargoDelivered: initial?.cargoDelivered ?? false,
    satisfactionSent: initial?.satisfactionSent ?? false,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const source = form.source === 'diğer' && form.customSource.trim()
      ? form.customSource.trim()
      : form.source;
    onSave({
      customerName: form.customerName,
      orderTitle: form.orderTitle,
      source,
      image: form.image,
      notes: form.notes,
      income: Number(form.income),
      currency: form.currency,
      deadline: form.deadline,
      status: form.status,
      invoiced: form.invoiced,
      cargoDelivered: form.cargoDelivered,
      satisfactionSent: form.satisfactionSent,
    });
    onClose();
  }

  const inp = 'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500';
  const lbl = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {initial ? 'Siparişi Düzenle' : 'Yeni Sipariş Ekle'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Müşteri Adı *</label>
              <input className={inp} required value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                placeholder="Adı Soyadı" />
            </div>
            <div>
              <label className={lbl}>Sipariş Başlığı *</label>
              <input className={inp} required value={form.orderTitle}
                onChange={(e) => setForm((f) => ({ ...f, orderTitle: e.target.value }))}
                placeholder="Ürün adı..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Sipariş Kaynağı</label>
              <select className={inp} value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as OrderSource }))}>
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>
            {form.source === 'diğer' && (
              <div>
                <label className={lbl}>Özel Kaynak</label>
                <input className={inp} value={form.customSource}
                  onChange={(e) => setForm((f) => ({ ...f, customSource: e.target.value }))}
                  placeholder="Platform adı..." />
              </div>
            )}
            <div>
              <label className={lbl}>Durum</label>
              <select className={inp} value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrderStatus }))}>
                {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kazanç + Para Birimi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Kazanç</label>
              <div className="flex gap-2">
                <input className={`${inp} flex-1`} type="number" min="0" step="0.01" value={form.income}
                  onChange={(e) => setForm((f) => ({ ...f, income: parseFloat(e.target.value) || 0 }))} />
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm font-semibold shrink-0">
                  {(['TRY', 'USD'] as Currency[]).map((c) => (
                    <button key={c} type="button"
                      onClick={() => setForm((f) => ({ ...f, currency: c }))}
                      className={`px-3 py-2 transition-colors ${
                        form.currency === c
                          ? 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}>
                      {c === 'TRY' ? '₺' : '$'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className={lbl}>Son Teslim Tarihi</label>
              <input className={inp} type="date" value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className={lbl}>Notlar</label>
            <textarea className={`${inp} resize-none`} rows={3} value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Sipariş detayları, özel istekler..." />
          </div>

          <div>
            <label className={lbl}>Ürün Fotoğrafı</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            {form.image ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="Önizleme" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, image: '' }))}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 hover:border-amber-500 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400">Fotoğraf yükle</span>
              </button>
            )}
          </div>

          {/* Toggle Grubu */}
          <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Sipariş Durumu</p>
            <Toggle value={form.invoiced} onChange={() => setForm((f) => ({ ...f, invoiced: !f.invoiced }))} label="🧾 Fatura Kesildi" />
            <Toggle value={form.cargoDelivered} onChange={() => setForm((f) => ({ ...f, cargoDelivered: !f.cargoDelivered }))} label="📦 Kargo Teslim Edildi" />
            <Toggle value={form.satisfactionSent} onChange={() => setForm((f) => ({ ...f, satisfactionSent: !f.satisfactionSent }))} label="😊 Memnuniyet Mesajı Atıldı" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              İptal
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
              {initial ? 'Kaydet' : 'Sipariş Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
