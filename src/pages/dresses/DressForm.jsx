
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";

const initialForm = {
  name: "",
  description: "",
  size: "",
  color: "",
  categoryId: "",
  location: "IN_SALON",
  expectedReturnDate: "",
  unavailable: false,
};

const locationLabels = {
  IN_SALON: "Në sallon",
  WITH_BRIDE: "Te nusja",
  IN_CLEANING: "Në pastrim",
};

function getBackendMessage(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (!error?.response) {
    return "Nuk mund të lidhemi me serverin. Kontrolloni lidhjen dhe nëse backend-i është aktiv.";
  }

  // Spring Boot may return validation errors in different formats.
  const messages = [];

  if (typeof data === "string" && data.trim()) {
    messages.push(data.trim());
  }

  if (data && typeof data === "object") {
    if (typeof data.message === "string") messages.push(data.message);
    if (typeof data.detail === "string") messages.push(data.detail);
    if (typeof data.error === "string") messages.push(data.error);

    if (Array.isArray(data.errors)) {
      data.errors.forEach((item) => {
        if (typeof item === "string") {
          messages.push(item);
        } else if (item && typeof item === "object") {
          messages.push(
            item.defaultMessage ||
              item.message ||
              item.detail ||
              ""
          );
        }
      });
    } else if (data.errors && typeof data.errors === "object") {
      Object.values(data.errors).forEach((value) => {
        if (typeof value === "string") {
          messages.push(value);
        } else if (Array.isArray(value)) {
          messages.push(...value.filter((v) => typeof v === "string"));
        }
      });
    }

    if (Array.isArray(data.fieldErrors)) {
      data.fieldErrors.forEach((item) => {
        if (item?.defaultMessage) messages.push(item.defaultMessage);
      });
    }
  }

  const original = [...new Set(messages.filter(Boolean))].join(" ");
  const text = original.toLowerCase();

  // Preserve the backend's specific business rules.
  const duplicateMatch = original.match(
    /A dress named ["“]?(.+?)["”]? in size (.+?) already exists/i
  );

  if (
    duplicateMatch ||
    (text.includes("already exists") && text.includes("size"))
  ) {
    return original
      ? `Ky kombinim i emrit dhe madhësisë ekziston tashmë. ${translateBackendMessage(original)}`
      : "Ky fustan ekziston tashmë me të njëjtin emër dhe madhësi. Ndryshoni emrin, për shembull, duke shtuar numrin 2.";
  }

  if (
    text.includes("expected return date is required") ||
    text.includes("return date is required")
  ) {
    if (text.includes("in cleaning")) {
      return "Për një fustan në pastrim, duhet të vendosni datën e pritshme të kthimit.";
    }
    if (text.includes("with a bride")) {
      return "Për një fustan që ndodhet te nusja, duhet të vendosni datën e pritshme të kthimit.";
    }
    return "Data e pritshme e kthimit është e detyrueshme për këtë vendndodhje.";
  }

  if (text.includes("category not found")) {
    return "Kategoria e zgjedhur nuk u gjet. Rifreskoni listën e kategorive dhe zgjidhni një kategori ekzistuese.";
  }

  if (text.includes("name must not be blank")) {
    return "Emri i fustanit është i detyrueshëm.";
  }

  if (text.includes("size must not be blank")) {
    return "Madhësia e fustanit është e detyrueshme.";
  }

  if (text.includes("color must not be blank")) {
    return "Ngjyra e fustanit është e detyrueshme.";
  }

  if (text.includes("name") && (text.includes("must not be blank") || text.includes("must not be empty"))) {
    return "Emri i fustanit është i detyrueshëm.";
  }

  if (text.includes("size") && (text.includes("must not be blank") || text.includes("must not be empty"))) {
    return "Madhësia e fustanit është e detyrueshme.";
  }

  if (text.includes("color") && (text.includes("must not be blank") || text.includes("must not be empty"))) {
    return "Ngjyra e fustanit është e detyrueshme.";
  }

  if (text.includes("name") && (text.includes("size") || text.includes("length"))) {
    return "Kontrolloni emrin e fustanit: ai nuk duhet të kalojë 255 karaktere.";
  }

  if (text.includes("size") && (text.includes("length") || text.includes("50"))) {
    return "Madhësia nuk duhet të kalojë 50 karaktere.";
  }

  if (text.includes("color") && (text.includes("length") || text.includes("100"))) {
    return "Ngjyra nuk duhet të kalojë 100 karaktere.";
  }

  if (text.includes("description") && (text.includes("length") || text.includes("255"))) {
    return "Përshkrimi i fustanit është shumë i gjatë.";
  }

  if (text.includes("name") && text.includes("already exists")) {
    return "Ekziston tashmë një fustan me këtë emër dhe madhësi. Ndryshoni emrin, për shembull, duke shtuar një numër.";
  }

  if (text.includes("validation failed") || text.includes("validation error")) {
    return "Disa të dhëna nuk janë të vlefshme. Kontrolloni emrin, madhësinë, ngjyrën dhe kategorinë.";
  }

  if (status === 400) {
    return original
      ? translateBackendMessage(original)
      : "Të dhënat e dërguara nuk janë të vlefshme. Kontrolloni fushat e formularit.";
  }

  if (status === 404) {
    return original
      ? translateBackendMessage(original)
      : "Burimi i kërkuar nuk u gjet. Kontrolloni kategorinë ose adresën e API-së.";
  }

  if (status === 409) {
    return original
      ? translateBackendMessage(original)
      : "Ka një konflikt me të dhënat ekzistuese. Kontrolloni emrin dhe madhësinë e fustanit.";
  }

  if (status >= 500) {
    return original
      ? `Gabim në server: ${translateBackendMessage(original)}`
      : "Ndodhi një gabim në server gjatë ruajtjes së fustanit. Kontrolloni log-et e backend-it.";
  }

  return original
    ? translateBackendMessage(original)
    : `Kërkesa dështoi (HTTP ${status}).`;
}

