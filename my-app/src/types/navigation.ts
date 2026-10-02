import type { NavigatorScreenParams } from "@react-navigation/native";

import type { Address, CreatedOrder } from "@/types/models";

export type AuthRedirect = "Checkout" | "Orders" | "AddressList" | "Profile";

export type AuthScreenParams = { redirect?: AuthRedirect } | undefined;

export type AuthStackParamList = {
  Login: AuthScreenParams;
  Register: AuthScreenParams;
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
  AddressList: {
    selectForCheckout?: boolean;
    selectForLocation?: boolean;
    selectedAddressId?: string;
  } | undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string; address: Address };
  OrderConfirmation: { order: CreatedOrder };
  Login: AuthScreenParams;
  Register: AuthScreenParams;
  About: undefined;
  Terms: undefined;
  Privacy: undefined;
  Contact: undefined;
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
