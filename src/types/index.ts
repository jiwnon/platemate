// 공통 타입 정의

export type Locale = 'ko' | 'en' | 'zh' | 'ja';

export interface Restaurant {
  id: string;
  name: string;
  name_i18n?: Record<Locale, string>;
  slug: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  name_i18n?: Record<Locale, string>;
  description?: string;
  description_i18n?: Record<Locale, string>;
  price: number;
  image_url?: string;
  docent_content?: string; // AI 도슨트 생성 내용
  sort_order: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  locale?: Locale;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  options?: string;
}

export interface PrivateReview {
  id: string;
  order_id: string;
  restaurant_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
