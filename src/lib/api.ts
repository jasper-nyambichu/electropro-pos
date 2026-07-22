import { authHeaders, logout } from './auth';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// ─── Errors ───────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });

  if (res.status === 401) {
    logout();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (res.status === 403) {
    throw new ApiError('You do not have permission to perform this action.', 403);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(body.message || 'Invalid email or password', res.status);
      }
      return res.json();
    }),

  register: (data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role: string;
  }) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(body.message || 'Registration failed', res.status);
      }
      return res.json();
    }),
};

// ─── Categories ───────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export const categoryApi = {
  getAll: () => request<CategoryResponse[]>('/categories'),
  getById: (id: number) => request<CategoryResponse>(`/categories/${id}`),
  create: (data: CategoryRequest) =>
    request<CategoryResponse>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CategoryRequest) =>
    request<CategoryResponse>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const productApi = {
  getAll: () => request<ProductResponse[]>('/products'),
  getById: (id: number) => request<ProductResponse>(`/products/${id}`),
  search: (name: string) =>
    request<ProductResponse[]>(`/products/search/${encodeURIComponent(name)}`),
  getLowStock: () => request<ProductResponse[]>('/products/low-stock'),
  create: (data: ProductRequest) =>
    request<ProductResponse>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ProductRequest) =>
    request<ProductResponse>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const customerApi = {
  getAll: () => request<CustomerResponse[]>('/customers'),
  getById: (id: number) => request<CustomerResponse>(`/customers/${id}`),
  search: (name: string) =>
    request<CustomerResponse[]>(`/customers/search/${encodeURIComponent(name)}`),
  create: (data: CustomerRequest) =>
    request<CustomerResponse>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CustomerRequest) =>
    request<CustomerResponse>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/customers/${id}`, { method: 'DELETE' }),
  getWarranties: (id: number) =>
    request<WarrantyResponse[]>(`/customers/${id}/warranties`),
};

// ─── Sales ────────────────────────────────────────────────────────────────────

export const saleApi = {
  getAll: () => request<SaleResponse[]>('/sales'),
  getById: (id: number) => request<SaleResponse>(`/sales/${id}`),
  getByReceipt: (receiptNumber: string) =>
    request<SaleResponse>(`/sales/receipt/${encodeURIComponent(receiptNumber)}`),
  create: (data: SaleRequest) =>
    request<SaleResponse>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  refund: (id: number) =>
    request<SaleResponse>(`/sales/${id}/refund`, { method: 'PATCH' }),
};

// ─── Sale Items ───────────────────────────────────────────────────────────────

export const saleItemApi = {
  create: (data: SaleItemRequest) =>
    request<SaleItemResponse>('/sale-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const supplierApi = {
  getAll: () => request<SupplierResponse[]>('/suppliers'),
  getById: (id: number) => request<SupplierResponse>(`/suppliers/${id}`),
  create: (data: SupplierRequest) =>
    request<SupplierResponse>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: SupplierRequest) =>
    request<SupplierResponse>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/suppliers/${id}`, { method: 'DELETE' }),
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const purchaseOrderApi = {
  getAll: () => request<PurchaseOrderResponse[]>('/purchases'),
  getById: (id: number) => request<PurchaseOrderResponse>(`/purchases/${id}`),
  create: (data: PurchaseOrderRequest) =>
    request<PurchaseOrderResponse>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  receive: (id: number) =>
    request<PurchaseOrderResponse>(`/purchases/${id}/receive`, {
      method: 'PATCH',
    }),
  delete: (id: number) =>
    request<void>(`/purchases/${id}`, { method: 'DELETE' }),
};

// ─── Purchase Order Items ─────────────────────────────────────────────────────

