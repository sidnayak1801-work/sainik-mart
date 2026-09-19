export type Category = {
  id: string;
  name: string;
  imageUrl?: string | null;
  isActive?: boolean;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
  stockQuantity?: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
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

export type CreatedOrder = {
  id: string;
  addressId: string;
  orderStatus: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  items: OrderLine[];
};

export type Order = CreatedOrder;

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
