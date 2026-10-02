import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useCart } from "@/context/CartContext";
import { AddAddressScreen } from "@/screens/address/AddAddressScreen";
import { AddressListScreen } from "@/screens/address/AddressListScreen";
import { EditAddressScreen } from "@/screens/address/EditAddressScreen";
import { CartScreen } from "@/screens/cart/CartScreen";
import { CategoriesScreen } from "@/screens/category/CategoriesScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { CheckoutScreen } from "@/screens/checkout/CheckoutScreen";
import { OrderConfirmationScreen } from "@/screens/checkout/OrderConfirmationScreen";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { OrderDetailsScreen } from "@/screens/orders/OrderDetailsScreen";
import { OrdersScreen } from "@/screens/orders/OrdersScreen";
import { ProductDetailsScreen } from "@/screens/product/ProductDetailsScreen";
import { ProductListScreen } from "@/screens/product/ProductListScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { ContactScreen } from "@/screens/info/ContactScreen";
import { InfoScreen } from "@/screens/info/InfoScreen";
import { theme } from "@/theme";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const tabIcon = (
  name: keyof typeof Ionicons.glyphMap,
  focusedName: keyof typeof Ionicons.glyphMap,
) => {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />
  );
};

function MainTabs() {
  const { itemCount } = useCart();

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
        tabBarLabelStyle: {
          fontSize: theme.typography.caption,
          fontWeight: theme.weight.semibold,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon("home-outline", "home") }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ tabBarIcon: tabIcon("grid-outline", "grid") }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: tabIcon("cart-outline", "cart"),
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.accent,
            color: theme.colors.primaryText,
          },
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarIcon: tabIcon("receipt-outline", "receipt") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon("person-outline", "person") }}
      />
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
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: "Order Details" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
      <Stack.Screen name="AddressList" component={AddressListScreen} options={{ title: "Delivery Address" }} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ title: "Add Address" }} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} options={{ title: "Edit Address" }} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ title: "Order Placed", headerBackVisible: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
      <Stack.Screen name="About" component={InfoScreen} options={{ title: "About Sainik Mart" }} />
      <Stack.Screen name="Terms" component={InfoScreen} options={{ title: "Terms and Conditions" }} />
      <Stack.Screen name="Privacy" component={InfoScreen} options={{ title: "Privacy Policy" }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: "Contact Us" }} />
    </Stack.Navigator>
  );
}
