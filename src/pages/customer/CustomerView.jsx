import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function CustomerView() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [wishlist, setWishlist] = useState([])
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        fetchProducts()
        const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
        setWishlist(saved)
    }, [])

    async function fetchProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error) setProducts(data)
        setLoading(false)
    }

    function toggleWishlist(product) {
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

    function isWishlisted(id) {
        return wishlist.some(w => w.id === id)
    }

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

    const filtered = products.filter(p => {
        const matchesCategory = filter === 'all' || p.category === filter
        const matchesSearch = search === '' ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.color && p.color.toLowerCase().includes(search.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
        return matchesCategory && matchesSearch
    })

    if (loading) return <p style={{ padding: '2rem' }}>Loading products...</p>

    return (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Our Collection</h1>

            {/* Search bar */}
            <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }}>
                <input
                    type="text"
                    placeholder="Search by name, color, category..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '0.8rem 1rem',
                        borderRadius: '25px',
                        border: '1px solid #ddd',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Wishlist count */}
            {wishlist.length > 0 && (
                <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate('/wishlist')}
                        style={{ background: '#e91e63', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer' }}
                    >
                        ❤️ Wishlist ({wishlist.length})
                    </button>
                </div>
            )}

            {/* Category filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            border: '1px solid #ccc',
                            background: filter === cat ? '#333' : 'white',
                            color: filter === cat ? 'white' : '#333',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* No results */}
            {filtered.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
                    No products found for "{search}"
                </p>
            )}

            {/* Products grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {filtered.map(product => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }}
                    >
                        <div style={{ position: 'relative' }}>
                            {product.image_url
                                ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '250px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No image</div>
                            }
                            {product.status === 'sold' && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>SOLD</span>
                                </div>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(product) }}
                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                {isWishlisted(product.id) ? '❤️' : '🤍'}
                            </button>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem' }}>{product.name}</h3>
                            <p style={{ margin: '0.2rem 0', color: '#888', fontSize: '0.85rem', textTransform: 'capitalize' }}>{product.category} · {product.color}</p>
                            <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{product.selling_price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}