import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = 'gshopimages'

const inputStyle = {
  width: '100%', padding: '0.8rem 1rem',
  border: '1px solid var(--border)', borderRadius: '10px',
  fontSize: '0.95rem', color: 'var(--text)',
  outline: 'none', background: 'var(--bg)'
}

const labelStyle = {
  fontSize: '0.78rem', color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: '0.3rem'
}

export default function AdminEditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', category: '', color: '', quantity: 1, selling_price: '', cost_price: '', status: 'available' })
  const [currentImage, setCurrentImage] = useState(null)
  const [newImage, setNewImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => { fetchProduct() }, [])

  async function fetchProduct() {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (!error) {
      setForm({ name: data.name || '', category: data.category || '', color: data.color || '', quantity: data.quantity || 1, selling_price: data.selling_price || '', cost_price: data.cost_price || '', status: data.status || 'available' })
      setCurrentImage(data.image_url)
    }
    setLoading(false)
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  function handleImageChange(e) {
    const file = e.target.files[0]
    setNewImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      let image_url = currentImage
      if (newImage) {
        const formData = new FormData()
        formData.append('file', newImage)
        formData.append('upload_preset', UPLOAD_PRESET)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
        const data = await res.json()
        image_url = data.secure_url
      }
      const { error } = await supabase.from('products').update({
        ...form, quantity: parseInt(form.quantity),
        selling_price: parseFloat(form.selling_price),
        cost_price: parseFloat(form.cost_price), image_url
      }).eq('id', id)
      if (error) throw error
      setMessage({ type: 'success', text: 'Product updated!' })
      setCurrentImage(image_url)
      setNewImage(null)
      setPreview(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.2rem' }}>Edit Product</h2>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1.2rem' }}>

        {message && (
          <div style={{ background: message.type === 'success' ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ffcdd2'}`, borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1rem' }}>
            <p style={{ color: message.type === 'success' ? '#2E7D32' : '#C62828', fontWeight: 600, fontSize: '0.9rem' }}>
              {message.type === 'success' ? '✓' : '✕'} {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Image */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
            <label style={labelStyle}>Product Image</label>

            {/* Current image */}
            {(preview || currentImage) && (
              <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
                <img src={preview || currentImage} alt="product" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                {preview && (
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--gold)', color: 'white', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>New Image</span>
                )}
              </div>
            )}

            <label htmlFor="edit-img" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', border: '1.5px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              📷 {currentImage ? 'Replace image' : 'Upload image'}
            </label>
            <input id="edit-img" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          {/* Details */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <input name="category" value={form.category} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <input name="color" value={form.color} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem' }}>
              <div>
                <label style={labelStyle}>Selling ₹</label>
                <input name="selling_price" type="number" value={form.selling_price} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cost ₹</label>
                <input name="cost_price" type="number" value={form.cost_price} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Qty</label>
                <input name="quantity" type="number" value={form.quantity} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}