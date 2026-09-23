export type Category = {
  id: string;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stockQuantity: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StockStatus = "in" | "low" | "out";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PACKING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OrderCustomer = {
  id?: string;
  name: string;
  email: string;
  phone: string;
};

export type OrderAddress = {
  id: string;
  addressLine: string;
  city: string;
  pincode: string;
};

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  price: number;
  quantity: number;
  total: number;
};

export type OrderSummary = {
  id: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  customer: OrderCustomer;
};

export type OrderDetail = {
  id: string;
  addressId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  address: OrderAddress;
  customer: OrderCustomer;
};
