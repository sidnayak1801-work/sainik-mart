import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CartScreen } from "@/screens/cart/CartScreen";
import { CategoriesScreen } from "@/screens/category/CategoriesScreen";
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
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={({ route }) => ({ title: route.params.title ?? "Products" })}
      />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: "Product" }} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}
