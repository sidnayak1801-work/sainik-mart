import { secureStore } from "@/utils/secureStore";

const ADDRESS_KEY = "sainik-mart.selectedAddressId";

export const getSelectedAddressId = async (): Promise<string | null> => {
  try {
    return await secureStore.getItem(ADDRESS_KEY);
  } catch {
    return null;
  }
};

export const setSelectedAddressId = async (id: string): Promise<void> => {
  try {
    await secureStore.setItem(ADDRESS_KEY, id);
  } catch {
    // Location chrome can still show the in-memory address if persist fails.
  }
};

export const removeSelectedAddressId = async (): Promise<void> => {
  try {
    await secureStore.deleteItem(ADDRESS_KEY);
  } catch {
    // Logout must continue even if storage fails.
  }
};
