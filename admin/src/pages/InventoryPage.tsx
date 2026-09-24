import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { listCategories } from "@/api/categories";
import { ApiError } from "@/api/client";
import { listProducts, updateProduct } from "@/api/products";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import catalog from "@/components/ui/catalog.module.css";
import modal from "@/components/ui/Modal.module.css";
import { useToast } from "@/components/ui/toast-context";
import { PRODUCT_PAGE_SIZE } from "@/constants/inventory";
import type { Category, Pagination as PaginationMeta, Product, StockStatus } from "@/types/models";
import { useDebouncedValue } from "@/utils/debounce";
import { stockStatusLabel } from "@/utils/format";

const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Unable to complete the request. Please try again.";

const badgeKind = (quantity: number): "in" | "low" | "out" => {
  const label = stockStatusLabel(quantity);
  if (label === "Out of Stock") return "out";
  if (label === "Low Stock") return "low";
  return "in";
};

export const InventoryPage = () => {
  const { notify } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: PRODUCT_PAGE_SIZE, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockStatus, setStockStatus] = useState<"" | StockStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [stock, setStock] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const [productResult, categoryResult] = await Promise.all([
        listProducts({
          page,
          limit: PRODUCT_PAGE_SIZE,
          search: debouncedSearch || undefined,
          categoryId: categoryId || undefined,
          stockStatus: stockStatus || undefined,
        }),
        listCategories(),
      ]);
      if (id !== requestId.current) return;
      setItems(productResult.items);
      setPagination(productResult.pagination);
      setCategories(categoryResult);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(errorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [page, debouncedSearch, categoryId, stockStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, stockStatus]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const next = Number(stock);
    if (!Number.isInteger(next) || next < 0) {
      setFormError("Stock must be a whole number of 0 or greater.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await updateProduct(editing.id, { stockQuantity: next });
      notify("Stock updated.");
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Product>[] = [
    { header: "Product", render: (row) => row.name },
    { header: "Category", render: (row) => row.category.name },
    { header: "Current Stock", render: (row) => row.stockQuantity },
    {
      header: "Status",
      render: (row) => <StatusBadge kind={badgeKind(row.stockQuantity)}>{stockStatusLabel(row.stockQuantity)}</StatusBadge>,
    },
    {
      header: "Action",
      render: (row) => (
        <button
          type="button"
          className={catalog.link}
          onClick={() => {
            setEditing(row);
            setStock(String(row.stockQuantity));
            setFormError(null);
          }}
        >
          Update Stock
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Inventory" description="Watch stock levels across the catalog." />
      <div className={catalog.toolbar}>
        <input
          type="search"
          placeholder="Search products..."
          aria-label="Search inventory"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Stock status"
          value={stockStatus}
          onChange={(event) => setStockStatus(event.target.value as "" | StockStatus)}
        >
          <option value="">All</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
          <option value="in">In Stock</option>
        </select>
      </div>
      {loading ? (
        <p className={catalog.status}>Loading inventory...</p>
      ) : error ? (
        <div className={catalog.status}>
          <p>{error}</p>
          <button type="button" className={catalog.primary} onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <DataTable columns={columns} rows={items} rowKey={(row) => row.id} emptyMessage="No products found." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}

      {editing ? (
        <Modal title="Update Stock" onClose={() => setEditing(null)}>
          <form className={catalog.form} onSubmit={(event) => void onSubmit(event)}>
            <p>
              <strong>{editing.name}</strong>
              <br />
              Current stock: {editing.stockQuantity}
            </p>
            <label>
              New stock
              <input
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                required
                disabled={saving}
              />
            </label>
            {formError ? (
              <p className={catalog.error} role="alert">
                {formError}
              </p>
            ) : null}
            <div className={modal.actions}>
              <button type="button" className={catalog.secondary} onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className={catalog.primary} disabled={saving}>
                {saving ? "Saving..." : "Update Stock"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};
