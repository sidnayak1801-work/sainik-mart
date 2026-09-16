export type Product = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
};

export type Category = {
  id: string;
  name: string;
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
