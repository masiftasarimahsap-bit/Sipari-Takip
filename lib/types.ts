export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export type OrderSource =
  | 'trendyol'
  | 'etsy'
  | 'instagram'
  | 'whatsapp'
  | 'yüz yüze'
  | 'diğer'
  | string;

export type Currency = 'TRY' | 'USD';

export interface Order {
  id: string;
  customerName: string;
  orderTitle: string;
  source: OrderSource;
  image: string; // base64
  notes: string;
  income: number;
  currency: Currency;
  deadline: string; // ISO date
  status: OrderStatus;
  invoiced: boolean;
  cargoDelivered: boolean;
  satisfactionSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '🆕 Beklemede',
  processing: '🛠️ Hazırlanıyor',
  completed: '✅ Tamamlandı',
  cancelled: '❌ İptal Edildi',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const SOURCE_OPTIONS: { value: OrderSource; label: string; icon: string }[] = [
  { value: 'etsy-ana', label: 'Etsy Ana Mağaza', icon: '🎨' },
  { value: 'etsy-saat', label: 'Etsy Saat Mağazası', icon: '⌚' },
  { value: 'etsy-ayak', label: 'Etsy Ayak Mağazası', icon: '🦶' },
  { value: 'shopier', label: 'Shopier', icon: '🛒' },
  { value: 'hepsiburada', label: 'HepsiBurada', icon: '🏪' },
  { value: 'diğer', label: 'Diğer', icon: '📦' },
];
