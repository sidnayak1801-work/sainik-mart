import { secureStore } from "@/utils/secureStore";

const TOKEN_KEY = "sainik-mart.accessToken";

export const getToken = async (): Promise<string | null> => {
  try {
    return await secureStore.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await secureStore.setItem(TOKEN_KEY, token);
  } catch {
    throw new Error("Unable to save your session. Please try again.");
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await secureStore.deleteItem(TOKEN_KEY);
  } catch {
    // Logout must still clear in-memory state even if storage fails.
  }
};
