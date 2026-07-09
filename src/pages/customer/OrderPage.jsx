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
      const itemList = wishlist.map(p => `• ${p.name} - ₹${p.selling_price}`).join('\n')
      const message = `New Reservation!\n\nCustomer: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email || 'N/A'}\n\nItems:\n${itemList}\n\nTotal: ₹${total}`
      const waUrl = `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(message)}`
      localStorage.removeItem('wishlist')
      setOrdered(true)
      window.open(waUrl, '_blank')
    }
    setLoading(false)
  }

  const total = wishlist.reduce((sum, p) => sum + parseFloat(p.selling_price || 0), 0)

  const inputStyle = {
    width: '100%', padding: '0.9rem 1rem',
    background: 'white', border: '1px solid var(--border)',
    borderRadius: '12px', color: 'var(--text)',
    fontSize: '1rem', outline: 'none'
  }

  if (ordered) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '300px' }}>
        <div style={{ width: '70px', height: '70px', background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', fontSize: '2rem' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.7rem' }}>Reservation Sent!</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
          The shop owner will contact you on WhatsApp to confirm your visit.
        </p>
        <button onClick={() => navigate('/')} style={{ padding: '0.9rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
          Back to Collection
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '1rem', background: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/wishlist')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'white' }}>Reserve Items</h2>
      </div>

      <div style={{ padding: '1rem', flex: 1 }}>

        {/* Order summary */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>Your Selection</p>
          {wishlist.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text)' }}>{p.name}</span>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{p.selling_price}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--text)' }}>Total</span>
            <span style={{ color: 'var(--text)', fontSize: '1.1rem' }}>₹{total}</span>
          </div>
        </div>

        {/* Form */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>Your Details</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required style={inputStyle} />
          <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} required style={inputStyle} />
          <input name="email" placeholder="Email (optional)" value={form.email} onChange={handleChange} style={inputStyle} />

          <button type="submit" disabled={loading || wishlist.length === 0} style={{
            marginTop: '0.5rem', padding: '1rem',
            background: '#25D366', color: 'white',
            border: 'none', borderRadius: '12px',
            fontSize: '1rem', cursor: 'pointer', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Sending...' : '📱 Confirm on WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  )
}