/**
 * Typed client for the ElectroPOS Spring Boot backend.
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL (see .env.local).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new ApiError(res.status, message);
  }

  // DELETE endpoints return no body
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

const get = <T>(path: string) => request<T>(path, { method: "GET" });
const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
const put = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
const patch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

// ─── Types (mirror the backend DTOs exactly) ──────────────────────────────

export interface ProductDto {
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  lowStockThreshold: number;
  barcode?: string;
  imageUrl?: string;
  categoryId?: number;
}
export interface ProductResponseDto {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  barcode?: string;
  imageUrl?: string;
  categoryName?: string;
}

export interface CategoryDto {
  name: string;
  description?: string;
}
export interface CategoryResponseDto {
  id: number;
  name: string;
  description?: string;
}

export interface CustomerDto {
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  address?: string;
}
export interface CustomerResponseDto {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SupplierDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}
export interface SupplierResponseDto {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export interface WarrantyDto {
  customerId: number;
  productId: number;
  startDate: string; // ISO date
  endDate: string;
}
export interface WarrantyResponseDto {
  id: number;
  warrantyNumber: string;
  startDate: string;
  endDate: string;
  status: string;
  customerName: string;
  productName: string;
}

export interface GiftCardDto {
  initialValue: number;
  expiryDate: string;
}
export interface GiftCardResponseDto {
  id: number;
  code: string;
  initialValue: number;
  currentBalance: number;
  expiryDate: string;
  status: string;
}

export interface SaleDto {
  customerId?: number;
  paymentMethod: "CASH" | "MPESA" | "CREDIT" | string;
}
export interface SaleItemDto {
  saleId: number;
  productId: number;
  quantity: number;
}
export interface SaleItemResponseDto {
  id: number;
  saleId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
export interface SaleResponseDto {
  id: number;
  receiptNumber: string;
  saleDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  customerName?: string;
  items: SaleItemResponseDto[];
}

export interface PurchaseOrderDto {
  supplierId: number;
  status?: string;
}
export interface PurchaseOrderItemDto {
  purchaseOrderId: number;
  productId: number;
  quantity: number;
  unitCost: number;
}
export interface PurchaseOrderItemResponseDto {
  id: number;
  purchaseOrderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}
export interface PurchaseOrderResponseDto {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  supplierName: string;
  items: PurchaseOrderItemResponseDto[];
}

export interface QuotationDto {
  customerId: number;
  expiryDate: string;
}
export interface QuotationItemDto {
  quotationId: number;
  productId: number;
  quantity: number;
  unitPrice?: number;
}
export interface QuotationItemResponseDto {
  id: number;
  quotationId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
export interface QuotationResponseDto {
  id: number;
  quotationDate: string;
  expiryDate: string;
  totalAmount: number;
  status: string;
  customerName?: string;
  items: QuotationItemResponseDto[];
  convertedSaleId?: number;
}
export interface SettingsDto {
  businessName: string;
  kraPin: string;
  address: string;
  currency: string;
  timezone: string;
  receiptHeaderText: string;
  receiptFooterText: string;
  autoGenerateSerialNumbers: boolean;
  thermalPrinterMode: boolean;
}
export interface SettingsResponseDto extends SettingsDto {
  id: number;
}

// ─── Products ──────────────────────────────────────────────────────────────

export const productsApi = {
  list: () => get<ProductResponseDto[]>("/products"),
  get: (id: number) => get<ProductResponseDto>(`/products/${id}`),
  search: (name: string) =>
    get<ProductResponseDto[]>(`/products/search/${encodeURIComponent(name)}`),
  lowStock: () => get<ProductResponseDto[]>("/products/low-stock"),
  create: (dto: ProductDto) => post<ProductResponseDto>("/products", dto),
  update: (id: number, dto: ProductDto) =>
    put<ProductResponseDto>(`/products/${id}`, dto),
  remove: (id: number) => del<void>(`/products/${id}`),
};

// ─── Categories ────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () => get<CategoryResponseDto[]>("/categories"),
  get: (id: number) => get<CategoryResponseDto>(`/categories/${id}`),
  create: (dto: CategoryDto) => post<CategoryResponseDto>("/categories", dto),
  update: (id: number, dto: CategoryDto) =>
    put<CategoryResponseDto>(`/categories/${id}`, dto),
  remove: (id: number) => del<void>(`/categories/${id}`),
};

// ─── Customers ─────────────────────────────────────────────────────────────

export const customersApi = {
  list: () => get<CustomerResponseDto[]>("/customers"),
  get: (id: number) => get<CustomerResponseDto>(`/customers/${id}`),
  search: (name: string) =>
    get<CustomerResponseDto[]>(`/customers/search/${encodeURIComponent(name)}`),
  create: (dto: CustomerDto) => post<CustomerResponseDto>("/customers", dto),
  update: (id: number, dto: CustomerDto) =>
    put<CustomerResponseDto>(`/customers/${id}`, dto),
  remove: (id: number) => del<void>(`/customers/${id}`),
};

// ─── Suppliers ─────────────────────────────────────────────────────────────

export const suppliersApi = {
  list: () => get<SupplierResponseDto[]>("/suppliers"),
  get: (id: number) => get<SupplierResponseDto>(`/suppliers/${id}`),
  create: (dto: SupplierDto) => post<SupplierResponseDto>("/suppliers", dto),
  update: (id: number, dto: SupplierDto) =>
    put<SupplierResponseDto>(`/suppliers/${id}`, dto),
  remove: (id: number) => del<void>(`/suppliers/${id}`),
};

// ─── Warranties ────────────────────────────────────────────────────────────

export const warrantiesApi = {
  list: () => get<WarrantyResponseDto[]>("/warranties"),
  get: (id: number) => get<WarrantyResponseDto>(`/warranties/${id}`),
  expiring: () => get<WarrantyResponseDto[]>("/warranties/expiring"),
  create: (dto: WarrantyDto) => post<WarrantyResponseDto>("/warranties", dto),
  claim: (id: number) => patch<WarrantyResponseDto>(`/warranties/${id}/claim`),
};

// ─── Gift cards ────────────────────────────────────────────────────────────

export const giftCardsApi = {
  list: () => get<GiftCardResponseDto[]>("/gift-cards"),
  get: (code: string) => get<GiftCardResponseDto>(`/gift-cards/${code}`),
  create: (dto: GiftCardDto) => post<GiftCardResponseDto>("/gift-cards", dto),
  redeem: (code: string) =>
    patch<GiftCardResponseDto>(`/gift-cards/${code}/redeem`),
};

// ─── Sales + sale items ─────────────────────────────────────────────────────

export const salesApi = {
  list: () => get<SaleResponseDto[]>("/sales"),
  get: (id: number) => get<SaleResponseDto>(`/sales/${id}`),
  getByReceipt: (receiptNumber: string) =>
    get<SaleResponseDto>(`/sales/receipt/${receiptNumber}`),
  create: (dto: SaleDto) => post<SaleResponseDto>("/sales", dto),
  refund: (id: number) => patch<SaleResponseDto>(`/sales/${id}/refund`),
  items: (saleId: number) =>
    get<SaleItemResponseDto[]>(`/sales/${saleId}/items`),
  addItem: (dto: SaleItemDto) =>
    post<SaleItemResponseDto>("/sale-items", dto),
  removeItem: (itemId: number) => del<void>(`/sale-items/${itemId}`),
};

// ─── Purchase orders + items ────────────────────────────────────────────────

export const purchaseOrdersApi = {
  list: () => get<PurchaseOrderResponseDto[]>("/purchases"),
  get: (id: number) => get<PurchaseOrderResponseDto>(`/purchases/${id}`),
  create: (dto: PurchaseOrderDto) =>
    post<PurchaseOrderResponseDto>("/purchases", dto),
  receive: (id: number) =>
    patch<PurchaseOrderResponseDto>(`/purchases/${id}/receive`),
  remove: (id: number) => del<void>(`/purchases/${id}`),
  items: (purchaseOrderId: number) =>
    get<PurchaseOrderItemResponseDto[]>(`/purchases/${purchaseOrderId}/items`),
  addItem: (dto: PurchaseOrderItemDto) =>
    post<PurchaseOrderItemResponseDto>("/purchase-order-items", dto),
  removeItem: (itemId: number) => del<void>(`/purchase-order-items/${itemId}`),
};

// ─── Quotations + items ─────────────────────────────────────────────────────

export const quotationsApi = {
  list: () => get<QuotationResponseDto[]>("/quotations"),
  get: (id: number) => get<QuotationResponseDto>(`/quotations/${id}`),
  create: (dto: QuotationDto) =>
    post<QuotationResponseDto>("/quotations", dto),
  update: (id: number, dto: QuotationDto) =>
    put<QuotationResponseDto>(`/quotations/${id}`, dto),
  convert: (id: number, paymentMethod?: string) =>
    patch<QuotationResponseDto>(`/quotations/${id}/convert`, {
      paymentMethod,
    }),
  remove: (id: number) => del<void>(`/quotations/${id}`),
  items: (quotationId: number) =>
    get<QuotationItemResponseDto[]>(`/quotations/${quotationId}/items`),
  addItem: (dto: QuotationItemDto) =>
    post<QuotationItemResponseDto>("/quotation-items", dto),
  removeItem: (itemId: number) => del<void>(`/quotation-items/${itemId}`),
};

// ─── Reports ────────────────────────────────────────────────────────────────

export const reportsApi = {
  daily: () => get<SaleResponseDto[]>("/reports/daily"),
  category: () => get<CategoryResponseDto[]>("/reports/category"),
  stock: () => get<ProductResponseDto[]>("/reports/stock"),
};

// ─── Settings ──────────────────────────────────────────────────────────────

export const settingsApi = {
  get: () => get<SettingsResponseDto>("/settings"),
  update: (dto: SettingsDto) => put<SettingsResponseDto>("/settings", dto),
};