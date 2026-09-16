import * as SecureStore from "expo-secure-store";

export const secureStore = {
  getItem: (key: string): Promise<string | null> => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  deleteItem: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
};
