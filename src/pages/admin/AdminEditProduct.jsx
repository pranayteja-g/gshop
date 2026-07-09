import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = 'gshopimages'

export default function AdminEditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', category: '', color: '',
    quantity: 1, selling_price: '', cost_price: '', status: 'available'
  })
  const [currentImage, setCurrentImage] = useState(null)
  const [newImage, setNewImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchProduct()
  }, [])

  async function fetchProduct() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (!error) {
      setForm({
        name: data.name || '',
        category: data.category || '',
        color: data.color || '',
        quantity: data.quantity || 1,
        selling_price: data.selling_price || '',
        cost_price: data.cost_price || '',
        status: data.status || 'available'
      })
      setCurrentImage(data.image_url)
    }
    setLoading(false)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        image_url = data.secure_url
      }

      const { error } = await supabase
        .from('products')
        .update({
          ...form,
          quantity: parseInt(form.quantity),
          selling_price: parseFloat(form.selling_price),
          cost_price: parseFloat(form.cost_price),
          image_url
        })
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: '✅ Product updated successfully!' })
      setCurrentImage(image_url)
      setNewImage(null)
      setPreview(null)

    } catch (err) {
      setMessage({ type: 'error', text: `❌ Error: ${err.message}` })
    }

    setSaving(false)
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/admin')}
          style={{ background: 'none', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Edit Product</h2>
      </div>

      {message && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red', marginBottom: '1rem' }}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
        <input name="color" placeholder="Color" value={form.color} onChange={handleChange}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
        <input name="selling_price" type="number" placeholder="Selling price" value={form.selling_price} onChange={handleChange}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
        <input name="cost_price" type="number" placeholder="Cost price" value={form.cost_price} onChange={handleChange}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
        <select name="status" value={form.status} onChange={handleChange}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>

        <div>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>Current Image:</p>
          {currentImage
            ? <img src={currentImage} alt="current" style={{ width: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} />
            : <p style={{ color: '#888' }}>No image</p>
          }
          <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Upload new image to replace:</p>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />}
        </div>

        <button type="submit" disabled={saving}
          style={{ padding: '0.8rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}