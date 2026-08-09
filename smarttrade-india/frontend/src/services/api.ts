import axios from 'axios';
import type { ApiResponse } from '@smarttrade/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function apiGet<T>(url: string): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url);
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed');
  return data.data as T;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed');
  return data.data as T;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed');
  return data.data as T;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed');
  return data.data as T;
}
