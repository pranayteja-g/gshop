import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setProducts(data)
    setLoading(false)
  }

  async function toggleStatus(product) {
    const newStatus = product.status === 'available' ? 'sold' : 'available'
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', product.id)

    if (!error) fetchProducts()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) fetchProducts()
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Admin Dashboard ({products.length} products)</h2>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={() => navigate('/admin/orders')}
            style={{ padding: '0.6rem 1rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            📋 View Orders
          </button>
          <button
            onClick={() => navigate('/admin/add')}
            style={{ padding: '0.6rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            + Add Product
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '200px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No image</div>
            }
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>{product.name}</h3>
              <p style={{ margin: '0.2rem 0', color: '#666' }}>{product.category} · {product.color}</p>
              <p style={{ margin: '0.2rem 0' }}>Selling: ₹{product.selling_price}</p>
              <p style={{ margin: '0.2rem 0' }}>Cost: ₹{product.cost_price}</p>
              <p style={{ margin: '0.2rem 0' }}>Qty: {product.quantity}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => toggleStatus(product)}
                  style={{ background: product.status === 'available' ? 'green' : 'gray', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {product.status === 'available' ? 'Available' : 'Sold'}
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  style={{ background: 'red', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Delete
                </button>
                <button
                  onClick={() => navigate(`/admin/edit/${product.id}`)}
                  style={{ background: '#2196F3', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}