import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(saved)
  }, [])

  function remove(id) {
    const updated = wishlist.filter(w => w.id !== id)
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  function clear() {
    setWishlist([])
    localStorage.removeItem('wishlist')
  }

  const total = wishlist.reduce((sum, p) => sum + parseFloat(p.selling_price || 0), 0)

  return (
    <div className="page-narrow" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--primary)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'white', flex: 1 }}>My Wishlist</h2>
        {wishlist.length > 0 && (
          <button onClick={clear} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer' }}>Clear all</button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>♡</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem' }}>Your wishlist is empty</p>
          <button onClick={() => navigate('/')} style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
            Browse Collection
          </button>
        </div>
      ) : (
        <>
          {/* Items */}
          <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {wishlist.map(product => (
              <div key={product.id} style={{ display: 'flex', gap: '0.8rem', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: '80px', height: '80px', background: 'var(--border)', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, padding: '0.7rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.2rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{product.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{product.category} · {product.color}</p>
                  <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.95rem' }}>₹{product.selling_price}</p>
                </div>
                <button onClick={() => remove(product.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0 1rem', cursor: 'pointer', fontSize: '1.3rem', flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{wishlist.length} items</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>₹{total}</span>
            </div>
            <button onClick={() => navigate('/order')} style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer', fontWeight: 700 }}>
              Reserve These Items →
            </button>
          </div>
        </>
      )}
    </div>
  )
}