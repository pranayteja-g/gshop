import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(saved)
  }, [])

  function removeFromWishlist(id) {
    const updated = wishlist.filter(w => w.id !== id)
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  function clearWishlist() {
    setWishlist([])
    localStorage.removeItem('wishlist')
  }

  const total = wishlist.reduce((sum, p) => sum + parseFloat(p.selling_price || 0), 0)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>My Wishlist ({wishlist.length} items)</h2>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <p style={{ fontSize: '1.2rem' }}>Your wishlist is empty</p>
          <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {wishlist.map(product => (
              <div key={product.id} style={{ display: 'flex', gap: '1rem', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', alignItems: 'center' }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} style={{ width: '100px', height: '100px', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: '100px', height: '100px', background: '#f5f5f5', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, padding: '0.5rem' }}>
                  <h3 style={{ margin: '0 0 0.3rem' }}>{product.name}</h3>
                  <p style={{ margin: '0.2rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'capitalize' }}>{product.category} · {product.color}</p>
                  <p style={{ margin: '0.3rem 0', fontWeight: 'bold' }}>₹{product.selling_price}</p>
                </div>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  style={{ marginRight: '1rem', background: 'none', border: '1px solid #ff4444', color: '#ff4444', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={clearWishlist}
              style={{ flex: 1, padding: '0.8rem', background: 'white', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}
            >
              Clear Wishlist
            </button>
            <button
              onClick={() => navigate('/order')}
              style={{ flex: 2, padding: '0.8rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Place Order →
            </button>
          </div>
        </>
      )}
    </div>
  )
}