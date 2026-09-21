import type { NavigatorScreenParams } from "@react-navigation/native";

import type { Address, CreatedOrder } from "@/types/models";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ProductList: { categoryId?: string; title?: string; search?: string };
  ProductDetails: { productId: string };
  OrderDetails: { orderId: string };
  Checkout: { selectedAddressId?: string } | undefined;
  AddressList: { selectForCheckout?: boolean; selectedAddressId?: string } | undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string; address: Address };
  OrderConfirmation: { order: CreatedOrder };
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
