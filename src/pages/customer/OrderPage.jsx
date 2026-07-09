import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function OrderPage() {
  const [wishlist, setWishlist] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(saved)
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const total = wishlist.reduce((sum, p) => sum + parseFloat(p.selling_price || 0), 0)

    const { error } = await supabase.from('orders').insert([{
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      items: wishlist.map(p => ({ id: p.id, name: p.name, price: p.selling_price })),
      total_amount: total
    }])

    if (!error) {
      // Build WhatsApp message
      const itemList = wishlist.map(p => `• ${p.name} - ₹${p.selling_price}`).join('\n')
      const message = `New Order!\n\nCustomer: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email || 'N/A'}\n\nItems:\n${itemList}\n\nTotal: ₹${total}`
      const waUrl = `https://wa.me/916309834401?text=${encodeURIComponent(message)}`

      localStorage.removeItem('wishlist')
      setOrdered(true)

      // Open WhatsApp
      window.open(waUrl, '_blank')
    }

    setLoading(false)
  }

  const total = wishlist.reduce((sum, p) => sum + parseFloat(p.selling_price || 0), 0)

  if (ordered) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>🎉</div>
        <h2>Order Placed!</h2>
        <p style={{ color: '#666' }}>Thank you! The shop owner has been notified on WhatsApp. They will contact you shortly.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '1.5rem', padding: '0.8rem 2rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Continue Browsing
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/wishlist')} style={{ background: 'none', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Place Order</h2>
      </div>

      {/* Order summary */}
      <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.8rem' }}>Order Summary</h3>
        {wishlist.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #eee' }}>
            <span>{p.name}</span>
            <span>₹{p.selling_price}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.8rem' }}>
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {/* Customer details */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          name="name" placeholder="Your name" value={form.name}
          onChange={handleChange} required
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <input
          name="phone" placeholder="Phone number" value={form.phone}
          onChange={handleChange} required
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <input
          name="email" placeholder="Email (optional)" value={form.email}
          onChange={handleChange}
          style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <button
          type="submit" disabled={loading || wishlist.length === 0}
          style={{ padding: '1rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Placing order...' : '📱 Place Order & Notify on WhatsApp'}
        </button>
      </form>
    </div>
  )
}