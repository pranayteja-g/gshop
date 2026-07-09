import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    fetchProduct()
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(saved)
  }, [])

  async function fetchProduct() {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (!error) setProduct(data)
    setLoading(false)
  }

  function toggleWishlist() {
    const exists = wishlist.find(w => w.id === product.id)
    const updated = exists ? wishlist.filter(w => w.id !== product.id) : [...wishlist, product]
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  const isWishlisted = wishlist.some(w => w.id === product?.id)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  )

  if (!product) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Product not found.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>

      {/* Full bleed image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', maxHeight: '65vh', overflow: 'hidden' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No image</div>
        }

        {/* Sold overlay */}
        {product.status === 'sold' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.4rem', border: '2px solid white', padding: '0.4rem 1.2rem', borderRadius: '4px', letterSpacing: '0.1em' }}>SOLD</span>
          </div>
        )}

        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: '1rem', left: '1rem',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
          border: 'none', color: 'white',
          width: '38px', height: '38px', borderRadius: '50%',
          cursor: 'pointer', fontSize: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>←</button>

        {/* Wishlist button on image */}
        <button onClick={toggleWishlist} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
          border: 'none', color: isWishlisted ? '#ff6b8a' : 'white',
          width: '38px', height: '38px', borderRadius: '50%',
          cursor: 'pointer', fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isWishlisted ? '❤️' : '♡'}
        </button>
      </div>

      {/* Details card — slides up */}
      <div style={{
        background: 'var(--bg)',
        borderRadius: '20px 20px 0 0',
        marginTop: '-20px',
        position: 'relative',
        zIndex: 10,
        padding: '1.5rem 1.2rem',
        minHeight: '40vh',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
      }}>
        {/* Drag handle */}
        <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 1.2rem' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', lineHeight: 1.3, flex: 1, marginRight: '1rem' }}>
            {product.name}
          </h2>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>₹{product.selling_price}</p>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          {product.category && (
            <span style={{ background: '#F0EAE0', color: 'var(--text-muted)', padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', textTransform: 'capitalize' }}>
              {product.category}
            </span>
          )}
          {product.color && (
            <span style={{ background: '#F0EAE0', color: 'var(--text-muted)', padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', textTransform: 'capitalize' }}>
              {product.color}
            </span>
          )}
          <span style={{
            padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
            background: product.status === 'available' ? '#E8F5E9' : '#FFEBEE',
            color: product.status === 'available' ? '#2E7D32' : '#C62828'
          }}>
            {product.status === 'available' ? '✓ Available' : '✗ Sold'}
          </span>
        </div>

        {/* CTAs */}
        {product.status === 'available' && (
          <button onClick={toggleWishlist} style={{
            width: '100%', padding: '0.9rem',
            background: isWishlisted ? 'var(--rose)' : 'white',
            color: isWishlisted ? 'white' : 'var(--rose)',
            border: '2px solid var(--rose)',
            borderRadius: '12px', fontSize: '0.95rem',
            cursor: 'pointer', fontWeight: 600, marginBottom: '0.7rem',
            transition: 'all 0.2s'
          }}>
            {isWishlisted ? '❤️  Added to Wishlist' : '♡  Add to Wishlist'}
          </button>
        )}

        {wishlist.length > 0 && (
          <button onClick={() => navigate('/wishlist')} style={{
            width: '100%', padding: '0.9rem',
            background: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: '12px',
            fontSize: '0.95rem', cursor: 'pointer', fontWeight: 600
          }}>
            View Wishlist ({wishlist.length}) →
          </button>
        )}
      </div>
    </div>
  )
}