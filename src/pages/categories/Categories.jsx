
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Tags,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axiosConfig";

const EMPTY_FORM = {
  name: "",
  description: "",
};

function getBackendMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;

  if (error?.request && !error?.response) {
    return "Nuk mund të lidhemi me serverin. Kontrolloni lidhjen dhe provoni përsëri.";
  }

  return "Ndodhi një gabim i papritur. Provoni përsëri.";
}

function translateError(message) {
  if (!message) return "Ndodhi një gabim. Provoni përsëri.";

  const text = String(message);
  const lower = text.toLowerCase();

  if (
    lower.includes("already exists") ||
    lower.includes("already exist") ||
    lower.includes("duplicate") ||
    lower.includes("unique constraint")
  ) {
    return "Ekziston tashmë një kategori me këtë emër.";
  }

  if (lower.includes("name is required")) {
    return "Emri i kategorisë është i detyrueshëm.";
  }

  if (lower.includes("name must not be blank")) {
    return "Emri i kategorisë nuk mund të jetë bosh.";
  }

  if (
    lower.includes("size must be between") ||
    lower.includes("size must not exceed") ||
    lower.includes("size")
  ) {
    return "Emri i kategorisë nuk duhet të përmbajë më shumë se 255 karaktere.";
  }

  if (lower.includes("still has") && lower.includes("dress")) {
    return "Kjo kategori përmban fustane. Zhvendosini fustanet në një kategori tjetër përpara se ta fshini.";
  }

  if (lower.includes("category not found")) {
    return "Kategoria nuk u gjet. Rifreskoni listën dhe provoni përsëri.";
  }

  if (lower.includes("forbidden") || lower.includes("403")) {
    return "Nuk keni leje për ta kryer këtë veprim.";
  }

  if (lower.includes("unauthorized") || lower.includes("401")) {
    return "Sesioni ka përfunduar ose nuk jeni të autorizuar. Hyni përsëri.";
  }

  if (lower.includes("internal server error") || lower.includes("500")) {
    return "Ndodhi një gabim në server. Provoni përsëri më vonë.";
  }

  return text;
}

