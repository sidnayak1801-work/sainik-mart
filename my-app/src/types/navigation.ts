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
  MainTabs: undefined;
  ProductDetails: { productId?: string };
  OrderDetails: { orderId?: string };
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
