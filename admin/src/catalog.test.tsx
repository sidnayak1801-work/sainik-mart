import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { App } from "@/App";
import { AuthProvider } from "@/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import type { User } from "@/types/auth";
import type { Category, Product } from "@/types/models";

const adminUser: User = {
  id: "admin-1",
  name: "Store Admin",
  email: "admin@example.com",
  phone: "+911234567890",
  role: "ADMIN",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const TOKEN_KEY = "sainik-mart.admin.accessToken";
const ADMIN_TOKEN = "admin-token";

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const dairy: Category = {
  id: "cat-1",
  name: "Dairy",
  imageUrl: null,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const milk = (overrides: Partial<Product> = {}): Product => ({
  id: "prod-1",
  name: "Toned Milk 1L",
  description: "Fresh milk",
  price: 62,
  discountPrice: 58,
  imageUrl: null,
  stockQuantity: 40,
  categoryId: dairy.id,
  category: { id: dairy.id, name: dairy.name },
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

let categories: Category[] = [];
let products: Product[] = [];

const mockCatalog = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), "http://localhost:4000");
      const method = (init?.method ?? "GET").toUpperCase();
      const token = new Headers(init?.headers).get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";

      if (url.pathname === "/api/auth/me") {
        if (token !== ADMIN_TOKEN) return jsonResponse(401, { success: false, message: "Authentication required" });
        return jsonResponse(200, { success: true, data: { user: adminUser } });
      }

      if (url.pathname === "/api/categories" && method === "GET") {
        return jsonResponse(200, { success: true, data: categories });
      }

      if (url.pathname === "/api/categories" && method === "POST") {
        const body = JSON.parse(String(init?.body ?? "{}")) as { name?: string };
        const name = body.name?.trim() ?? "";
        if (!name) return jsonResponse(400, { success: false, message: "Validation failed" });
        if (categories.some((item) => item.name === name)) {
          return jsonResponse(409, { success: false, message: "A category with this name already exists" });
        }
        const created: Category = {
          ...dairy,
          id: `cat-${categories.length + 1}`,
          name,
        };
        categories = [...categories, created];
        return jsonResponse(201, { success: true, data: created });
      }

      const categoryMatch = url.pathname.match(/^\/api\/categories\/([^/]+)$/);
      if (categoryMatch && method === "PATCH") {
        const body = JSON.parse(String(init?.body ?? "{}")) as { name?: string; isActive?: boolean };
        categories = categories.map((item) =>
          item.id === categoryMatch[1] ? { ...item, ...body, name: body.name ?? item.name } : item,
        );
        const updated = categories.find((item) => item.id === categoryMatch[1]);
        return jsonResponse(200, { success: true, data: updated });
      }
      if (categoryMatch && method === "DELETE") {
        categories = categories.map((item) => (item.id === categoryMatch[1] ? { ...item, isActive: false } : item));
        const updated = categories.find((item) => item.id === categoryMatch[1]);
        return jsonResponse(200, { success: true, data: updated });
      }

      if (String(input).includes("/api/products") && method === "GET") {
        const search = url.searchParams.get("search")?.toLowerCase() ?? "";
        const categoryId = url.searchParams.get("categoryId");
        const isActive = url.searchParams.get("isActive");
        const stockStatus = url.searchParams.get("stockStatus");
        const page = Number(url.searchParams.get("page") ?? "1");
        const limit = Number(url.searchParams.get("limit") ?? "10");
        let items = products.filter((item) => {
          if (search && !item.name.toLowerCase().includes(search) && !item.description.toLowerCase().includes(search)) {
            return false;
          }
          if (categoryId && item.categoryId !== categoryId) return false;
          if (isActive === "true" && !item.isActive) return false;
          if (isActive === "false" && item.isActive) return false;
          if (stockStatus === "out" && item.stockQuantity !== 0) return false;
          if (stockStatus === "low" && (item.stockQuantity <= 0 || item.stockQuantity > 5)) return false;
          if (stockStatus === "in" && item.stockQuantity <= 5) return false;
          return true;
        });
        const total = items.length;
        items = items.slice((page - 1) * limit, page * limit);
        return jsonResponse(200, {
          success: true,
          data: items,
          pagination: { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) },
        });
      }

      if (url.pathname === "/api/admin/uploads" && method === "POST") {
        return jsonResponse(200, {
          success: true,
          data: {
            url: "https://res.cloudinary.com/demo/image/upload/v1/sainik-mart/products/banana.jpg",
            publicId: "sainik-mart/products/banana",
          },
        });
      }

      if (url.pathname === "/api/products" && method === "POST") {
        const body = JSON.parse(String(init?.body ?? "{}")) as Partial<Product> & { name: string };
        const created = milk({
          id: `prod-${products.length + 1}`,
          name: body.name,
          description: body.description ?? "",
          price: body.price ?? 0,
          stockQuantity: body.stockQuantity ?? 0,
          categoryId: body.categoryId ?? dairy.id,
          imageUrl: body.imageUrl ?? null,
        });
        products = [...products, created];
        return jsonResponse(201, { success: true, data: created });
      }

      const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
      if (productMatch && method === "PATCH") {
        const body = JSON.parse(String(init?.body ?? "{}")) as Partial<Product>;
        products = products.map((item) => (item.id === productMatch[1] ? { ...item, ...body } : item));
        const updated = products.find((item) => item.id === productMatch[1]);
        return jsonResponse(200, { success: true, data: updated });
      }
      if (productMatch && method === "DELETE") {
        products = products.map((item) => (item.id === productMatch[1] ? { ...item, isActive: false } : item));
        const updated = products.find((item) => item.id === productMatch[1]);
        return jsonResponse(200, { success: true, data: updated });
      }

      return jsonResponse(404, { success: false, message: "Not found" });
    }),
  );
};