function getErrorMessage(error) {
  return translateError(getBackendMessage(error));
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editError, setEditError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/categories");

      // CategoryController returns List<CategoryResponse>.
      const data = response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function clearMessages() {
    setPageError("");
    setSuccessMessage("");
  }

  function startAdding() {
    clearMessages();
    setAdding(true);
    setNewCategory(EMPTY_FORM);
    setAddError("");
    setEditingId(null);
  }

  function cancelAdding() {
    setAdding(false);
    setNewCategory(EMPTY_FORM);
    setAddError("");
  }

  function startEditing(category) {
    clearMessages();
    setAdding(false);
    setEditingId(category.id);
    setEditForm({
      name: category.name ?? "",
      description: category.description ?? "",
    });
    setEditError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditError("");
  }

  async function handleCreate(event) {
    event.preventDefault();
    clearMessages();
    setAddError("");

    const name = newCategory.name.trim();
    const description = newCategory.description.trim();

    if (!name) {
      setAddError("Emri i kategorisë është i detyrueshëm.");
      return;
    }

    if (name.length > 255) {
      setAddError(
        "Emri i kategorisë nuk duhet të përmbajë më shumë se 255 karaktere."
      );
      return;
    }

    setSaving(true);

    try {
      await api.post("/categories", {
        name,
        description: description || null,
      });

      setAdding(false);
      setNewCategory(EMPTY_FORM);
      setSuccessMessage("Kategoria u krijua me sukses.");
      await loadCategories();
    } catch (error) {
      setAddError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event, categoryId) {
    event.preventDefault();
    clearMessages();
    setEditError("");

    const name = editForm.name.trim();
    const description = editForm.description.trim();

    if (!name) {
      setEditError("Emri i kategorisë nuk mund të jetë bosh.");
      return;
    }

    if (name.length > 255) {
      setEditError(
        "Emri i kategorisë nuk duhet të përmbajë më shumë se 255 karaktere."
      );
      return;
    }

    setSaving(true);

    try {
      await api.patch(`/categories/${categoryId}`, {
        name,
        description,
      });

      setEditingId(null);
      setEditForm(EMPTY_FORM);
      setSuccessMessage("Kategoria u përditësua me sukses.");
      await loadCategories();
    } catch (error) {
      setEditError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    clearMessages();

    if (Number(category.dressCount) > 0) {
      setPageError(
        "Kjo kategori përmban fustane. Zhvendosini fustanet në një kategori tjetër përpara se ta fshini."
      );
      return;
    }

    const confirmed = window.confirm(
      `A jeni të sigurt që dëshironi të fshini kategorinë "${category.name}"?`
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      await api.delete(`/categories/${category.id}`);
      setSuccessMessage("Kategoria u fshi me sukses.");
      await loadCategories();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--pink-dark)]">
            DANIDA BRIDAL
          </p>
          <h1 className="font-serif text-3xl text-[var(--foreground)] sm:text-4xl">
            Kategoritë
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            Organizoni koleksionin tuaj duke krijuar dhe menaxhuar kategoritë e
            fustaneve.
          </p>
        </div>

        <button
          type="button"
          onClick={startAdding}
          disabled={adding || loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--pink-dark)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={17} />
          Shto kategori
        </button>
      </div>

      {/* Feedback messages */}
      {pageError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{pageError}</p>
          <button
            type="button"
            onClick={() => setPageError("")}
            aria-label="Mbyll mesazhin"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          <p>{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Mbyll mesazhin"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Inline add form */}
      {adding && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-[var(--pink-light)] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5">
            <h2 className="font-serif text-xl text-[var(--foreground)]">
              Kategori e re
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Plotësoni të dhënat e kategorisë së re.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="new-category-name"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Emri <span className="text-red-500">*</span>
              </label>
              <input
                id="new-category-name"
                type="text"
                maxLength={255}
                required
                autoFocus
                value={newCategory.name}
                onChange={(event) =>
                  setNewCategory((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="p.sh. Fustane nusërie"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--pink-dark)]"
              />
            </div>

            <div>
              <label
                htmlFor="new-category-description"
                className="mb-2 block text-sm font-medium text-[var(--foreground)]"
              >
                Përshkrimi
              </label>
              <input
                id="new-category-description"
                type="text"
                value={newCategory.description}
                onChange={(event) =>
                  setNewCategory((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Përshkrim opsional"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--pink-dark)]"
              />
            </div>
          </div>

          {addError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {addError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={cancelAdding}
              disabled={saving}
              className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background)] disabled:opacity-50"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--pink-dark)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {saving ? "Duke ruajtur..." : "Ruaj kategorinë"}
            </button>
          </div>
        </form>
      )}

      {/* Categories list */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-serif text-xl text-[var(--foreground)]">
              Lista e kategorive
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {categories.length}{" "}
              {categories.length === 1 ? "kategori" : "kategori gjithsej"}
            </p>
          </div>

          <button
            type="button"
            onClick={loadCategories}
            disabled={loading || saving}
            title="Rifresko listën"
            aria-label="Rifresko listën"
            className="rounded-full border border-[var(--border)] p-2.5 text-[var(--text-muted)] transition hover:bg-[var(--background)] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-[var(--text-muted)]">
            <LoaderCircle size={20} className="animate-spin" />
            Duke ngarkuar kategoritë...
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--pink-light)] text-[var(--pink-dark)]">
              <Tags size={24} />
            </div>
            <h3 className="font-serif text-xl text-[var(--foreground)]">
              Nuk ka ende kategori
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
              Krijoni kategorinë e parë për të filluar organizimin e
              koleksionit tuaj të fustaneve.
            </p>
            {!adding && (
              <button
                type="button"
                onClick={startAdding}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--pink-dark)] px-5 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                <Plus size={16} />
                Krijo kategorinë e parë
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {categories.map((category) => {
              const isEditing = editingId === category.id;

              return (
                <div
                  key={category.id}
                  className="px-5 py-5 transition hover:bg-[var(--background)]/50 sm:px-6"
                >
                  {isEditing ? (
                    <form
                      onSubmit={(event) =>
                        handleUpdate(event, category.id)
                      }
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={`category-name-${category.id}`}
                            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                          >
                            Emri <span className="text-red-500">*</span>
                          </label>
                          <input
                            id={`category-name-${category.id}`}
                            type="text"
                            maxLength={255}
                            required
                            autoFocus
                            value={editForm.name}
                            onChange={(event) =>
                              setEditForm((previous) => ({
                                ...previous,
                                name: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--pink-dark)]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`category-description-${category.id}`}
                            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                          >
                            Përshkrimi
                          </label>
                          <input
                            id={`category-description-${category.id}`}
                            type="text"
                            value={editForm.description}
                            onChange={(event) =>
                              setEditForm((previous) => ({
                                ...previous,
                                description: event.target.value,
                              }))
                            }
                            placeholder="Përshkrim opsional"
                            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--pink-dark)]"
                          />
                        </div>
                      </div>

                      {editError && (
                        <p role="alert" className="mt-3 text-sm text-red-600">
                          {editError}
                        </p>
                      )}

                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-white disabled:opacity-50"
                        >
                          <X size={15} />
                          Anulo
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-full bg-[var(--pink-dark)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {saving ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={15} />
                          )}
                          Ruaj ndryshimet
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <h3 className="break-words font-medium text-[var(--foreground)]">
                          {category.name}
                        </h3>
                        <p className="mt-1 break-words text-sm leading-5 text-[var(--text-muted)]">
                          {category.description?.trim() ||
                            "Pa përshkrim"}
                        </p>
                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          {Number(category.dressCount) || 0}{" "}
                          {(Number(category.dressCount) || 0) === 1
                            ? "fustan"
                            : "fustane"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(category)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--foreground)] transition hover:border-[var(--pink-dark)] hover:bg-white disabled:opacity-50"
                        >
                          <Pencil size={15} />
                          Ndrysho
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={saving || Number(category.dressCount) > 0}
                          title={
                            Number(category.dressCount) > 0
                              ? "Zhvendosni fustanet përpara fshirjes së kategorisë"
                              : "Fshi kategorinë"
                          }
                          aria-label={`Fshi kategorinë ${category.name}`}
                          className="inline-flex items-center justify-center rounded-full border border-red-200 p-2.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Categories;
