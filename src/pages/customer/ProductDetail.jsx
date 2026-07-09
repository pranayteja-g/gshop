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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (!error) setProduct(data)
    setLoading(false)
  }

  function toggleWishlist() {
    const exists = wishlist.find(w => w.id === product.id)
    let updated
    if (exists) {
      updated = wishlist.filter(w => w.id !== product.id)
    } else {
      updated = [...wishlist, product]
    }
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  function isWishlisted() {
    return wishlist.some(w => w.id === product?.id)
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>
  if (!product) return <p style={{ padding: '2rem' }}>Product not found.</p>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Image */}
        <div style={{ position: 'relative' }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '400px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No image</div>
          }
          {product.status === 'sold' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>SOLD</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{product.name}</h1>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {product.category && (
              <span style={{ background: '#f0f0f0', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                {product.category}
              </span>
            )}
            {product.color && (
              <span style={{ background: '#f0f0f0', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                {product.color}
              </span>
            )}
          </div>

          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>₹{product.selling_price}</p>

          <p style={{ color: product.status === 'available' ? 'green' : 'red', fontWeight: 'bold', margin: 0 }}>
            {product.status === 'available' ? '✅ Available' : '❌ Sold'}
          </p>

          {product.status === 'available' && (
            <button
              onClick={toggleWishlist}
              style={{
                padding: '0.8rem',
                background: isWishlisted() ? '#e91e63' : 'white',
                color: isWishlisted() ? 'white' : '#e91e63',
                border: '2px solid #e91e63',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isWishlisted() ? '❤️ Added to Wishlist' : '🤍 Add to Wishlist'}
            </button>
          )}

          {wishlist.length > 0 && (
            <button
              onClick={() => navigate('/wishlist')}
              style={{ padding: '0.8rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}
            >
              View Wishlist ({wishlist.length}) →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}