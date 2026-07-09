import { useState } from 'react'
import { supabase } from '../../supabaseClient'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = 'gshopimages'

export default function AdminAddProduct() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    color: '',
    quantity: 1,
    selling_price: '',
    cost_price: '',
    status: 'available'
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 1. Upload image to Cloudinary
      let image_url = null
      if (image) {
        const formData = new FormData()
        formData.append('file', image)
        formData.append('upload_preset', UPLOAD_PRESET)
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        image_url = data.secure_url
      }

      // 2. Save product to Supabase
      const { error } = await supabase.from('products').insert([{
        ...form,
        quantity: parseInt(form.quantity),
        selling_price: parseFloat(form.selling_price),
        cost_price: parseFloat(form.cost_price),
        image_url
      }])

      if (error) throw error

      setMessage({ type: 'success', text: '✅ Product added successfully!' })
      setForm({
        name: '', category: '', color: '',
        quantity: 1, selling_price: '', cost_price: '', status: 'available'
      })
      setImage(null)
      setPreview(null)

    } catch (err) {
      setMessage({ type: 'error', text: `❌ Error: ${err.message}` })
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Add New Product</h2>

      {message && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red' }}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
        <input name="category" placeholder="Category (silk, cotton...)" value={form.category} onChange={handleChange} />
        <input name="color" placeholder="Color" value={form.color} onChange={handleChange} />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} />
        <input name="selling_price" type="number" placeholder="Selling price" value={form.selling_price} onChange={handleChange} />
        <input name="cost_price" type="number" placeholder="Cost price" value={form.cost_price} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>

        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '8px' }} />}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Product'}
        </button>
      </form>
    </div>
  )
}