const renderApp = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  );

describe("admin catalog management", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, ADMIN_TOKEN);
    categories = [{ ...dairy }];
    products = [milk(), milk({ id: "prod-2", name: "Brown Bread", description: "Whole wheat loaf", stockQuantity: 2 })];
    mockCatalog();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  test("admin can list and create a category", async () => {
    const user = userEvent.setup();
    renderApp("/admin/categories");
    expect(await screen.findByText("Dairy")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add Category" }));
    await user.type(screen.getByLabelText("Name"), "Bakery");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Bakery")).toBeInTheDocument();
    expect(await screen.findByText("Category created.")).toBeInTheDocument();
  });

  test("duplicate category name shows the API error", async () => {
    const user = userEvent.setup();
    renderApp("/admin/categories");
    await screen.findByText("Dairy");

    await user.click(screen.getByRole("button", { name: "Add Category" }));
    await user.type(screen.getByLabelText("Name"), "Dairy");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("A category with this name already exists");
  });

  test("admin can deactivate a category after confirmation", async () => {
    const user = userEvent.setup();
    renderApp("/admin/categories");
    await screen.findByText("Dairy");

    await user.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(screen.getByRole("dialog", { name: "Deactivate category" })).toBeInTheDocument();
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Deactivate" }));

    expect(await within(screen.getByRole("table")).findByText("Inactive")).toBeInTheDocument();
  });

  test("admin can create a product with an image URL", async () => {
    const user = userEvent.setup();
    renderApp("/admin/products");
    expect(await screen.findByText("Toned Milk 1L")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add Product" }));
    const dialog = screen.getByRole("dialog", { name: "Add Product" });
    await user.type(within(dialog).getByLabelText("Name"), "Paneer 200g");
    await user.type(within(dialog).getByLabelText("Description"), "Fresh paneer");
    await user.type(within(dialog).getByLabelText("Image URL"), "https://example.com/paneer.jpg");
    await user.type(within(dialog).getByLabelText("Price"), "90");
    await user.selectOptions(within(dialog).getByLabelText("Category"), dairy.id);
    await user.click(within(dialog).getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Product created.")).toBeInTheDocument();
    expect(await screen.findByText("Paneer 200g")).toBeInTheDocument();
    expect(products.some((item) => item.name === "Paneer 200g" && item.imageUrl === "https://example.com/paneer.jpg")).toBe(
      true,
    );
  });

  test("admin can upload a product image and save the Cloudinary URL", async () => {
    const user = userEvent.setup();
    renderApp("/admin/products");
    expect(await screen.findByText("Toned Milk 1L")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add Product" }));
    const dialog = screen.getByRole("dialog", { name: "Add Product" });
    const file = new File(["fake-image"], "banana.jpg", { type: "image/jpeg" });
    await user.upload(within(dialog).getByLabelText("Choose image"), file);
    expect(await screen.findByText("Image uploaded.")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Image URL")).toHaveValue(
      "https://res.cloudinary.com/demo/image/upload/v1/sainik-mart/products/banana.jpg",
    );

    await user.type(within(dialog).getByLabelText("Name"), "Bananas 6 pcs");
    await user.type(within(dialog).getByLabelText("Description"), "Ripe bananas");
    await user.type(within(dialog).getByLabelText("Price"), "50");
    await user.selectOptions(within(dialog).getByLabelText("Category"), dairy.id);
    await user.click(within(dialog).getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Product created.")).toBeInTheDocument();
    expect(
      products.some(
        (item) =>
          item.name === "Bananas 6 pcs" &&
          item.imageUrl === "https://res.cloudinary.com/demo/image/upload/v1/sainik-mart/products/banana.jpg",
      ),
    ).toBe(true);
  });

  test("product search uses the backend query", async () => {
    const user = userEvent.setup();
    renderApp("/admin/products");
    expect(await screen.findByText("Toned Milk 1L")).toBeInTheDocument();
    expect(screen.getByText("Brown Bread")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search products"), "milk");
    await waitFor(() => {
      const urls = vi.mocked(fetch).mock.calls.map((call) => String(call[0]));
      expect(urls.some((url) => url.includes("search=milk"))).toBe(true);
    });
    await waitFor(() => {
      expect(screen.queryByText("Brown Bread")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Toned Milk 1L")).toBeInTheDocument();
  });

  test("inventory can update stock only", async () => {
    const user = userEvent.setup();
    renderApp("/admin/inventory");
    expect(await screen.findByText("Toned Milk 1L")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Update Stock" })[0]);
    const dialog = screen.getByRole("dialog", { name: "Update Stock" });
    const input = within(dialog).getByLabelText("New stock");
    await user.clear(input);
    await user.type(input, "12");
    await user.click(within(dialog).getByRole("button", { name: "Update Stock" }));

    expect(await screen.findByText("Stock updated.")).toBeInTheDocument();
    expect(products[0]?.stockQuantity).toBe(12);
  });
});
