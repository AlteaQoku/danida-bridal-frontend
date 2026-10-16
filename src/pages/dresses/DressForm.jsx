import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Image as ImageIcon, X, Plus, ArrowLeft } from 'lucide-react'
import api from '../../api/axiosConfig'

function DressForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const [form, setForm] = useState({
    name: '',
    category: '',
    size: '',
    color: '',
    pricePerRental: '',
    stock: '',
    imageUrl: '',
    description: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Ju lutem zgjidhni një imazh JPG, PNG ose WebP.')
      e.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Imazhi duhet të jetë më i vogël se 10 MB.')
      e.target.value = ''
      return
    }

    setError(null)
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    const input = document.getElementById('dressImage')
    if (input) input.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let imageUrl = ''

      if (selectedImage) {
        const imageData = new FormData()
        imageData.append('file', selectedImage)

        const uploadResponse = await api.post(
          '/api/images/upload',
          imageData
        )

        imageUrl = uploadResponse.data.imageUrl
      }

      await api.post('/api/dresses', {
        ...form,
        imageUrl,
        pricePerRental: parseFloat(form.pricePerRental),
        stock: parseInt(form.stock, 10),
      })

      navigate('/dresses')
    } catch (err) {
      console.error('Failed to create dress:', err)
      setError(
        err.response?.data?.message ||
        'Dështoi krijimi i fustanit. Ju lutem kontrolloni të gjitha fushat dhe provoni përsëri.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--text-muted)]/70 focus:border-[var(--pink-dark)]'

  const labelClass =
    'mb-2 block text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]'

  return (
    <main className="min-h-screen bg-[var(--pink-light)] text-[var(--foreground)]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:py-10">

        {/* Compact page heading */}
        <header className="mb-7 flex items-center justify-between border-b border-[var(--border)] pb-5">
          <div>
            <p className="mb-2 text-[9px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
              DANIDA BRIDAL · KOLEKSIONI
            </p>
            <h1 className="font-serif text-3xl font-normal">
              Shto fustan
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dresses')}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            <span className="hidden sm:inline">Kthehu te koleksioni</span>
            <span className="sm:hidden">Kthehu</span>
          </button>
        </header>

        {/* Error message */}
        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Mbyll mesazhin"
              className="text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border border-[var(--border)] bg-[var(--background)]"
        >
          <div className="grid grid-cols-1 gap-8 p-5 sm:p-7 lg:grid-cols-[220px_1fr] lg:gap-10 lg:p-8">

            {/* Compact image upload */}
            <section>
              <label className={labelClass}>
                Fotografia
              </label>

              <div className="relative mb-3 flex h-[220px] items-center justify-center overflow-hidden border border-[var(--border)] bg-[var(--pink-light)]">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Pamja e fustanit"
                      className="h-full w-full object-contain p-2"
                    />

                    <button
                      type="button"
                      onClick={removeImage}
                      aria-label="Hiq fotografinë"
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-colors hover:bg-[var(--pink-base)]"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <ImageIcon size={30} strokeWidth={1} />
                    <span className="text-[9px] uppercase tracking-[0.18em]">
                      Pa fotografi
                    </span>
                  </div>
                )}
              </div>

              <label
                htmlFor="dressImage"
                className="flex cursor-pointer items-center justify-center gap-2 border border-[var(--border)] px-3 py-2.5 text-[10px] uppercase tracking-[0.1em] transition-colors hover:border-[var(--pink-dark)] hover:bg-[var(--pink-light)]"
              >
                <Upload size={14} strokeWidth={1.5} />
                {selectedImage ? 'Ndrysho fotografinë' : 'Ngarko fotografi'}

                <input
                  id="dressImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-center text-[10px] leading-5 text-[var(--text-muted)]">
                JPG, PNG ose WebP
                <br />
                Maksimumi 10 MB
              </p>
            </section>

            {/* Dress details */}
            <section className="min-w-0">
              <div className="mb-5 border-b border-[var(--border)] pb-3">
                <h2 className="font-serif text-xl font-normal">
                  Detajet e fustanit
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Plotësoni informacionin për fustanin e ri.
                </p>
              </div>

              {/* Name */}
              <div className="mb-5">
                <label htmlFor="name" className={labelClass}>
                  Emri i fustanit *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="p.sh. Teauta"
                  required
                  className={inputClass}
                />
              </div>

              {/* Category and size */}
              <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Kategoria *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Zgjidhni kategorinë</option>
                    <option value="Ball Gown">Ball Gown</option>
                    <option value="A-Line">A-Line</option>
                    <option value="Mermaid">Mermaid</option>
                    <option value="Sheath">Sheath</option>
                    <option value="Tea Length">Tea Length</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="size" className={labelClass}>
                    Madhësia *
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Zgjidhni madhësinë</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              {/* Color */}
              <div className="mb-5">
                <label htmlFor="color" className={labelClass}>
                  Ngjyra *
                </label>
                <input
                  id="color"
                  type="text"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="p.sh. Fildishtë, Bardhë, Rozë e zbehtë"
                  required
                  className={inputClass}
                />
              </div>

              {/* Price and stock */}
              <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="pricePerRental" className={labelClass}>
                    Çmimi i qirasë (€) *
                  </label>
                  <input
                    id="pricePerRental"
                    type="number"
                    name="pricePerRental"
                    value={form.pricePerRental}
                    onChange={handleChange}
                    placeholder="500"
                    required
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="stock" className={labelClass}>
                    Stoku *
                  </label>
                  <input
                    id="stock"
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="1"
                    required
                    min="1"
                    step="1"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>
                  Përshkrimi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Përshkruani materialin, stilin ose detaje të tjera..."
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </section>
          </div>

          {/* Compact form actions */}
          <footer className="flex flex-col-reverse gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={() => navigate('/dresses')}
              className="px-5 py-2.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Anulo
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-2.5 text-[10px] uppercase tracking-[0.12em] text-white transition-colors hover:border-[var(--pink-dark)] hover:bg-[var(--pink-dark)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={1.5} />
              {loading ? 'Duke ruajtur...' : 'Ruaj fustanin'}
            </button>
          </footer>
        </form>
      </div>
    </main>
  )
}

export default DressForm
