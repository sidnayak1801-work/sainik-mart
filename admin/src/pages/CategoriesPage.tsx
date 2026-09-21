import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { createCategory, deactivateCategory, listCategories, updateCategory } from "@/api/categories";
import { ApiError } from "@/api/client";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import catalog from "@/components/ui/catalog.module.css";
import modal from "@/components/ui/Modal.module.css";
import { useToast } from "@/components/ui/toast-context";
import type { Category } from "@/types/models";
import { formatDate } from "@/utils/format";

type StatusFilter = "all" | "active" | "inactive";

const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Unable to complete the request. Please try again.";

export const CategoriesPage = () => {
  const { notify } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<"create" | Category | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Category | null>(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listCategories());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    if (status === "active") return items.filter((item) => item.isActive);
    if (status === "inactive") return items.filter((item) => !item.isActive);
    return items;
  }, [items, status]);

  const openCreate = () => {
    setEditor("create");
    setName("");
    setFormError(null);
  };

  const openEdit = (category: Category) => {
    setEditor(category);
    setName(category.name);
    setFormError(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Name is required.");
      return;
    }
    if (trimmed.length > 120) {
      setFormError("Name must be 120 characters or fewer.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editor === "create") {
        await createCategory({ name: trimmed });
        notify("Category created.");
      } else if (editor) {
        await updateCategory(editor.id, { name: trimmed });
        notify("Category updated.");
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
        await deactivateCategory(pending.id);
        notify("Category deactivated.");
      } else {
        await updateCategory(pending.id, { isActive: true });
        notify("Category reactivated.");
      }
      setPending(null);
      await load();
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setWorking(false);
    }
  };

  const columns: Column<Category>[] = [
    { header: "Name", render: (row) => row.name },
    {
      header: "Status",
      render: (row) => (
        <StatusBadge kind={row.isActive ? "active" : "inactive"}>{row.isActive ? "Active" : "Inactive"}</StatusBadge>
      ),
    },
    { header: "Created", render: (row) => formatDate(row.createdAt) },
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
      <AdminPageHeader title="Categories" description="Organize products into grocery categories." />
      <div className={catalog.toolbar}>
        <select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="button" className={`${catalog.primary} ${catalog.grow}`} onClick={openCreate}>
          Add Category
        </button>
      </div>
      {loading ? (
        <p className={catalog.status}>Loading categories...</p>
      ) : error ? (
        <div className={catalog.status}>
          <p>{error}</p>
          <button type="button" className={catalog.primary} onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} emptyMessage="No categories found." />
      )}

      {editor ? (
        <Modal title={editor === "create" ? "Add Category" : "Edit Category"} onClose={() => setEditor(null)}>
          <form className={catalog.form} onSubmit={(event) => void onSubmit(event)}>
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} disabled={saving} />
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
          title={pending.isActive ? "Deactivate category" : "Reactivate category"}
          message={
            pending.isActive
              ? `Deactivate “${pending.name}”? Products in this category will be hidden from customers.`
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