function translateBackendMessage(message) {
  return message
    .replace(
      /A dress named "(.+?)" in size (.+?) already exists\. Add a number to the name, for example "(.+?)"\./i,
      'Fustani "$1" në madhësinë $2 ekziston tashmë. Shtoni një numër te emri, për shembull "$3".'
    )
    .replace(
      /Category not found with id: (\d+)/gi,
      "Kategoria me ID $1 nuk u gjet."
    )
    .replace(
      /Expected return date is required when the dress is in cleaning\./gi,
      "Data e kthimit është e detyrueshme kur fustani është në pastrim."
    )
    .replace(
      /Expected return date is required when the dress is with a bride\./gi,
      "Data e kthimit është e detyrueshme kur fustani është te nusja."
    )
    .replace(/Name must not be blank\./gi, "Emri nuk mund të jetë bosh.")
    .replace(/Size must not be blank\./gi, "Madhësia nuk mund të jetë bosh.")
    .replace(/Color must not be blank\./gi, "Ngjyra nuk mund të jetë bosh.")
    .replace(/Description must not be blank\./gi, "Përshkrimi nuk mund të jetë bosh.")
    .replace(/Expected return date/gi, "Data e pritshme e kthimit")
    .replace(/Category/gi, "Kategoria")
    .replace(/Dress/gi, "Fustani")
    .replace(/Size/gi, "Madhësia")
    .replace(/Name/gi, "Emri")
    .replace(/Color/gi, "Ngjyra")
    .replace(/must not be blank/gi, "nuk mund të jetë bosh")
    .replace(/must not be null/gi, "është e detyrueshme")
    .replace(/must be greater than or equal to 0/gi, "duhet të jetë të paktën 0");
}