export const purchaseOrderItemApi = {
  create: (data: PurchaseOrderItemRequest) =>
    request<PurchaseOrderItemResponse>('/purchase-order-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Warranties ───────────────────────────────────────────────────────────────

export const warrantyApi = {
  getAll: () => request<WarrantyResponse[]>('/warranties'),
  getById: (id: number) => request<WarrantyResponse>(`/warranties/${id}`),
  getExpiring: () => request<WarrantyResponse[]>('/warranties/expiring'),
  create: (data: WarrantyRequest) =>
    request<WarrantyResponse>('/warranties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  claim: (id: number) =>
    request<WarrantyResponse>(`/warranties/${id}/claim`, { method: 'PATCH' }),
};

// ─── Quotations ───────────────────────────────────────────────────────────────

export const quotationApi = {
  getAll: () => request<QuotationResponse[]>('/quotations'),
  getById: (id: number) => request<QuotationResponse>(`/quotations/${id}`),
  create: (data: QuotationRequest) =>
    request<QuotationResponse>('/quotations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: QuotationRequest) =>
    request<QuotationResponse>(`/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  convert: (id: number) =>
    request<QuotationResponse>(`/quotations/${id}/convert`, {
      method: 'PATCH',
    }),
  delete: (id: number) =>
    request<void>(`/quotations/${id}`, { method: 'DELETE' }),
  // alias kept for compatibility with pages that call .remove()
  remove: (id: number) =>
    request<void>(`/quotations/${id}`, { method: 'DELETE' }),
};

// ─── Quotation Items ──────────────────────────────────────────────────────────

export const quotationItemApi = {
  create: (data: QuotationItemRequest) =>
    request<QuotationItemResponse>('/quotation-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Gift Cards ───────────────────────────────────────────────────────────────

export const giftCardApi = {
  getAll: () => request<GiftCardResponse[]>('/gift-cards'),
  getByCode: (code: string) =>
    request<GiftCardResponse>(`/gift-cards/${encodeURIComponent(code)}`),
  create: (data: GiftCardRequest) =>
    request<GiftCardResponse>('/gift-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  redeem: (code: string) =>
    request<GiftCardResponse>(`/gift-cards/${encodeURIComponent(code)}/redeem`, {
      method: 'PATCH',
    }),
  getAllByStatus: (status: string) =>
    request<GiftCardResponse[]>(`/gift-cards?status=${status}`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportApi = {
  getDaily: () => request<SaleResponse[]>('/reports/daily'),
  getCategory: () => request<CategoryResponse[]>('/reports/category'),
  getStock: () => request<ProductResponse[]>('/reports/stock'),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const userApi = {
  getAll: () => request<UserResponse[]>('/users'),
};

export interface UserResponse {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
}

// ─── DTO Types ────────────────────────────────────────────────────────────────

export interface CategoryRequest {
  name: string;
  description: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export interface ProductRequest {
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  lowStockThreshold: number;
  barcode: string;
  imageUrl: string;
  categoryId: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  barcode: string;
  imageUrl: string;
  categoryName: string;
}

export interface CustomerRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
}

export interface CustomerResponse {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
}

export interface SaleRequest {
  customerId?: number;
  paymentMethod: string;
}

export interface SaleResponse {
  id: number;
  receiptNumber: string;
  saleDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  customerName: string;
  items: SaleItemResponse[];
}

export interface SaleItemRequest {
  saleId: number;
  productId: number;
  quantity: number;
}

export interface SaleItemResponse {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SupplierRequest {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface SupplierResponse {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  status: string;
}

export interface PurchaseOrderResponse {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  supplierName: string;
}

export interface PurchaseOrderItemRequest {
  purchaseOrderId: number;
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderItemResponse {
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface WarrantyRequest {
  customerId: number;
  productId: number;
  startDate: string;
  endDate: string;
}

export interface WarrantyResponse {
  id: number;
  warrantyNumber: string;
  startDate: string;
  endDate: string;
  status: string;
  customerName: string;
  productName: string;
}

export interface QuotationRequest {
  customerId?: number;
  expiryDate: string;
}

export interface QuotationResponse {
  id: number;
  quotationDate: string;
  expiryDate: string;
  totalAmount: number;
  status: string;
  customerName: string;
  items: QuotationItemResponse[];
  convertedSaleId?: number;
}

export interface QuotationItemRequest {
  quotationId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface QuotationItemResponse {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface GiftCardRequest {
  initialValue: number;
  expiryDate: string;
}

export interface GiftCardResponse {
  id: number;
  code: string;
  initialValue: number;
  currentBalance: number;
  expiryDate: string;
  status: string;
}