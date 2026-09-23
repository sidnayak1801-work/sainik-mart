import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/client";
import { listOrders } from "@/api/orders";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import catalog from "@/components/ui/catalog.module.css";
import { ORDER_PAGE_SIZE, ORDER_STATUSES } from "@/constants/orders";
import type { OrderStatus, OrderSummary, Pagination as PaginationMeta } from "@/types/models";
import { useDebouncedValue } from "@/utils/debounce";
import { formatDate, formatMoney, formatOrderStatus, shortId } from "@/utils/format";

const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Unable to complete the request. Please try again.";

export const OrdersPage = () => {
  const [items, setItems] = useState<OrderSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: ORDER_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await listOrders({
        page,
        limit: ORDER_PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : status,
      });
      if (id !== requestId.current) return;
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(errorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const columns: Column<OrderSummary>[] = [
    { header: "Order", render: (row) => shortId(row.id) },
    { header: "Customer", render: (row) => row.customer.name },
    { header: "Date", render: (row) => formatDate(row.createdAt) },
    { header: "Items", render: (row) => row.itemCount },
    { header: "Total", render: (row) => formatMoney(row.totalAmount) },
    { header: "Status", render: (row) => <OrderStatusBadge status={row.orderStatus} /> },
    {
      header: "Actions",
      render: (row) => (
        <Link className={catalog.link} to={`/admin/orders/${row.id}`}>
          View
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Orders" description="Review and fulfill customer orders." />
      <div className={catalog.toolbar}>
        <input
          type="search"
          placeholder="Search orders..."
          aria-label="Search orders"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          aria-label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus | "all")}
        >
          <option value="all">All</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {formatOrderStatus(value)}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className={catalog.status}>Loading orders...</p>
      ) : error ? (
        <div className={catalog.status}>
          <p>{error}</p>
          <button type="button" className={catalog.primary} onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <DataTable columns={columns} rows={items} rowKey={(row) => row.id} emptyMessage="No orders found." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};
