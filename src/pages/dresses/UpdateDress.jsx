import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  Save,
  LoaderCircle,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'
import api from '../../api/axiosConfig'

const API_BASE = 'http://localhost:8080'

const initialForm = {
  name: '',
  category: '',
  pricePerRental: '',
  size: '',
  color: '',
  stock: '',
  description: '',
  imageUrl: '',
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)

  // Load the existing dress.
  useEffect(() => {
    let active = true

    async function fetchDress() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/api/dresses/${id}`)
        const dress = response.data

        if (!active) return

        setFormData({
          name: dress.name ?? '',
          category: dress.category ?? '',
          pricePerRental: dress.pricePerRental ?? '',
          size: dress.size ?? '',
          color: dress.color ?? '',
          stock: dress.stock ?? '',
          description: dress.description ?? '',
          imageUrl: dress.imageUrl ?? '',
        })
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              'Could not load the dress. Please try again.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchDress()

    return () => {
      active = false
    }
  }, [id])

  // Release temporary preview URLs when the selected image changes.
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
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Please choose a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('The image must be smaller than 10 MB.')
      event.target.value = ''
      return
    }

    setError('')
    setSelectedImage(file)
    setRemoveCurrentImage(false)
  }

  function handleRemoveImage() {
    setSelectedImage(null)
    setRemoveCurrentImage(true)

    const input = document.getElementById('dress-image')
    if (input) input.value = ''
  }

  function handleKeepCurrentImage() {
    setSelectedImage(null)
    setRemoveCurrentImage(false)

    const input = document.getElementById('dress-image')
    if (input) input.value = ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please enter a dress name.')
      return
    }

    if (
      formData.pricePerRental === '' ||
      Number(formData.pricePerRental) < 0
    ) {
      setError('Please enter a valid rental price.')
      return
    }

    if (
      formData.stock === '' ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      setError('Stock must be a whole number of zero or more.')
      return
    }

    setSaving(true)

    try {
      let imageUrl = formData.imageUrl

      // Upload a new image only if the user selected one.
      if (selectedImage) {
        const imageData = new FormData()
        imageData.append('file', selectedImage)

        const uploadResponse = await api.post(
          '/api/images/upload',
          imageData
        )

        const result = uploadResponse.data

        // Supports a response containing either a URL string
        // or an object with an imageUrl, url, or path property.
        imageUrl =
          typeof result === 'string'
            ? result
            : result?.imageUrl ?? result?.url ?? result?.path

        if (!imageUrl) {
          throw new Error(
            'The image was uploaded, but the server did not return its URL.'
          )
        }
      } else if (removeCurrentImage) {
        imageUrl = null
      }

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        pricePerRental: Number(formData.pricePerRental),
        size: formData.size,
        color: formData.color,
        stock: Number(formData.stock),
        description: formData.description,
        imageUrl,
      }

      await api.put(`/api/dresses/${id}`, payload)

      navigate('/dresses')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Could not update the dress. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const displayedImage = selectedImage
    ? imagePreview
    : removeCurrentImage
      ? ''
      : getImageUrl(formData.imageUrl)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-[var(--text-muted)]">
        <LoaderCircle className="animate-spin" size={20} />
        <span>Loading dress details...</span>
      </div>
    )
  }

  if (error && !formData.name && !formData.category) {
    return (
      <main className="min-h-screen bg-[var(--pink-light)] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--background)] p-8">
          <p className="mb-5 text-sm text-red-700">{error}</p>
          <Link
            to="/dresses"
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground)] hover:opacity-70"
          >
            <ArrowLeft size={16} />
            Back to dresses
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--pink-light)] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <Link
          to="/dresses"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Back to dresses
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Danida Bridal Collection
          </p>
          <h1 className="font-serif text-3xl font-normal text-[var(--foreground)] sm:text-4xl">
            Edit dress
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Update the details of your bridal collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dress information and image */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="font-serif text-xl text-[var(--foreground)]">
                Dress information
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Fields marked with * are required.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
              {/* Image upload */}
              <div>
                <label className="mb-3 block text-sm font-medium text-[var(--foreground)]">
                  Dress image
                </label>

                <div className="relative flex h-[250px] items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                  {displayedImage ? (
                    <img
                      src={displayedImage}
                      alt="Dress preview"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                      <ImageIcon size={32} strokeWidth={1.3} />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}

                  {displayedImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      aria-label="Remove dress image"
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
                  {selectedImage ? 'Choose another image' : 'Upload image'}
                </label>

                <input
                  id="dress-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />

                <p className="mt-2 text-center text-xs leading-5 text-[var(--text-muted)]">
                  JPG, PNG or WebP. Maximum 10 MB.
                </p>

                {removeCurrentImage && (
                  <button
                    type="button"
                    onClick={handleKeepCurrentImage}
                    className="mt-2 w-full text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--foreground)]"
                  >
                    Keep current image
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="grid content-start gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="field-label">
                    Dress name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="field-input"
                    placeholder="e.g. Ivory Satin Wedding Dress"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="field-label">
                    Category
                  </label>
                  <input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="Dress category"
                  />
                </div>

                <div>
                  <label htmlFor="pricePerRental" className="field-label">
                    Rental price (€) *
                  </label>
                  <input
                    id="pricePerRental"
                    name="pricePerRental"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerRental}
                    onChange={handleChange}
                    required
                    className="field-input"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="size" className="field-label">
                    Size
                  </label>
                  <input
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="e.g. S, M, 38"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="field-label">
                    Color
                  </label>
                  <input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="field-input"
                    placeholder="e.g. Ivory"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="field-label">
                    Stock *
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="field-input"
                    placeholder="0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="field-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="field-input resize-y"
                    placeholder="Add details about the dress, fabric, style, or fit..."
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
                to="/dresses"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-5 py-3 text-sm text-[var(--foreground)] transition hover:bg-[var(--pink-light)]"
              >
                Cancel
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
                {saving ? 'Saving changes...' : 'Save changes'}
              </button>
            </div>
          </section>
        </form>

        {/* Damage reports are intentionally separate from dress updates. */}
        <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[var(--pink-light)] p-3 text-[var(--foreground)]">
              <ClipboardList size={22} strokeWidth={1.5} />
            </div>

            <div className="flex-1">
              <h2 className="font-serif text-xl text-[var(--foreground)]">
                Damage reports
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                Record and manage damage incidents separately from the dress
                details. Existing reports should keep their own history.
              </p>

              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Damage report management can be connected here once its API
                endpoints and page are implemented.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Local field styling */}
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