export default function DressForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const needsReturnDate =
    form.location === "WITH_BRIDE" || form.location === "IN_CLEANING";

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setCategoriesLoading(true);

      try {
        const response = await api.get("/categories");
        const data = response.data;

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.categories)
              ? data.categories
              : [];

        if (active) {
          setCategories(items);
          if (items.length === 0) {
            setError("Nuk ka kategori të disponueshme. Krijoni fillimisht një kategori.");
          }
        }
      } catch (err) {
        if (active) {
          setError(
            `Kategoritë nuk mund të ngarkohen. ${getBackendMessage(err)}`
          );
        }
      } finally {
        if (active) setCategoriesLoading(false);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "location" && value === "IN_SALON"
        ? { expectedReturnDate: "" }
        : {}),
    }));

    setError("");
    setNotice("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] ?? null;

    setImage(file);
    setError("");
    setNotice("");

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    if (file) {
      if (!file.type.startsWith("image/")) {
        setImage(null);
        setImagePreview("");
        setError("Zgjidhni një skedar fotografie në format të vlefshëm.");
        event.target.value = "";
        return;
      }

      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const name = form.name.trim();
    const size = form.size.trim();
    const color = form.color.trim();

    if (!name) {
      setError("Ju lutemi, shkruani emrin e fustanit.");
      return;
    }

    if (name.length > 255) {
      setError("Emri i fustanit nuk duhet të kalojë 255 karaktere.");
      return;
    }

    if (!size) {
      setError("Ju lutemi, zgjidhni madhësinë e fustanit.");
      return;
    }

    if (size.length > 50) {
      setError("Madhësia e fustanit nuk duhet të kalojë 50 karaktere.");
      return;
    }

    if (!color) {
      setError("Ju lutemi, shkruani ngjyrën e fustanit.");
      return;
    }

    if (color.length > 100) {
      setError("Ngjyra e fustanit nuk duhet të kalojë 100 karaktere.");
      return;
    }

    if (!form.categoryId) {
      setError("Ju lutemi, zgjidhni kategorinë e fustanit.");
      return;
    }

    if (needsReturnDate && !form.expectedReturnDate) {
      setError(
        form.location === "IN_CLEANING"
          ? "Për një fustan në pastrim, data e pritshme e kthimit është e detyrueshme."
          : "Për një fustan te nusja, data e pritshme e kthimit është e detyrueshme."
      );
      return;
    }

    if (image && !image.type.startsWith("image/")) {
      setError("Skedari i zgjedhur nuk është fotografi.");
      return;
    }

    const payload = {
      name,
      description: form.description.trim() || null,
      size,
      color,
      categoryId: Number(form.categoryId),
      location: form.location,
      expectedReturnDate: needsReturnDate
        ? form.expectedReturnDate
        : null,
      unavailable: form.unavailable,
    };

    setLoading(true);

    let createdDress;

    try {
      const response = await api.post("/dresses", payload);
      createdDress = response.data;

      const dressId = createdDress?.id;

      if (!dressId) {
        setNotice(
          "Serveri e ka pranuar kërkesën, por nuk ktheu ID-në e fustanit. Kontrolloni listën e fustaneve përpara se ta provoni përsëri."
        );
        return;
      }

      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);

        try {
          await api.post(`/dresses/${dressId}/image`, imageData);
        } catch (imageError) {
          setNotice(
            `Fustani u ruajt me sukses (ID: ${dressId}), por fotografia nuk u ngarkua. Mund ta ngarkoni më vonë te detajet e fustanit.`
          );
          setError(`Gabim gjatë ngarkimit të fotografisë: ${getBackendMessage(imageError)}`);
          return;
        }
      }

      navigate(`/dresses/${dressId}`);
    } catch (err) {
      setError(getBackendMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-7">
        <button
          type="button"
          onClick={() => navigate("/dresses")}
          className="mb-4 text-sm text-[var(--text-muted)] transition hover:text-[var(--pink-dark)]"
        >
          ← Kthehu te fustanet
        </button>

        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          Shto fustan të ri
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Plotësoni të dhënat e fustanit për ta regjistruar në sistem.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {notice}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm sm:p-8"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
          >
            Emri i fustanit *
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={255}
            required
            placeholder="P.sh. Aurora"
            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
          >
            Përshkrimi
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Përshkrimi i fustanit (opsional)"
            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="size"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Madhësia *
            </label>
            <input
              id="size"
              name="size"
              value={form.size}
              onChange={handleChange}
              maxLength={50}
              required
              placeholder="P.sh. S, M, L ose 36"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
            />
          </div>

          <div>
            <label
              htmlFor="color"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Ngjyra *
            </label>
            <input
              id="color"
              name="color"
              value={form.color}
              onChange={handleChange}
              maxLength={100}
              required
              placeholder="P.sh. E bardhë"
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
          >
            Kategoria *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            disabled={categoriesLoading || categories.length === 0}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)] disabled:opacity-60"
          >
            <option value="">
              {categoriesLoading
                ? "Duke ngarkuar kategoritë..."
                : categories.length === 0
                  ? "Nuk ka kategori të disponueshme"
                  : "Zgjidhni kategorinë"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {categories.length === 0 && !categoriesLoading && (
            <button
              type="button"
              onClick={() => navigate("/categories")}
              className="mt-2 text-sm font-medium text-[var(--pink-dark)] hover:underline"
            >
              Shko te kategoritë për të krijuar një kategori
            </button>
          )}
        </div>

        <div>
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
          >
            Vendndodhja *
          </label>
          <select
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
          >
            {Object.entries(locationLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {needsReturnDate && (
          <div>
            <label
              htmlFor="expectedReturnDate"
              className="mb-2 block text-sm font-medium text-[var(--foreground)]"
            >
              Data e pritshme e kthimit *
            </label>
            <input
              id="expectedReturnDate"
              name="expectedReturnDate"
              type="date"
              value={form.expectedReturnDate}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--pink-dark)]"
            />
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {form.location === "IN_CLEANING"
                ? "Vendosni datën kur fustani pritet të kthehet nga pastrimi."
                : "Vendosni datën kur fustani pritet të kthehet nga nusja."}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="image"
            className="mb-2 block text-sm font-medium text-[var(--foreground)]"
          >
            Fotografia e fustanit
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-[var(--text-muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--pink-light)] file:px-4 file:py-2 file:font-medium file:text-[var(--pink-dark)]"
          />

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Pamja paraprake e fustanit"
                className="max-h-72 rounded-xl border border-[var(--border)] object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview("");
                  const input = document.getElementById("image");
                  if (input) input.value = "";
                }}
                className="mt-2 text-sm text-[var(--pink-dark)] hover:underline"
              >
                Hiq fotografinë
              </button>
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4">
          <input
            type="checkbox"
            name="unavailable"
            checked={form.unavailable}
            onChange={handleChange}
            className="mt-1 accent-pink-600"
          />
          <span>
            <span className="block text-sm font-medium text-[var(--foreground)]">
              Shënoje si të padisponueshëm
            </span>
            <span className="mt-1 block text-xs text-[var(--text-muted)]">
              Fustani do të regjistrohet, por nuk do të llogaritet si i disponueshëm për qira.
            </span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dresses")}
            disabled={loading}
            className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--pink-light)] disabled:opacity-50"
          >
            Anulo
          </button>

          <button
            type="submit"
            disabled={loading || categoriesLoading || categories.length === 0}
            className="rounded-xl bg-[var(--pink-dark)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Duke ruajtur..." : "Ruaj fustanin"}
          </button>
        </div>
      </form>
    </div>
  );
}
