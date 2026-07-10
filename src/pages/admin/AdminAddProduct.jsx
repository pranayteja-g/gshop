import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

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

export default function AdminAddProduct() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', category: '', color: '', quantity: 1, selling_price: '', cost_price: '', status: 'available' })
  const [images, setImages] = useState([]) // array of { file, preview }
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  function handleImageChange(e) {
    const files = Array.from(e.target.files || [])
    const newItems = files.map(file => ({ file, preview: URL.createObjectURL(file) }))
    setImages(prev => [...prev, ...newItems])
    e.target.value = '' // allow re-selecting the same file later
  }

  function removeImage(idx) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  function moveImageToFront(idx) {
    setImages(prev => {
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      return [item, ...copy]
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const uploadedUrls = []
      for (const { file } of images) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', UPLOAD_PRESET)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
        const data = await res.json()
        if (!data.secure_url) throw new Error('Image upload failed')
        uploadedUrls.push(data.secure_url)
      }
      const { error } = await supabase.from('products').insert([{
        ...form,
        quantity: parseInt(form.quantity),
        selling_price: parseFloat(form.selling_price),
        cost_price: parseFloat(form.cost_price),
        image_url: uploadedUrls[0] || null,
        images: uploadedUrls
      }])
      if (error) throw error
      setMessage({ type: 'success', text: 'Product added successfully!' })
      setForm({ name: '', category: '', color: '', quantity: 1, selling_price: '', cost_price: '', status: 'available' })
      setImages([])
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.2rem' }}>Add Product</h2>
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

          {/* Image upload */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
            <label style={labelStyle}>Product Images {images.length > 0 && `(${images.length})`}</label>

            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '0.8rem' }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: idx === 0 ? '2px solid var(--gold)' : '1px solid var(--border)' }}>
                    <img src={img.preview} alt={`preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {idx === 0 && (
                      <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'var(--gold)', color: 'white', fontSize: '0.62rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>COVER</span>
                    )}
                    <button type="button" onClick={() => removeImage(idx)}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.55)', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1 }}>×</button>
                    {idx !== 0 && (
                      <button type="button" onClick={() => moveImageToFront(idx)}
                        style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.55)', border: 'none', color: 'white', fontSize: '0.62rem', padding: '0.1rem 0.35rem', borderRadius: '4px', cursor: 'pointer' }}>Set cover</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <label htmlFor="img-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: '8px', padding: images.length > 0 ? '1rem' : '2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>📷</span>
              <span style={{ fontSize: '0.85rem' }}>{images.length > 0 ? 'Add more images' : 'Tap to upload images'}</span>
            </label>
            <input id="img-upload" type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          {/* Product details */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <label style={labelStyle}>Product Details</label>

            <div>
              <label style={labelStyle}>Name *</label>
              <input name="name" placeholder="e.g. 27-jamdani" value={form.name} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <input name="category" placeholder="silk, cotton..." value={form.category} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <input name="color" placeholder="e.g. Maroon" value={form.color} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem' }}>
              <div>
                <label style={labelStyle}>Selling ₹</label>
                <input name="selling_price" type="number" placeholder="0" value={form.selling_price} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cost ₹</label>
                <input name="cost_price" type="number" placeholder="0" value={form.cost_price} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Qty</label>
                <input name="quantity" type="number" placeholder="1" value={form.quantity} onChange={handleChange} style={inputStyle} />
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

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : '+ Add Product'}
          </button>
        </form>
      </div>
    </div>
  )
}