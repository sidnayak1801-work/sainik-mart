export type Subcategory = {
  id: string;
  categoryId: string;
  name: string;
  imageUrl?: string | null;
  isActive?: boolean;
};

export type Category = {
  id: string;
  name: string;
  imageUrl?: string | null;
  isActive?: boolean;
  subcategories?: Subcategory[];
};

export type PackUnit = "ML" | "L" | "G" | "KG" | "PCS" | "PACK" | "DOZEN" | "BUNCH";

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
  stockQuantity?: number;
  packQuantity?: number | null;
  packUnit?: PackUnit | null;
  categoryId?: string;
  subcategoryId?: string | null;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  } | null;
  isActive?: boolean;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  stockQuantity: number;
};

export type CartLineItem = {
  id: string;
  quantity: number;
  lineTotal: number;
  product: CartProduct;
};

export type Cart = {
  id: string;
  items: CartLineItem[];
  subtotal: number;
};

export type OrderLine = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
};

export type RazorpayCheckoutPayload = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
};

export type PaymentMethod = "RAZORPAY" | "COD";

export type CreatedOrder = {
  id: string;
  addressId: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  createdAt?: string;
  items: OrderLine[];
  address?: OrderAddress;
  razorpay?: RazorpayCheckoutPayload;
};

export type OrderAddress = {
  id: string;
  addressLine: string;
  city: string;
  pincode: string;
};

export type OrderSummary = {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
};

export type Order = CreatedOrder & {
  address?: OrderAddress;
};

export type Address = {
  id: string;
  addressLine: string;
  city: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AddressInput = {
  addressLine: string;
  city: string;
  pincode: string;
};

export type AddressUpdateInput = Partial<AddressInput>;
