export const API_VERSION = 'v1' as const;
export type Role = 'viewer' | 'admin';
export interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
}
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}
export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'created' | 'cancelled';
}
export interface ApiError {
  status: number;
  code: string;
  message: string;
  correlationId: string;
}
