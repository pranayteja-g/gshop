import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function CustomerView() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [wishlist, setWishlist] = useState([])
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(saved)
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products').select('*').order('created_at', { ascending: false })
    if (!error) setProducts(data)
    setLoading(false)
  }

  function toggleWishlist(product) {
    const exists = wishlist.find(w => w.id === product.id)
    const updated = exists
      ? wishlist.filter(w => w.id !== product.id)
      : [...wishlist, product]
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  function isWishlisted(id) {
    return wishlist.some(w => w.id === id)
  }

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products.filter(p => {
    const matchesCategory = filter === 'all' || p.category === filter
    const matchesSearch = search === '' ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.color?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading collection...</p>
    </div>
  )

  return (
    <div className="customer-page">
      {/* Navbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--primary)',
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1rem' }}>
          {/* Main nav row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#F9F6F2',
              letterSpacing: '0.04em'
            }}>
              ✦ Boutique
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => { setSearchOpen(o => !o); }}
                style={{ background: 'none', border: 'none', color: '#F9F6F2', fontSize: '1.2rem', cursor: 'pointer', padding: '0.4rem', lineHeight: 1 }}
              >
                🔍
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                style={{
                  background: wishlist.length > 0 ? 'var(--rose)' : 'rgba(255,255,255,0.15)',
                  border: 'none', color: 'white',
                  padding: '0.35rem 0.75rem', borderRadius: '20px',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  transition: 'background 0.2s'
                }}
              >
                ♡ {wishlist.length > 0 ? wishlist.length : ''}
              </button>
            </div>
          </div>

          {/* Expandable search */}
          {searchOpen && (
            <div style={{ paddingBottom: '0.75rem' }}>
              <input
                autoFocus
                type="text"
                placeholder="Search by name, color, fabric..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#F9F6F2',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.75rem', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '20px',
                  border: `1.5px solid ${filter === cat ? 'var(--gold-light)' : 'rgba(255,255,255,0.25)'}`,
                  background: filter === cat ? 'var(--gold)' : 'transparent',
                  color: filter === cat ? '#fff' : 'rgba(255,255,255,0.75)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: filter === cat ? 600 : 400,
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Grid */}
      <div className="product-grid">
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
            <p>No results found</p>
          </div>
        )}

        {filtered.map(product => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#ddd', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            {/* Image */}
            <div style={{ aspectRatio: '2/3', position: 'relative', overflow: 'hidden' }}>
              {product.image_url
                ? <img src={product.image_url} alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }} />
                : <div style={{ width: '100%', height: '100%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>No image</div>
              }

              {/* Sold overlay */}
              {product.status === 'sold' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', border: '1.5px solid white', padding: '0.25rem 0.7rem', borderRadius: '4px', letterSpacing: '0.1em' }}>SOLD</span>
                </div>
              )}

              {/* Gradient overlay at bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />

              {/* Info on top of gradient */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.6rem 0.7rem' }}>
                <p style={{ color: 'white', fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.15rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{product.name}</p>
                <p style={{ color: 'var(--gold-light)', fontSize: '0.85rem', fontWeight: 700 }}>₹{product.selling_price}</p>
              </div>

              {/* Wishlist heart */}
              <button
                onClick={e => { e.stopPropagation(); toggleWishlist(product) }}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
                  border: 'none', borderRadius: '50%',
                  width: '30px', height: '30px',
                  cursor: 'pointer', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isWishlisted(product.id) ? '#ff6b8a' : 'rgba(255,255,255,0.9)'
                }}
              >
                {isWishlisted(product.id) ? '❤️' : '♡'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom padding */}
      <div style={{ height: '2rem' }} />
    </div>
  )
}