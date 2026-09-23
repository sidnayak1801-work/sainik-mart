import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { App } from "@/App";
import { AuthProvider } from "@/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import type { User } from "@/types/auth";

const adminUser: User = {
  id: "admin-1",
  name: "Store Admin",
  email: "admin@example.com",
  phone: "+911234567890",
  role: "ADMIN",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const customerUser: User = {
  ...adminUser,
  id: "cust-1",
  name: "Customer User",
  email: "customer@example.com",
  phone: "+911234567891",
  role: "CUSTOMER",
};

const TOKEN_KEY = "sainik-mart.admin.accessToken";
const ADMIN_TOKEN = "admin-token";
const CUSTOMER_TOKEN = "customer-token";

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const mockBackend = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();

      if (url.includes("/api/auth/login") && method === "POST") {
        const body = JSON.parse(String(init?.body ?? "{}")) as { identifier?: string; password?: string };
        if (body.identifier === adminUser.email && body.password === "password123") {
          return jsonResponse(200, {
            success: true,
            data: { user: adminUser, accessToken: ADMIN_TOKEN },
          });
        }
        if (body.identifier === customerUser.email && body.password === "password123") {
          return jsonResponse(200, {
            success: true,
            data: { user: customerUser, accessToken: CUSTOMER_TOKEN },
          });
        }
        return jsonResponse(401, { success: false, message: "Invalid credentials" });
      }

      if (url.includes("/api/auth/me")) {
        const token = new Headers(init?.headers).get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
        if (token === ADMIN_TOKEN) {
          return jsonResponse(200, { success: true, data: { user: adminUser } });
        }
        if (token === CUSTOMER_TOKEN) {
          return jsonResponse(200, { success: true, data: { user: customerUser } });
        }
        return jsonResponse(401, { success: false, message: "Authentication required" });
      }

      if (url.includes("/api/categories") && method === "GET") {
        return jsonResponse(200, { success: true, data: [] });
      }

      if (url.includes("/api/products") && method === "GET") {
        return jsonResponse(200, {
          success: true,
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      }

      if (url.includes("/api/admin/orders") && method === "GET") {
        return jsonResponse(200, {
          success: true,
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
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

const waitForSession = async () => {
  await waitFor(() => {
    expect(screen.queryByText("Checking admin session...")).not.toBeInTheDocument();
  });
};

describe("admin dashboard shell", () => {
  beforeEach(() => {
    localStorage.clear();
    mockBackend();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  test("unauthenticated visitors are redirected to login", async () => {
    renderApp("/admin");
    await waitForSession();
    expect(screen.getByRole("heading", { name: "Sainik Mart Admin" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  test.each(["/admin/products", "/admin/categories", "/admin/orders", "/admin/inventory"])(
    "unauthenticated visitors cannot open %s",
    async (path) => {
      renderApp(path);
      await waitForSession();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.queryByRole("navigation", { name: "Admin" })).not.toBeInTheDocument();
    },
  );

  test("admin login opens the dashboard", async () => {
    const user = userEvent.setup();
    renderApp("/admin/login");
    await waitForSession();
    await user.type(screen.getByLabelText("Email"), adminUser.email);
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByRole("heading", { name: "Welcome to Sainik Mart Admin" })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe(ADMIN_TOKEN);
  });

  test("customer login is denied and cannot open admin pages", async () => {
    const user = userEvent.setup();
    renderApp("/admin/login");
    await waitForSession();
    await user.type(screen.getByLabelText("Email"), customerUser.email);
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Welcome to Sainik Mart Admin" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Admin" })).not.toBeInTheDocument();
  });

  test.each(["/admin", "/admin/products", "/admin/categories", "/admin/orders", "/admin/inventory"])(
    "customer session cannot access %s",
    async (path) => {
      localStorage.setItem(TOKEN_KEY, CUSTOMER_TOKEN);
      renderApp(path);
      await waitForSession();
      expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
      expect(screen.queryByRole("navigation", { name: "Admin" })).not.toBeInTheDocument();
    },
  );

  test("admin can open all shell routes and the active nav updates", async () => {
    const user = userEvent.setup();
    localStorage.setItem(TOKEN_KEY, ADMIN_TOKEN);
    renderApp("/admin");
    await waitForSession();

    const nav = screen.getByRole("navigation", { name: "Admin" });
    expect(within(nav).getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");

    await user.click(within(nav).getByRole("link", { name: "Products" }));
    expect(await screen.findByRole("heading", { name: "Products" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Products" })).toHaveAttribute("aria-current", "page");

    await user.click(within(nav).getByRole("link", { name: "Categories" }));
    expect(await screen.findByRole("heading", { name: "Categories" })).toBeInTheDocument();

    await user.click(within(nav).getByRole("link", { name: "Orders" }));
    expect(await screen.findByRole("heading", { name: "Orders" })).toBeInTheDocument();

    await user.click(within(nav).getByRole("link", { name: "Inventory" }));
    expect(await screen.findByRole("heading", { name: "Inventory" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Inventory" })).toHaveAttribute("aria-current", "page");
  });

  test("logout clears the session and requires login again", async () => {
    const user = userEvent.setup();
    localStorage.setItem(TOKEN_KEY, ADMIN_TOKEN);
    renderApp("/admin");
    await waitForSession();
    expect(screen.getByRole("heading", { name: "Welcome to Sainik Mart Admin" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Logout" })[0]);
    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  test("refresh with a stored admin token restores the session", async () => {
    localStorage.setItem(TOKEN_KEY, ADMIN_TOKEN);
    renderApp("/admin");
    await waitForSession();
    expect(screen.getByRole("heading", { name: "Welcome to Sainik Mart Admin" })).toBeInTheDocument();
    expect(screen.getByText(adminUser.email)).toBeInTheDocument();
  });
});
