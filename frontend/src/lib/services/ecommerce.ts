import api from '@/lib/api';
import type { ApiResponse, Product, Cart, Order, PaginatedResponse, Review } from '@/types';

export const ecommerceApi = {
  getProducts: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>('/v1/ecommerce/products', { params }),

  getFeaturedProducts: () =>
    api.get<ApiResponse<{ products: Product[] }>>('/v1/ecommerce/products/featured'),

  searchProducts: (q: string) =>
    api.get<ApiResponse<{ products: PaginatedResponse<Product> }>>('/v1/ecommerce/products/search', { params: { q } }),

  getProduct: (slug: string) =>
    api.get<ApiResponse<{ product: Product }>>(`/v1/ecommerce/products/${slug}`),

  getProductReviews: (slug: string) =>
    api.get<ApiResponse<{ reviews: Review[] }>>(`/v1/ecommerce/products/${slug}/reviews`),

  getProductsByCategory: (slug: string) =>
    api.get<ApiResponse<{ products: PaginatedResponse<Product> }>>(`/v1/ecommerce/products/category/${slug}`),

  // Cart
  getCart: () =>
    api.get<ApiResponse<{ cart: Cart }>>('/v1/ecommerce/cart'),

  addToCart: (productId: number, quantity: number) =>
    api.post('/v1/ecommerce/cart', { product_id: productId, quantity }),

  updateCartItem: (itemId: number, quantity: number) =>
    api.put(`/v1/ecommerce/cart/${itemId}`, { quantity }),

  removeFromCart: (itemId: number) =>
    api.delete(`/v1/ecommerce/cart/${itemId}`),

  clearCart: () =>
    api.delete('/v1/ecommerce/cart'),

  // Orders
  getOrders: () =>
    api.get<ApiResponse<{ orders: PaginatedResponse<Order> }>>('/v1/ecommerce/orders'),

  getOrder: (orderNumber: string) =>
    api.get<ApiResponse<{ order: Order }>>(`/v1/ecommerce/orders/${orderNumber}`),

  createOrder: (data: {
    shipping_address: Record<string, string>;
    payment_method: string;
    notes?: string;
  }) =>
    api.post<ApiResponse<{ order: Order }>>('/v1/ecommerce/orders', data),

  cancelOrder: (orderNumber: string) =>
    api.post(`/v1/ecommerce/orders/${orderNumber}/cancel`),

  // Wishlist
  getWishlist: () =>
    api.get('/v1/ecommerce/wishlist'),

  addToWishlist: (productId: number) =>
    api.post('/v1/ecommerce/wishlist', { product_id: productId }),
};
