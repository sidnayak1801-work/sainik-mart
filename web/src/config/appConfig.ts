export type DistributionMode = "apk" | "playstore" | "coming_soon";

export type CategoryId =
  | "fruits-vegetables"
  | "dairy"
  | "bakery"
  | "snacks-beverages"
  | "household"
  | "personal-care";

export type CategoryCard = {
  id: CategoryId;
  name: string;
  description: string;
  fromCatalog: boolean;
};

const DISTRIBUTION_MODES: readonly DistributionMode[] = ["apk", "playstore", "coming_soon"];

const readEnv = (value: string | undefined): string => value?.trim() ?? "";

const parseDistributionMode = (value: string | undefined): DistributionMode => {
  const mode = readEnv(value).toLowerCase();
  return DISTRIBUTION_MODES.includes(mode as DistributionMode)
    ? (mode as DistributionMode)
    : "coming_soon";
};

export const isHttpsUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

export const appConfig = {
  appName: "Sainik Mart",
  tagline: "Har zaroorat, ek jagah",
  siteUrl: readEnv(import.meta.env.VITE_SITE_URL) || "https://sainikmartapp.in",
  distributionMode: parseDistributionMode(import.meta.env.VITE_APP_DISTRIBUTION_MODE),
  androidApkUrl: readEnv(import.meta.env.VITE_ANDROID_APK_URL),
  playStoreUrl: readEnv(import.meta.env.VITE_PLAY_STORE_URL),
  downloadLabel: readEnv(import.meta.env.VITE_DOWNLOAD_LABEL) || "Install App",
  contactEmail: "hello@sainikmart.in",
  contactPhone: readEnv(import.meta.env.VITE_CONTACT_PHONE),
  contactAddress: readEnv(import.meta.env.VITE_CONTACT_ADDRESS),
  privacyUrl: "https://api.sainikmartapp.in/api/privacy",
  termsUrl: "https://api.sainikmartapp.in/api/terms",
  brandDescription:
    "Sainik Mart is a neighbourhood grocery store in your pocket. We bring daily essentials, fresh staples, and household needs to your door with a simple, honest shopping experience.",
  categories: [
    {
      id: "fruits-vegetables",
      name: "Fruits & Vegetables",
      description: "Fresh produce for everyday cooking.",
      fromCatalog: true,
    },
    {
      id: "dairy",
      name: "Dairy",
      description: "Milk, curd and breakfast staples.",
      fromCatalog: true,
    },
    {
      id: "bakery",
      name: "Bakery",
      description: "Bread and daily bakery essentials.",
      fromCatalog: true,
    },
    {
      id: "snacks-beverages",
      name: "Snacks & Beverages",
      description: "Typical grocery range — availability varies in the app.",
      fromCatalog: false,
    },
    {
      id: "household",
      name: "Household Essentials",
      description: "Typical grocery range — availability varies in the app.",
      fromCatalog: false,
    },
    {
      id: "personal-care",
      name: "Personal Care",
      description: "Typical grocery range — availability varies in the app.",
      fromCatalog: false,
    },
  ] satisfies CategoryCard[],
} as const;

export type AppConfig = typeof appConfig;
