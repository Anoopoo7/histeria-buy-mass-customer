export type CartStatus =
  | 'ACTIVE'
  | 'SUBMITTED'
  | 'ORDER_COMPLETED'
  | 'CANCELLED';

export interface FormattedCartItem {
  productId: string;
  name: string;
  image: string | null;
  quantity: number;
  priceAtAddition: number;
  currentPrice: number;
  itemSubtotal: number;
  unit?: string;
  addedAt?: string;
}

export interface FormattedCart {
  id: string;
  userId: string;
  store: {
    id: string;
    name: string;
  };
  items: FormattedCartItem[];
  itemCount: number;
  cartTotal: number;
  status: CartStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GetActiveCartsResponse {
  totalCarts: number;
  carts: FormattedCart[];
}
