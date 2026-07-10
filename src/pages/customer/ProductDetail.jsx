import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const galleryRef = useRef(null)
  const fullscreenRef = useRef(null)

  useEffect(() => {
    fetchProduct()
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(saved)
  }, [])

  // Lock background scroll while the fullscreen viewer is open,
  // and jump the fullscreen gallery to whichever image was showing.
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        const el = fullscreenRef.current
        if (el) el.scrollTo({ left: activeImg * el.clientWidth })
      })
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [fullscreen])

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

  function handleGalleryScroll() {
    const el = galleryRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActiveImg(idx)
  }

  function handleFullscreenScroll() {
    const el = fullscreenRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActiveImg(idx)
  }

  function scrollToImage(idx) {
    const el = galleryRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
    setActiveImg(idx)
  }

  function scrollFullscreenTo(idx) {
    const el = fullscreenRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
    setActiveImg(idx)
  }

  const isWishlisted = wishlist.some(w => w.id === product?.id)

  const galleryImages = product
    ? (Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.image_url ? [product.image_url] : []))
    : []

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

      {/* Full bleed image gallery */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', maxHeight: '65vh', overflow: 'hidden' }}>
        {galleryImages.length > 0
          ? (
            <div
              ref={galleryRef}
              onScroll={handleGalleryScroll}
              style={{
                display: 'flex', width: '100%', height: '100%',
                overflowX: 'auto', scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none'
              }}
            >
              {galleryImages.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${product.name} ${idx + 1}`}
                  onClick={() => setFullscreen(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', flexShrink: 0, scrollSnapAlign: 'start', cursor: 'zoom-in' }}
                />
              ))}
            </div>
          )
          : <div style={{ width: '100%', height: '100%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No image</div>
        }

        {/* Expand hint */}
        {galleryImages.length > 0 && (
          <button onClick={() => setFullscreen(true)} style={{
            position: 'absolute', bottom: '14px', right: '1rem',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
            border: 'none', color: 'white',
            width: '34px', height: '34px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>⤢</button>
        )}

        {/* Dot indicators */}
        {galleryImages.length > 1 && (
          <div style={{ position: 'absolute', bottom: '14px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToImage(idx)}
                style={{
                  width: activeImg === idx ? '18px' : '6px', height: '6px', borderRadius: '3px',
                  border: 'none', cursor: 'pointer', padding: 0,
                  background: activeImg === idx ? 'white' : 'rgba(255,255,255,0.5)',
                  transition: 'width 0.2s'
                }}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        {galleryImages.length > 1 && (
          <span style={{
            position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', color: 'white',
            fontSize: '0.75rem', padding: '0.25rem 0.7rem', borderRadius: '20px', fontWeight: 600
          }}>
            {activeImg + 1} / {galleryImages.length}
          </span>
        )}

        {/* Sold overlay */}
        {product.status === 'sold' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
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

      {/* Fullscreen image viewer */}
      {fullscreen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'black',
          display: 'flex', flexDirection: 'column'
        }}>
          <div
            ref={fullscreenRef}
            onScroll={handleFullscreenScroll}
            style={{
              display: 'flex', width: '100%', height: '100%',
              overflowX: 'auto', scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none'
            }}
          >
            {galleryImages.map((url, idx) => (
              <div key={idx} style={{
                width: '100%', height: '100%', flexShrink: 0, scrollSnapAlign: 'start',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img
                  src={url}
                  alt={`${product.name} ${idx + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            ))}
          </div>

          {/* Close button */}
          <button onClick={() => setFullscreen(false)} style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
            border: 'none', color: 'white',
            width: '38px', height: '38px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>

          {/* Counter */}
          {galleryImages.length > 1 && (
            <span style={{
              position: 'absolute', top: '1.1rem', left: '50%', transform: 'translateX(-50%)',
              color: 'white', fontSize: '0.85rem', fontWeight: 600
            }}>
              {activeImg + 1} / {galleryImages.length}
            </span>
          )}

          {/* Dot indicators */}
          {galleryImages.length > 1 && (
            <div style={{ position: 'absolute', bottom: '1.5rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollFullscreenTo(idx)}
                  style={{
                    width: activeImg === idx ? '18px' : '6px', height: '6px', borderRadius: '3px',
                    border: 'none', cursor: 'pointer', padding: 0,
                    background: activeImg === idx ? 'white' : 'rgba(255,255,255,0.4)',
                    transition: 'width 0.2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}