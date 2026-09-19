import type { NavigatorScreenParams } from "@react-navigation/native";

import type { Address } from "@/types/models";

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
  OrderDetails: { orderId?: string };
  AddressList: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string; address: Address };
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
