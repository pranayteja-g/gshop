import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products').select('*').order('created_at', { ascending: false })
    if (!error) setProducts(data)
    setLoading(false)
  }

  async function toggleStatus(product) {
    const newStatus = product.status === 'available' ? 'sold' : 'available'
    await supabase.from('products').update({ status: newStatus }).eq('id', product.id)
    fetchProducts()
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter)
  const availableCount = products.filter(p => p.status === 'available').length
  const soldCount = products.filter(p => p.status === 'sold').length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '1rem 1.2rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', color: '#F9F6F2', fontSize: '1.3rem' }}>✦ Admin Panel</h1>
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              Logout
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { label: '+ Add Product', path: '/admin/add', bg: 'var(--gold)' },
              { label: '🛍 New Sale', path: '/admin/new-order', bg: '#2E7D32' },
              { label: '📋 Orders', path: '/admin/orders', bg: 'rgba(255,255,255,0.15)' },
              { label: '⬆⬇ Import / Export', path: '/admin/import', bg: 'rgba(255,255,255,0.15)' },
            ].map(btn => (
              <button key={btn.path} onClick={() => navigate(btn.path)} style={{ background: btn.bg, border: 'none', color: 'white', padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.7rem', marginBottom: '1.2rem' }}>
          {[
            { label: 'Total', value: products.length, color: 'var(--primary)' },
            { label: 'Available', value: availableCount, color: '#2E7D32' },
            { label: 'Sold', value: soldCount, color: '#C62828' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.8rem 1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color, marginBottom: '0.1rem' }}>{stat.value}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.3rem', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '0.35rem 0.9rem', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0,
              border: `1.5px solid ${filter === cat ? 'var(--primary)' : 'var(--border)'}`,
              background: filter === cat ? 'var(--primary)' : 'white',
              color: filter === cat ? 'white' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: filter === cat ? 600 : 400,
              textTransform: 'capitalize'
            }}>{cat}</button>
          ))}
        </div>

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.8rem' }}>
          {filtered.map(product => (
            <div key={product.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ position: 'relative' }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '180px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No image</div>
                }
                <span style={{
                  position: 'absolute', top: '8px', left: '8px',
                  background: product.status === 'available' ? '#2E7D32' : '#555',
                  color: 'white', fontSize: '0.72rem', fontWeight: 700,
                  padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {product.status}
                </span>
              </div>

              <div style={{ padding: '0.9rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{product.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'capitalize' }}>{product.category} · {product.color}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selling</p>
                    <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1rem' }}>₹{product.selling_price}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cost</p>
                    <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>₹{product.cost_price}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profit</p>
                    <p style={{ fontWeight: 600, color: '#2E7D32', fontSize: '0.95rem' }}>₹{product.selling_price - product.cost_price}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty</p>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{product.quantity}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => toggleStatus(product)} style={{
                    flex: 1, padding: '0.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    background: product.status === 'available' ? '#E8F5E9' : '#F5F5F5',
                    color: product.status === 'available' ? '#2E7D32' : '#757575',
                    fontWeight: 600, fontSize: '0.8rem'
                  }}>
                    {product.status === 'available' ? '✓ Available' : '○ Sold'}
                  </button>
                  <button onClick={() => navigate(`/admin/edit/${product.id}`)} style={{ padding: '0.5rem 0.8rem', background: '#EEF2FF', color: '#3949AB', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                    Edit
                  </button>
                  <button onClick={() => deleteProduct(product.id)} style={{ padding: '0.5rem 0.8rem', background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}