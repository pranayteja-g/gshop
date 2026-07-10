import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (!error) setOrders(data)
    setLoading(false)
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.2rem', flex: 1 }}>Orders</h2>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{orders.length} total</span>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '1.2rem' }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.1rem' }}>{orders.length}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reservations</p>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.1rem' }}>₹{totalRevenue}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>📋</p>
            <p>No reservations yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {orders.map((order, i) => (
              <div key={order.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

                {/* Order header */}
                <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: '0.1rem' }}>{order.customer_name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>📞 {order.customer_phone}</p>
                    {order.customer_email && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>✉️ {order.customer_email}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1.1rem', marginBottom: '0.1rem' }}>₹{order.total_amount}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(order.created_at)}</p>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '0.8rem 1rem', background: 'var(--bg)' }}>
                  {order.items?.map((item, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.85rem', borderBottom: j < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ color: 'var(--text)' }}>{item.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}