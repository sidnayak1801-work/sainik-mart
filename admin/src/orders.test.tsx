import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { App } from "@/App";
import { AuthProvider } from "@/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import type { User } from "@/types/auth";
import type { OrderDetail, OrderSummary } from "@/types/models";

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
const ORDER_A_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ORDER_B_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const MISSING_ID = "00000000-0000-4000-8000-000000000000";

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const summary = (overrides: Partial<OrderSummary> = {}): OrderSummary => ({
  id: ORDER_A_ID,
  orderStatus: "PENDING",
  paymentStatus: "PENDING",
  totalAmount: 160,
  createdAt: "2026-09-20T10:00:00.000Z",
  itemCount: 1,
  customer: { name: "Anita Rao", email: "anita@example.com", phone: "+911111111111" },
  ...overrides,
});

const detail = (overrides: Partial<OrderDetail> = {}): OrderDetail => ({
  id: ORDER_A_ID,
  addressId: "addr-1",
  orderStatus: "PENDING",
  paymentStatus: "PENDING",
  subtotal: 160,
  deliveryFee: 0,
  discount: 0,
  totalAmount: 160,
  createdAt: "2026-09-20T10:00:00.000Z",
  items: [
    {
      id: "item-1",
      productId: "prod-1",
      productName: "Toned Milk 1L",
      price: 80,
      quantity: 2,
      total: 160,
    },
  ],
  address: { id: "addr-1", addressLine: "12 Order Street", city: "Delhi", pincode: "110001" },
  customer: { id: "cust-1", name: "Anita Rao", email: "anita@example.com", phone: "+911111111111" },
  ...overrides,
});

let orders: OrderSummary[] = [];
let details: Record<string, OrderDetail> = {};

const mockOrders = () => {
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

      if (url.pathname === "/api/admin/orders" && method === "GET") {
        const search = url.searchParams.get("search")?.toLowerCase() ?? "";
        const status = url.searchParams.get("status");
        const page = Number(url.searchParams.get("page") ?? "1");
        const limit = Number(url.searchParams.get("limit") ?? "10");
        let items = orders.filter((item) => {
          if (status && item.orderStatus !== status) return false;
          if (
            search &&
            !item.id.toLowerCase().includes(search) &&
            !item.customer.name.toLowerCase().includes(search) &&
            !item.customer.email.toLowerCase().includes(search)
          ) {
            return false;
          }
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

      const statusMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
      if (statusMatch && method === "PATCH") {
        const body = JSON.parse(String(init?.body ?? "{}")) as { status?: OrderDetail["orderStatus"] };
        const current = details[statusMatch[1]];
        if (!current) return jsonResponse(404, { success: false, message: "Order not found" });
        const updated: OrderDetail = { ...current, orderStatus: body.status ?? current.orderStatus };
        details = { ...details, [current.id]: updated };
        orders = orders.map((item) => (item.id === current.id ? { ...item, orderStatus: updated.orderStatus } : item));
        return jsonResponse(200, { success: true, data: updated });
      }

      const detailMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
      if (detailMatch && method === "GET") {
        const found = details[detailMatch[1]];
        if (!found) return jsonResponse(404, { success: false, message: "Order not found" });
        return jsonResponse(200, { success: true, data: found });
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

describe("admin orders", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(TOKEN_KEY, ADMIN_TOKEN);
    orders = [
      summary(),
      summary({
        id: ORDER_B_ID,
        orderStatus: "CONFIRMED",
        totalAmount: 240,
        itemCount: 3,
        createdAt: "2026-09-19T10:00:00.000Z",
        customer: { name: "Bala Iyer", email: "bala@example.com", phone: "+922222222222" },
      }),
    ];
    details = {
      [ORDER_A_ID]: detail(),
      [ORDER_B_ID]: detail({
        id: ORDER_B_ID,
        orderStatus: "CONFIRMED",
        totalAmount: 240,
        subtotal: 240,
        items: [
          {
            id: "item-2",
            productId: "prod-2",
            productName: "Brown Bread",
            price: 80,
            quantity: 3,
            total: 240,
          },
        ],
        address: { id: "addr-2", addressLine: "90 Bravo Road", city: "Nagpur", pincode: "440001" },
        customer: { id: "cust-2", name: "Bala Iyer", email: "bala@example.com", phone: "+922222222222" },
      }),
    };
    mockOrders();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  test("lists orders and opens detail", async () => {
    const user = userEvent.setup();
    renderApp("/admin/orders");
    await waitForSession();

    expect(await screen.findByRole("heading", { name: "Orders" })).toBeInTheDocument();
    expect(await screen.findByText("Anita Rao")).toBeInTheDocument();
    expect(screen.getByText("Bala Iyer")).toBeInTheDocument();
    expect(screen.getByText("₹160.00")).toBeInTheDocument();
    expect(screen.getByText("₹240.00")).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    const anitaRow = rows.find((row) => within(row).queryByText("Anita Rao"));
    expect(anitaRow).toBeTruthy();
    await user.click(within(anitaRow!).getByRole("link", { name: "View" }));

    expect(await screen.findByText("anita@example.com")).toBeInTheDocument();
    expect(screen.getByText("12 Order Street")).toBeInTheDocument();
    expect(screen.getByText("Toned Milk 1L")).toBeInTheDocument();
    expect(screen.getByText("Total ₹160.00")).toBeInTheDocument();
  });

  test("status filter uses the backend query", async () => {
    const user = userEvent.setup();
    renderApp("/admin/orders");
    expect(await screen.findByText("Anita Rao")).toBeInTheDocument();
    expect(screen.getByText("Bala Iyer")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Status"), "CONFIRMED");
    await waitFor(() => {
      const urls = vi.mocked(fetch).mock.calls.map((call) => String(call[0]));
      expect(urls.some((url) => url.includes("status=CONFIRMED"))).toBe(true);
    });
    await waitFor(() => {
      expect(screen.queryByText("Anita Rao")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Bala Iyer")).toBeInTheDocument();
  });

  test("admin can update a pending order status after confirmation", async () => {
    const user = userEvent.setup();
    renderApp(`/admin/orders/${ORDER_A_ID}`);
    expect(await screen.findByText("anita@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Next status")).toHaveValue("CONFIRMED");

    await user.click(screen.getByRole("button", { name: "Update status" }));
    const dialog = screen.getByRole("dialog", { name: "Update order status" });
    expect(dialog).toHaveTextContent("Mark this order as Confirmed?");
    await user.click(within(dialog).getByRole("button", { name: "Update" }));

    expect(await screen.findByText("Order status updated.")).toBeInTheDocument();
    expect(details[ORDER_A_ID]?.orderStatus).toBe("CONFIRMED");
    await waitFor(() => {
      expect(screen.getByLabelText("Next status")).toHaveValue("PACKING");
    });
  });

  test("missing orders show an error with retry", async () => {
    renderApp(`/admin/orders/${MISSING_ID}`);
    expect(await screen.findByText("The requested resource was not found.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("Customer")).not.toBeInTheDocument();
  });

  test("empty list shows a friendly message", async () => {
    orders = [];
    renderApp("/admin/orders");
    expect(await screen.findByText("No orders found.")).toBeInTheDocument();
  });
});
