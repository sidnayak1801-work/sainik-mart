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

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
};

export type Order = {
  id: string;
  status: string;
};
