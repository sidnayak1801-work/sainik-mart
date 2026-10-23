import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { createCategory, deactivateCategory, listCategories, updateCategory } from "@/api/categories";
import { ApiError } from "@/api/client";
import { createSubcategory } from "@/api/subcategories";
import { uploadImage } from "@/api/uploads";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import catalog from "@/components/ui/catalog.module.css";
import modal from "@/components/ui/Modal.module.css";
import { useToast } from "@/components/ui/toast-context";
import type { Category, Subcategory } from "@/types/models";
import { formatDate } from "@/utils/format";

type StatusFilter = "all" | "active" | "inactive";

type DraftSubcategory = {
  key: string;
  name: string;
  imageUrl: string;
};

const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Unable to complete the request. Please try again.";

const emptyDraft = (): DraftSubcategory => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  imageUrl: "",
});

export const CategoriesPage = () => {
  const { notify } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<"create" | Category | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [drafts, setDrafts] = useState<DraftSubcategory[]>([]);
  const [existingSubs, setExistingSubs] = useState<Subcategory[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<Category | null>(null);
  const [working, setWorking] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const next = await listCategories();
      if (id !== requestId.current) return;
      setItems(next);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(errorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
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
    setImageUrl("");
    setDrafts([emptyDraft()]);
    setExistingSubs([]);
    setFormError(null);
  };

  const openEdit = (category: Category) => {
    setEditor(category);
    setName(category.name);
    setImageUrl(category.imageUrl ?? "");
    setDrafts([emptyDraft()]);
    setExistingSubs(category.subcategories ?? []);
    setFormError(null);
  };

  const onPickImage = async (event: ChangeEvent<HTMLInputElement>, target: "category" | string) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setFormError(null);
    try {
      const uploaded = await uploadImage(file);
      if (target === "category") {
        setImageUrl(uploaded.url);
      } else {
        setDrafts((current) =>
          current.map((item) => (item.key === target ? { ...item, imageUrl: uploaded.url } : item)),
        );
      }
      notify("Image uploaded.");
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setUploading(false);
    }
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
    const readyDrafts = drafts
      .map((item) => ({ ...item, name: item.name.trim() }))
      .filter((item) => item.name.length > 0);
    if (readyDrafts.some((item) => item.name.length > 120)) {
      setFormError("Subcategory name must be 120 characters or fewer.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const imageValue = imageUrl.trim() === "" ? null : imageUrl.trim();
      let categoryId = "";
      if (editor === "create") {
        const created = await createCategory({ name: trimmed, imageUrl: imageValue });
        categoryId = created.id;
        notify("Category created.");
      } else if (editor) {
        await updateCategory(editor.id, { name: trimmed, imageUrl: imageValue });
        categoryId = editor.id;
        notify("Category updated.");
      }
      for (const draft of readyDrafts) {
        await createSubcategory(categoryId, {
          name: draft.name,
          imageUrl: draft.imageUrl.trim() === "" ? undefined : draft.imageUrl.trim(),
        });
      }
      if (readyDrafts.length > 0) {
        notify("Subcategories saved.");
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
    {
      header: "Image",
      render: (row) =>
        row.imageUrl ? <img className={catalog.preview} src={row.imageUrl} alt="" /> : <span>—</span>,
    },
    { header: "Name", render: (row) => row.name },
    {
      header: "Subcategories",
      render: (row) => row.subcategories?.filter((item) => item.isActive).length ?? 0,
    },
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

  const busy = saving || uploading;

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
              <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} disabled={busy} />
            </label>
            <label>
              Category picture
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Category picture"
                onChange={(event) => void onPickImage(event, "category")}
                disabled={busy}
              />
            </label>
            <label>
              Image URL
              <input
                type="url"
                aria-label="Category image URL"
                placeholder="https://…"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                disabled={busy}
              />
            </label>
            {imageUrl.trim() ? <img className={catalog.preview} src={imageUrl.trim()} alt="Category preview" /> : null}

            <p className={catalog.status} style={{ padding: "8px 0", textAlign: "left" }}>
              Subcategories (name required, picture optional)
            </p>
            {existingSubs
              .filter((item) => item.isActive)
              .map((item) => (
                <div key={item.id} className={catalog.form}>
                  <label>
                    Existing subcategory
                    <input value={item.name} disabled />
                  </label>
                  {item.imageUrl ? <img className={catalog.preview} src={item.imageUrl} alt="" /> : null}
                </div>
              ))}
            {drafts.map((draft) => (
              <div key={draft.key} className={catalog.form}>
                <label>
                  Subcategory name
                  <input
                    value={draft.name}
                    maxLength={120}
                    placeholder="e.g. Atta"
                    onChange={(event) =>
                      setDrafts((current) =>
                        current.map((item) => (item.key === draft.key ? { ...item, name: event.target.value } : item)),
                      )
                    }
                    disabled={busy}
                  />
                </label>
                <label>
                  Subcategory picture (optional)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label={`Subcategory picture ${draft.key}`}
                    onChange={(event) => void onPickImage(event, draft.key)}
                    disabled={busy}
                  />
                </label>
                <label>
                  Subcategory image URL
                  <input
                    type="url"
                    placeholder="https://…"
                    value={draft.imageUrl}
                    onChange={(event) =>
                      setDrafts((current) =>
                        current.map((item) =>
                          item.key === draft.key ? { ...item, imageUrl: event.target.value } : item,
                        ),
                      )
                    }
                    disabled={busy}
                  />
                </label>
                {draft.imageUrl.trim() ? (
                  <img className={catalog.preview} src={draft.imageUrl.trim()} alt="Subcategory preview" />
                ) : null}
              </div>
            ))}
            <button
              type="button"
              className={catalog.secondary}
              onClick={() => setDrafts((current) => [...current, emptyDraft()])}
              disabled={busy}
            >
              Add another subcategory
            </button>

            {uploading ? <p className={catalog.status}>Uploading image...</p> : null}
            {formError ? (
              <p className={catalog.error} role="alert">
                {formError}
              </p>
            ) : null}
            <div className={modal.actions}>
              <button type="button" className={catalog.secondary} onClick={() => setEditor(null)} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className={catalog.primary} disabled={busy}>
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
