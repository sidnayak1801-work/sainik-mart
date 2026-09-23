import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { listCategories } from "@/api/categories";
import { ApiError } from "@/api/client";
import { createProduct, deactivateProduct, listProducts, updateProduct, type ProductInput } from "@/api/products";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import catalog from "@/components/ui/catalog.module.css";
import modal from "@/components/ui/Modal.module.css";
import { useToast } from "@/components/ui/toast-context";
import { PRODUCT_PAGE_SIZE } from "@/constants/inventory";
import type { Category, Pagination as PaginationMeta, Product } from "@/types/models";
import { useDebouncedValue } from "@/utils/debounce";
import { formatMoney } from "@/utils/format";

type StatusFilter = "all" | "true" | "false";

const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Unable to complete the request. Please try again.";

type FormState = {
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  categoryId: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  discountPrice: "",
  stockQuantity: "0",
  categoryId: "",
  isActive: true,
});

const formFromProduct = (product: Product): FormState => ({
  name: product.name,
  description: product.description,
  imageUrl: product.imageUrl ?? "",
  price: String(product.price),
  discountPrice: product.discountPrice === null ? "" : String(product.discountPrice),
  stockQuantity: String(product.stockQuantity),
  categoryId: product.categoryId,
  isActive: product.isActive,
});

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const parseForm = (form: FormState, mode: "create" | "edit"): { input?: ProductInput; error?: string } => {
  const name = form.name.trim();
  const description = form.description.trim();
  const imageRaw = form.imageUrl.trim();
  const price = Number(form.price);
  const stockQuantity = Number(form.stockQuantity);
  const discountRaw = form.discountPrice.trim();
  const discountPrice = discountRaw === "" ? undefined : Number(discountRaw);

  if (!name) return { error: "Name is required." };
  if (!description) return { error: "Description is required." };
  if (!form.categoryId) return { error: "Category is required." };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be 0 or greater." };
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) return { error: "Stock must be a whole number of 0 or greater." };
  if (discountPrice !== undefined && (!Number.isFinite(discountPrice) || discountPrice < 0)) {
    return { error: "Discount price must be 0 or greater." };
  }
  if (discountPrice !== undefined && discountPrice > price) {
    return { error: "Discount price cannot exceed regular price." };
  }
  if (imageRaw && !isHttpUrl(imageRaw)) {
    return { error: "Image URL must be a valid http(s) link." };
  }

  return {
    input: {
      name,
      description,
      price,
      discountPrice,
      imageUrl: imageRaw === "" ? (mode === "edit" ? null : undefined) : imageRaw,
      stockQuantity,
      categoryId: form.categoryId,
      isActive: form.isActive,
    },
  };
};

export const ProductsPage = () => {
  const { notify } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: PRODUCT_PAGE_SIZE, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<"create" | Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Product | null>(null);
  const [working, setWorking] = useState(false);
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
          isActive: status === "all" ? undefined : status === "true",
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
  }, [page, debouncedSearch, categoryId, status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, status]);

  const openCreate = () => {
    setEditor("create");
    setForm(emptyForm());
    setFormError(null);
  };

  const openEdit = (product: Product) => {
    setEditor(product);
    setForm(formFromProduct(product));
    setFormError(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseForm(form, editor === "create" ? "create" : "edit");
    if (parsed.error || !parsed.input) {
      setFormError(parsed.error ?? "Please check the form.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editor === "create") {
        await createProduct(parsed.input);
        notify("Product created.");
      } else if (editor) {
        await updateProduct(editor.id, parsed.input);
        notify("Product updated.");
      }
      setEditor(null);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onConfirmStatus = async () => {
    if (!pending) return;
    setWorking(true);
    try {
      if (pending.isActive) {
        await deactivateProduct(pending.id);
        notify("Product deactivated.");
      } else {
        await updateProduct(pending.id, { isActive: true });
        notify("Product reactivated.");
      }
      setPending(null);
      await load();
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setWorking(false);
    }
  };

  const columns: Column<Product>[] = [
    { header: "Name", render: (row) => row.name },
    { header: "Category", render: (row) => row.category.name },
    { header: "Price", render: (row) => formatMoney(row.price) },
    { header: "Discount", render: (row) => (row.discountPrice === null ? "—" : formatMoney(row.discountPrice)) },
    { header: "Stock", render: (row) => row.stockQuantity },
    {
      header: "Status",
      render: (row) => (
        <StatusBadge kind={row.isActive ? "active" : "inactive"}>{row.isActive ? "Active" : "Inactive"}</StatusBadge>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className={catalog.rowActions}>
          <button type="button" className={catalog.link} onClick={() => openEdit(row)}>
            Edit
          </button>
          <button type="button" className={catalog.link} onClick={() => setPending(row)}>
            {row.isActive ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Products" description="Catalog products for the customer app." />
      <div className={catalog.toolbar}>
        <input
          type="search"
          placeholder="Search products..."
          aria-label="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.isActive ? "" : " (Inactive)"}
            </option>
          ))}
        </select>
        <select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button type="button" className={`${catalog.primary} ${catalog.grow}`} onClick={openCreate}>
          Add Product
        </button>
      </div>
      {loading ? (
        <p className={catalog.status}>Loading products...</p>
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

      {editor ? (
        <Modal title={editor === "create" ? "Add Product" : "Edit Product"} onClose={() => setEditor(null)}>
          <form className={catalog.form} onSubmit={(event) => void onSubmit(event)}>
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required disabled={saving} />
            </label>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
                disabled={saving}
              />
            </label>
            <label>
              Image URL
              <input
                type="url"
                aria-label="Image URL"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                disabled={saving}
              />
            </label>
            {form.imageUrl.trim() ? (
              <img className={catalog.preview} src={form.imageUrl.trim()} alt="Product image preview" />
            ) : null}
            <label>
              Price
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                required
                disabled={saving}
              />
            </label>
            <label>
              Discount price
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.discountPrice}
                onChange={(event) => setForm((current) => ({ ...current, discountPrice: event.target.value }))}
                disabled={saving}
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                min={0}
                step={1}
                value={form.stockQuantity}
                onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))}
                required
                disabled={saving}
              />
            </label>
            <label>
              Category
              <select
                value={form.categoryId}
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                required
                disabled={saving}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.isActive ? "" : " (Inactive)"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  disabled={saving}
                />{" "}
                Active
              </span>
            </label>
            {formError ? (
              <p className={catalog.error} role="alert">
                {formError}
              </p>
            ) : null}
            <div className={modal.actions}>
              <button type="button" className={catalog.secondary} onClick={() => setEditor(null)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className={catalog.primary} disabled={saving}>
                {saving ? "Saving..." : editor === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {pending ? (
        <ConfirmDialog
          title={pending.isActive ? "Deactivate product" : "Reactivate product"}
          message={
            pending.isActive
              ? `Deactivate “${pending.name}”? Customers will no longer see it. Past orders keep their original prices.`
              : `Reactivate “${pending.name}”?`
          }
          confirmLabel={pending.isActive ? "Deactivate" : "Reactivate"}
          pending={working}
          onCancel={() => setPending(null)}
          onConfirm={() => void onConfirmStatus()}
        />
      ) : null}
    </div>
  );
};
