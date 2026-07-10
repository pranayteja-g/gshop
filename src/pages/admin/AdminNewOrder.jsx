import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const inputStyle = {
  width: '100%', padding: '0.8rem 1rem',
  border: '1px solid var(--border)', borderRadius: '10px',
  fontSize: '0.95rem', color: 'var(--text)',
  outline: 'none', background: 'white'
}

const labelStyle = {
  fontSize: '0.78rem', color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: '0.3rem'
}

export default function AdminNewOrder() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState({}) // { [productId]: quantity }
  const [form, setForm] = useState({ name: '', phone: '', email: '', payment_method: 'Cash', payment_status: 'paid', amount_paid: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoadingProducts(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .gt('quantity', 0)
      .order('name', { ascending: true })
    if (!error) setProducts(data)
    setLoadingProducts(false)
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function addToCart(product) {
    setCart(prev => {
      const current = prev[product.id] || 0
      if (current >= product.quantity) return prev // can't exceed stock
      return { ...prev, [product.id]: current + 1 }
    })
  }

  function changeQty(product, delta) {
    setCart(prev => {
      const current = prev[product.id] || 0
      const next = Math.max(0, Math.min(product.quantity, current + delta))
      const updated = { ...prev, [product.id]: next }
      if (next === 0) delete updated[product.id]
      return updated
    })
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    if (!q) return true
    return p.name?.toLowerCase().includes(q)
      || p.category?.toLowerCase().includes(q)
      || p.color?.toLowerCase().includes(q)
  })

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find(p => p.id === id), qty }))
    .filter(e => e.product)

  const total = cartEntries.reduce((sum, e) => sum + parseFloat(e.product.selling_price || 0) * e.qty, 0)
  const itemCount = cartEntries.reduce((sum, e) => sum + e.qty, 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (cartEntries.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one product to the sale.' })
      return
    }
    let amountPaid = 0
    if (form.payment_status === 'paid') {
      amountPaid = total
    } else if (form.payment_status === 'partial') {
      amountPaid = parseFloat(form.amount_paid)
      if (isNaN(amountPaid) || amountPaid <= 0 || amountPaid >= total) {
        setMessage({ type: 'error', text: 'Enter an amount paid that is more than ₹0 and less than the total.' })
        return
      }
    } else {
      amountPaid = 0
    }

    setSaving(true)
    setMessage(null)
    try {
      // Build items array — one entry per unit, matching the shape used
      // by the online reservation flow (AdminOrders relies on this shape
      // when it later needs to walk items for stock adjustments).
      const items = cartEntries.flatMap(({ product, qty }) =>
        Array.from({ length: qty }, () => ({ id: product.id, name: product.name, price: product.selling_price }))
      )

      const { error: orderError } = await supabase.from('orders').insert([{
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        items,
        total_amount: total,
        payment_method: form.payment_status === 'unpaid' ? null : form.payment_method,
        payment_status: form.payment_status,
        amount_paid: amountPaid,
        status: 'completed'
      }])
      if (orderError) throw orderError

      // Deduct stock immediately since the sale already happened in person.
      for (const { product, qty } of cartEntries) {
        const newQty = Math.max(0, product.quantity - qty)
        const newStatus = newQty === 0 ? 'sold' : product.status
        const { error: stockError } = await supabase
          .from('products')
          .update({ quantity: newQty, status: newStatus })
          .eq('id', product.id)
        if (stockError) throw stockError
      }

      setMessage({ type: 'success', text: 'Sale recorded and stock updated!' })
      setCart({})
      setForm({ name: '', phone: '', email: '', payment_method: 'Cash', payment_status: 'paid', amount_paid: '' })
      await fetchProducts()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
    setSaving(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.2rem' }}>New In-Person Sale</h2>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.2rem', paddingBottom: '6rem' }}>

        {message && (
          <div style={{ background: message.type === 'success' ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ffcdd2'}`, borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1rem' }}>
            <p style={{ color: message.type === 'success' ? '#2E7D32' : '#C62828', fontWeight: 600, fontSize: '0.9rem' }}>
              {message.type === 'success' ? '✓' : '✕'} {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Cart summary */}
          {cartEntries.length > 0 && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
              <label style={labelStyle}>Sale Items ({itemCount})</label>
              {cartEntries.map(({ product, qty }) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>₹{product.selling_price} each</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button type="button" onClick={() => changeQty(product, -1)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>−</button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{qty}</span>
                    <button type="button" onClick={() => changeQty(product, 1)} disabled={qty >= product.quantity} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: qty >= product.quantity ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: qty >= product.quantity ? 0.4 : 1 }}>+</button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--text)' }}>Total</span>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>₹{total}</span>
              </div>
            </div>
          )}

          {/* Product picker */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
            <label style={labelStyle}>Add Products</label>
            <input
              placeholder="Search by name, category, color..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, background: 'var(--bg)', marginBottom: '0.8rem' }}
            />

            {loadingProducts ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Loading products...</p>
            ) : filtered.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No available products match.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
                {filtered.map(product => {
                  const inCart = cart[product.id] || 0
                  const maxed = inCart >= product.quantity
                  return (
                    <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg)' }}>
                        {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{product.selling_price} · {product.quantity} in stock{inCart > 0 ? ` · ${inCart} added` : ''}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={maxed}
                        style={{
                          padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', cursor: maxed ? 'not-allowed' : 'pointer',
                          background: maxed ? '#F5F5F5' : 'var(--primary)', color: maxed ? '#999' : 'white',
                          fontWeight: 600, fontSize: '0.78rem', flexShrink: 0
                        }}
                      >
                        {maxed ? 'Maxed' : '+ Add'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Customer details */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <label style={labelStyle}>Customer Details</label>
            <div>
              <label style={labelStyle}>Name *</label>
              <input name="name" placeholder="Customer name" value={form.name} onChange={handleFormChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone *</label>
              <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleFormChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" placeholder="Email (optional)" value={form.email} onChange={handleFormChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Payment Status *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { key: 'paid', label: 'Paid', color: '#2E7D32' },
                  { key: 'partial', label: 'Partial', color: '#F59000' },
                  { key: 'unpaid', label: 'Unpaid', color: '#C62828' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setForm({ ...form, payment_status: opt.key })}
                    style={{
                      flex: 1, padding: '0.7rem', borderRadius: '10px', cursor: 'pointer',
                      border: `1.5px solid ${form.payment_status === opt.key ? opt.color : 'var(--border)'}`,
                      background: form.payment_status === opt.key ? opt.color : 'white',
                      color: form.payment_status === opt.key ? 'white' : 'var(--text-muted)',
                      fontWeight: 600, fontSize: '0.85rem'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.payment_status === 'partial' && (
              <div>
                <label style={labelStyle}>Amount Paid Now *</label>
                <input
                  name="amount_paid" type="number" min="0" step="0.01"
                  placeholder="0" value={form.amount_paid} onChange={handleFormChange}
                  required style={inputStyle}
                />
                {total > 0 && form.amount_paid && !isNaN(parseFloat(form.amount_paid)) && (
                  <p style={{ fontSize: '0.78rem', color: '#C62828', marginTop: '0.4rem' }}>
                    ₹{Math.max(0, total - parseFloat(form.amount_paid))} will remain outstanding
                  </p>
                )}
              </div>
            )}

            {form.payment_status !== 'unpaid' && (
              <div>
                <label style={labelStyle}>Payment Method *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Cash', 'UPI', 'Card'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setForm({ ...form, payment_method: method })}
                      style={{
                        flex: 1, padding: '0.7rem', borderRadius: '10px', cursor: 'pointer',
                        border: `1.5px solid ${form.payment_method === method ? 'var(--primary)' : 'var(--border)'}`,
                        background: form.payment_method === method ? 'var(--primary)' : 'white',
                        color: form.payment_method === method ? 'white' : 'var(--text-muted)',
                        fontWeight: 600, fontSize: '0.85rem'
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.payment_status === 'unpaid' && (
              <p style={{ fontSize: '0.8rem', color: '#C62828', background: '#FFEBEE', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                Full amount of ₹{total} will be recorded as outstanding.
              </p>
            )}
          </div>

          <button type="submit" disabled={saving || cartEntries.length === 0} style={{
            width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer', fontWeight: 700,
            opacity: (saving || cartEntries.length === 0) ? 0.6 : 1
          }}>
            {saving ? 'Saving...' : `Complete Sale${itemCount > 0 ? ` — ₹${total}` : ''}${form.payment_status !== 'paid' ? ' (Due Recorded)' : ''}`}
          </button>
        </form>
      </div>
    </div>
  )
}