
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Save,
  LoaderCircle,
  ClipboardList,
  AlertCircle,
  X,
} from 'lucide-react'
import api from '../../api/axiosConfig'

const API_BASE = 'http://localhost:8080'

const LOCATIONS = [
  { value: 'IN_SALON', label: 'Në sallon' },
  { value: 'WITH_BRIDE', label: 'Te nusja' },
  { value: 'IN_CLEANING', label: 'Në pastrim' },
]

const initialForm = {
  name: '',
  categoryId: '',
  size: '',
  color: '',
  description: '',
  location: 'IN_SALON',
  expectedReturnDate: '',
  unavailable: false,
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return ''

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  return `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}

export default function UpdateDress() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialForm)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [currentImageUrl, setCurrentImageUrl] = useState('')

  useEffect(() => {
    let active = true

    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const [dressResponse, categoriesResponse] = await Promise.all([
          api.get(`/dresses/${id}`),
          api.get('/categories'),
        ])

        if (!active) return

        const dress = dressResponse.data
        const categoryData = categoriesResponse.data

        const categoryList = Array.isArray(categoryData)
          ? categoryData
          : Array.isArray(categoryData?.content)
            ? categoryData.content
            : []

        setCategories(categoryList)
        setCurrentImageUrl(dress.imageUrl ?? '')

        setFormData({
          name: dress.name ?? '',
          categoryId: String(dress.categoryId ?? ''),
          size: dress.size ?? '',
          color: dress.color ?? '',
          description: dress.description ?? '',
          location: dress.location ?? 'IN_SALON',
          expectedReturnDate: dress.expectedReturnDate ?? '',
          unavailable: Boolean(dress.unavailable),
        })
      } catch (err) {
        if (active) {
          console.error('Failed to load dress:', err)
          setError(
            err.response?.data?.message ||
              'Të dhënat e fustanit nuk mund të ngarkoheshin.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview('')
      return
    }

    const objectUrl = URL.createObjectURL(selectedImage)
    setImagePreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedImage])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormData((previous) => {
      const next = {
        ...previous,
        [name]: type === 'checkbox' ? checked : value,
      }

      if (name === 'location' && value === 'IN_SALON') {
        next.expectedReturnDate = ''
      }

      return next
    })
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Zgjidhni një imazh JPG, PNG ose WebP.')
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Imazhi duhet të jetë më i vogël se 10 MB.')
      event.target.value = ''
      return
    }

    setError('')
    setSelectedImage(file)
  }

  function handleCancelImageChange() {
    setSelectedImage(null)

    const input = document.getElementById('dress-image')
    if (input) input.value = ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Ju lutemi, shkruani emrin e fustanit.')
      return
    }

    if (!formData.categoryId) {
      setError('Ju lutemi, zgjidhni kategorinë e fustanit.')
      return
    }

    if (!formData.size.trim()) {
      setError('Ju lutemi, shkruani masën e fustanit.')
      return
    }

    if (!formData.color.trim()) {
      setError('Ju lutemi, shkruani ngjyrën e fustanit.')
      return
    }

    if (
      ['WITH_BRIDE', 'IN_CLEANING'].includes(formData.location) &&
      !formData.expectedReturnDate
    ) {
      setError(
        'Ju lutemi, zgjidhni datën e pritshme të kthimit për këtë vendndodhje.'
      )
      return
    }

    setSaving(true)

    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: Number(formData.categoryId),
        size: formData.size.trim(),
        color: formData.color.trim(),
        description: formData.description,
        location: formData.location,
        expectedReturnDate:
          formData.location === 'IN_SALON'
            ? null
            : formData.expectedReturnDate || null,
        unavailable: formData.unavailable,
      }

      // 1. Update the dress details.
      await api.patch(`/dresses/${id}`, payload)

      // 2. Upload a replacement image only when one was selected.
      if (selectedImage) {
        const imageData = new FormData()
        imageData.append('file', selectedImage)

        await api.post(`/dresses/${id}/image`, imageData)
      }

      // 3. Return to the updated dress page.
      navigate(`/dresses/${id}`)
    } catch (err) {
      console.error('Failed to update dress:', err)

      setError(
        err.response?.data?.message ||
          'Fustani nuk mund të përditësohej. Ju lutemi, provoni përsëri.'
      )
    } finally {
      setSaving(false)
    }
  }

  const displayedImage = selectedImage
    ? imagePreview
    : getImageUrl(currentImageUrl)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-[var(--text-muted)]">
        <LoaderCircle className="animate-spin" size={20} />
        <span>Duke ngarkuar të dhënat e fustanit…</span>
      </div>
    )
  }

  if (error && !formData.name) {
    return (
      <main className="min-h-screen bg-[var(--pink-light)] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--background)] p-8">
          <p className="mb-5 text-sm text-red-700">{error}</p>
          <Link
            to="/dresses"
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground)] hover:opacity-70"
          >
            <ArrowLeft size={16} />
            Kthehu te fustanet
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--pink-light)] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to={`/dresses/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Kthehu te fustani
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Danida Bridal Collection
          </p>
          <h1 className="font-serif text-3xl font-normal text-[var(--foreground)] sm:text-4xl">
            Përditëso fustanin
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Përditësoni të dhënat e fustanit në koleksionin tuaj.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="font-serif text-xl text-[var(--foreground)]">
                Të dhënat e fustanit
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Fushat me * janë të detyrueshme.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <label className="mb-3 block text-sm font-medium text-[var(--foreground)]">
                  Imazhi i fustanit
                </label>

                <div className="relative flex h-[250px] items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                  {displayedImage ? (
                    <img
                      src={displayedImage}
                      alt={`Imazhi i fustanit ${formData.name}`}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                      <ImageIcon size={32} strokeWidth={1.3} />
                      <span className="text-xs">Nuk ka imazh</span>
                    </div>
                  )}

                  {selectedImage && (
                    <button
                      type="button"
                      onClick={handleCancelImageChange}
                      aria-label="Anulo ndryshimin e imazhit"
                      title="Anulo ndryshimin e imazhit"
                      className="absolute right-2 top-2 rounded-full border border-[var(--border)] bg-white p-2 text-[var(--foreground)] shadow-sm transition hover:bg-[var(--pink-light)]"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <label
                  htmlFor="dress-image"
                  className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--foreground)] transition hover:bg-[var(--pink-light)]"
                >
                  <Upload size={16} />
                  {selectedImage ? 'Zgjidh imazh tjetër' : 'Ndrysho imazhin'}
                </label>

                <input
                  id="dress-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />

                <p className="mt-2 text-center text-xs leading-5 text-[var(--text-muted)]">
                  JPG, PNG ose WebP. Maksimumi 10 MB.
                </p>

                {selectedImage && (
                  <p className="mt-2 break-words text-center text-xs text-[var(--text-muted)]">
                    Imazhi i ri: {selectedImage.name}
                  </p>
                )}
              </div>

              <div className="grid content-start gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="field-label">
                    Emri i fustanit *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={255}
                    className="field-input"
                    placeholder="p.sh. Fustan nusërie prej sateni"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="categoryId" className="field-label">
                    Kategoria *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="field-input"
                  >
                    <option value="">Zgjidhni kategorinë</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="size" className="field-label">
                    Masa *
                  </label>
                  <input
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    className="field-input"
                    placeholder="p.sh. S, M, 38"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="field-label">
                    Ngjyra *
                  </label>
                  <input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="field-input"
                    placeholder="p.sh. E bardhë fildishi"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="location" className="field-label">
                    Vendndodhja *
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="field-input"
                  >
                    {LOCATIONS.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.location !== 'IN_SALON' && (
                  <div className="sm:col-span-2">
                    <label htmlFor="expectedReturnDate" className="field-label">
                      Data e pritshme e kthimit *
                    </label>
                    <input
                      id="expectedReturnDate"
                      name="expectedReturnDate"
                      type="date"
                      value={formData.expectedReturnDate}
                      onChange={handleChange}
                      required
                      className="field-input"
                    />
                  </div>
                )}

                <div className="sm:col-span-2 rounded-xl border border-[var(--border)] p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="unavailable"
                      checked={formData.unavailable}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[var(--pink-dark)]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[var(--foreground)]">
                        Shënoje fustanin si të padisponueshëm
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                        Aktivizojeni nëse fustani nuk mund të jepet me qira,
                        edhe nëse ndodhet në sallon.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="field-label">
                    Përshkrimi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="field-input resize-y"
                    placeholder="Shtoni detaje për materialin, stilin ose prerjen..."
                  />
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
              <Link
                to={`/dresses/${id}`}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-5 py-3 text-sm text-[var(--foreground)] transition hover:bg-[var(--pink-light)]"
              >
                Anulo
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-3 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {saving ? 'Duke ruajtur…' : 'Ruaj ndryshimet'}
              </button>
            </div>
          </section>
        </form>

        <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[var(--pink-light)] p-3 text-[var(--foreground)]">
              <ClipboardList size={22} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-xl text-[var(--foreground)]">
                Raportet e dëmtimeve
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                Menaxhoni raportet e dëmtimeve veçmas nga të dhënat e fustanit.
                Historia e dëmtimeve ruhet e ndarë.
              </p>
              <Link
                to={`/dresses/${id}/damages`}
                className="mt-4 inline-flex items-center gap-2 border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--foreground)] transition hover:bg-[var(--pink-light)]"
              >
                Shiko dëmtimet
                <ArrowLeft size={15} className="rotate-180" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .field-label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--foreground);
        }

        .field-input {
          width: 100%;
          min-width: 0;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: var(--background);
          padding: 11px 12px;
          color: var(--foreground);
          font-size: 14px;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .field-input::placeholder {
          color: var(--text-muted);
          opacity: 0.75;
        }

        .field-input:focus {
          border-color: var(--pink-dark);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--pink-dark) 18%, transparent);
        }
      `}</style>
    </main>
  )
}
