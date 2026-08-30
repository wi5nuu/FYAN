export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles: Array<{ name: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
  parent_id?: number;
  meta_title?: string;
  meta_description?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description?: string;
  short_description?: string;
  price: number;
  cost_price?: number;
  discount_price?: number;
  stock_quantity: number;
  min_stock?: number;
  category_id?: number;
  brand_id?: number;
  supplier_id?: number;
  type?: string;
  is_active?: boolean;
  is_featured?: boolean;
  category?: Category;
  brand?: Brand;
  images?: string[];
  average_rating?: number;
  reviews_count?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total?: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  shipping_address?: Record<string, string>;
  notes?: string;
  created_at: string;
  user?: User;
  items?: OrderItem[];
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  is_active?: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  notes?: string;
  is_active?: boolean;
}

export interface PosTransaction {
  id: number;
  transaction_number: string;
  customer_id?: number;
  cashier_id: number;
  status: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_amount: number;
  change_amount: number;
  created_at: string;
  customer?: Customer;
  items?: Array<{ id: number; product_id: number; quantity: number; price: number; total: number; product?: Product }>;
}

export interface PosRegister {
  id: number;
  name: string;
  location?: string;
  is_active: boolean;
  opening_balance: number;
  closing_balance?: number;
  opened_at?: string;
  closed_at?: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  type: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  created_at: string;
  customer?: Customer;
  items?: Array<{ id: number; description: string; quantity: number; unit_price: number; total: number }>;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  expected_date?: string;
  created_at: string;
  supplier?: Supplier;
  items?: Array<{ id: number; product_id: number; quantity: number; unit_price: number; total: number; product?: Product }>;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  category_id?: number;
  author_id?: number;
  views_count?: number;
  is_featured?: boolean;
  published_at?: string;
  created_at: string;
  author?: User;
  category?: Category;
  tags?: string[];
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  template?: string;
  published_at?: string;
  created_at: string;
  category_id?: number;
  author_id?: number;
  sort_order?: number;
  is_homepage?: boolean;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface DashboardStats {
  users: number;
  active_users: number;
  products: number;
  active_products: number;
  low_stock_products: number;
  orders: number;
  pending_orders: number;
  revenue: number;
  pos_transactions: number;
  pos_revenue: number;
  invoices: number;
  overdue_invoices: number;
  posts: number;
  published_posts: number;
  customers: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment?: string;
  status: string;
  user?: User;
  created_at: string;
}
