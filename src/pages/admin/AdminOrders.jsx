import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setOrders(data)
    setLoading(false)
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('en-IN')
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading orders...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/admin')}
          style={{ background: 'none', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Orders ({orders.length})</h2>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: '#888' }}>No orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.2rem' }}>{order.customer_name}</h3>
                  <p style={{ margin: 0, color: '#666' }}>📞 {order.customer_phone}</p>
                  {order.customer_email && (
                    <p style={{ margin: '0.2rem 0 0', color: '#666' }}>✉️ {order.customer_email}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 0.2rem', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{order.total_amount}</p>
                  <p style={{ margin: 0, color: '#999', fontSize: '0.85rem' }}>{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '0.8rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Items ordered:</p>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #eee' }}>
                    <span>{item.name}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}