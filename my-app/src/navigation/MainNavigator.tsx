import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AddAddressScreen } from "@/screens/address/AddAddressScreen";
import { AddressListScreen } from "@/screens/address/AddressListScreen";
import { EditAddressScreen } from "@/screens/address/EditAddressScreen";
import { CartScreen } from "@/screens/cart/CartScreen";
import { CategoriesScreen } from "@/screens/category/CategoriesScreen";
import { CheckoutScreen } from "@/screens/checkout/CheckoutScreen";
import { OrderConfirmationScreen } from "@/screens/checkout/OrderConfirmationScreen";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { OrderDetailsScreen } from "@/screens/orders/OrderDetailsScreen";
import { OrdersScreen } from "@/screens/orders/OrdersScreen";
import { ProductDetailsScreen } from "@/screens/product/ProductDetailsScreen";
import { ProductListScreen } from "@/screens/product/ProductListScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { theme } from "@/theme";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primary,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text, fontWeight: "700" },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={({ route }) => ({ title: route.params.title ?? "Products" })}
      />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: "Product" }} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
      <Stack.Screen name="AddressList" component={AddressListScreen} options={{ title: "Delivery Address" }} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ title: "Add Address" }} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} options={{ title: "Edit Address" }} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ title: "Order Placed", headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
