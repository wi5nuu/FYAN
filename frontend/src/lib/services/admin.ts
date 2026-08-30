import api from '@/lib/api';
import type {
  ApiResponse,
  DashboardStats,
  Order,
  Product,
  Category,
  Brand,
  Customer,
  Supplier,
  PaginatedResponse,
} from '@/types';

export const adminApi = {
  getDashboard: () =>
    api.get<ApiResponse<{ stats: DashboardStats }>>('/v1/admin/dashboard'),

  getRecentOrders: () =>
    api.get<ApiResponse<{ orders: Order[] }>>('/v1/admin/dashboard/recent-orders'),

  getRevenueChart: (days = 30) =>
    api.get<ApiResponse<{ ecommerce: Array<{ date: string; revenue: number }>; pos: Array<{ date: string; revenue: number }> }>>(
      `/v1/admin/dashboard/revenue-chart?days=${days}`
    ),

  getLowStock: () =>
    api.get<ApiResponse<{ products: Product[] }>>('/v1/admin/dashboard/low-stock'),

  getTopProducts: (limit = 5) =>
    api.get<ApiResponse<{ products: Product[] }>>(`/v1/admin/dashboard/top-products?limit=${limit}`),

  // Products
  getProducts: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>('/v1/admin/products', { params }),

  getProduct: (id: number) =>
    api.get<ApiResponse<{ product: Product }>>(`/v1/admin/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    api.post<ApiResponse<{ product: Product }>>('/v1/admin/products', data),

  updateProduct: (id: number, data: Partial<Product>) =>
    api.put<ApiResponse<{ product: Product }>>(`/v1/admin/products/${id}`, data),

  deleteProduct: (id: number) =>
    api.delete(`/v1/admin/products/${id}`),

  updateStock: (id: number, quantity: number) =>
    api.put(`/v1/admin/products/${id}/stock`, { stock_quantity: quantity }),

  // Categories
  getCategories: () =>
    api.get<ApiResponse<{ categories: Category[] | PaginatedResponse<Category> }>>('/v1/admin/categories'),

  createCategory: (data: Partial<Category>) =>
    api.post('/v1/admin/categories', data),

  updateCategory: (id: number, data: Partial<Category>) =>
    api.put(`/v1/admin/categories/${id}`, data),

  deleteCategory: (id: number) =>
    api.delete(`/v1/admin/categories/${id}`),

  // Brands
  getBrands: () =>
    api.get<ApiResponse<{ brands: Brand[] | PaginatedResponse<Brand> }>>('/v1/admin/brands'),

  createBrand: (data: Partial<Brand>) =>
    api.post('/v1/admin/brands', data),

  // Customers
  getCustomers: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ customers: PaginatedResponse<Customer> }>>('/v1/admin/customers', { params }),

  createCustomer: (data: Partial<Customer>) =>
    api.post('/v1/admin/customers', data),

  // Suppliers
  getSuppliers: () =>
    api.get<ApiResponse<{ suppliers: PaginatedResponse<Supplier> }>>('/v1/admin/suppliers'),

  // Orders
  getOrders: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ orders: PaginatedResponse<Order> }>>('/v1/admin/orders', { params }),

  getOrder: (orderNumber: string) =>
    api.get<ApiResponse<{ order: Order }>>(`/v1/admin/orders/${orderNumber}`),

  updateOrderStatus: (orderNumber: string, data: { status: string; payment_status?: string }) =>
    api.put(`/v1/admin/orders/${orderNumber}/status`, data),
};
