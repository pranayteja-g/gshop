import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: '#FFF8E1', color: '#F59000', border: '#FFE082' },
  confirmed: { label: 'Confirmed', bg: '#E3F2FD', color: '#1565C0', border: '#90CAF9' },
  completed: { label: 'Completed', bg: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' },
  cancelled: { label: 'Cancelled', bg: '#F5F5F5', color: '#757575', border: '#E0E0E0' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const navigate = useNavigate()

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders').select('*').order('created_at', { ascending: false })
    if (!error) setOrders(data)
    setLoading(false)
  }

  async function updateOrderStatus(order, newStatus) {
    setUpdating(order.id)

    // If completing — reduce quantity for each item, auto-mark product sold if qty hits 0
    if (newStatus === 'completed') {
      for (const item of order.items || []) {
        // Get current product
        const { data: product } = await supabase
          .from('products').select('quantity, status').eq('id', item.id).single()

        if (product) {
          const newQty = Math.max(0, product.quantity - 1)
          const newProductStatus = newQty === 0 ? 'sold' : product.status
          await supabase.from('products')
            .update({ quantity: newQty, status: newProductStatus })
            .eq('id', item.id)
        }
      }
    }

    // Update order status
    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)
      .select()

    if (error) {
      console.error('Failed to update order status:', error)
      alert(`Could not update order: ${error.message}`)
    } else if (!updated || updated.length === 0) {
      console.error('Update returned no rows — likely blocked by RLS policy on orders table')
      alert('Update was blocked (no rows changed). This is usually a Supabase RLS policy issue on the orders table.')
    }

    await fetchOrders()
    setUpdating(null)
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)

  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  // What action buttons to show based on current status
  function getActions(order) {
    switch (order.status) {
      case 'pending': return [
        { label: 'Confirm', next: 'confirmed', bg: '#1565C0', color: 'white' },
        { label: 'Cancel', next: 'cancelled', bg: '#F5F5F5', color: '#757575' },
      ]
      case 'confirmed': return [
        { label: 'Mark Completed', next: 'completed', bg: '#2E7D32', color: 'white' },
        { label: 'Cancel', next: 'cancelled', bg: '#F5F5F5', color: '#757575' },
      ]
      case 'completed': return []
      case 'cancelled': return []
      default: return []
    }
  }

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
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.2rem', flex: 1 }}>Reservations</h2>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{orders.length} total</span>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.7rem', marginBottom: '1.2rem' }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.9rem 1rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.1rem' }}>₹{totalRevenue}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed Revenue</p>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.9rem 1rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59000', marginBottom: '0.1rem' }}>{counts.pending}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Action</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.3rem', scrollbarWidth: 'none' }}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '0.35rem 0.9rem', borderRadius: '20px', whiteSpace: 'nowrap',
              flexShrink: 0, cursor: 'pointer', fontSize: '0.82rem',
              fontWeight: filterStatus === s ? 600 : 400,
              border: `1.5px solid ${filterStatus === s ? 'var(--primary)' : 'var(--border)'}`,
              background: filterStatus === s ? 'var(--primary)' : 'white',
              color: filterStatus === s ? 'white' : 'var(--text-muted)',
              textTransform: 'capitalize'
            }}>
              {s === 'all' ? `All (${orders.length})` : `${s} (${counts[s]})`}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>📋</p>
            <p>No {filterStatus === 'all' ? '' : filterStatus} reservations</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {filtered.map(order => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const actions = getActions(order)
              const isUpdating = updating === order.id

              return (
                <div key={order.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

                  {/* Status bar at top */}
                  <div style={{ background: statusCfg.bg, borderBottom: `1px solid ${statusCfg.border}`, padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: statusCfg.color, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {statusCfg.label}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(order.created_at)}</span>
                  </div>

                  {/* Customer info */}
                  <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{order.customer_name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>📞 {order.customer_phone}</p>
                      {order.customer_email && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>✉️ {order.customer_email}</p>}
                    </div>
                    <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1.1rem' }}>₹{order.total_amount}</p>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '0.8rem 1rem', background: 'var(--bg)', borderBottom: actions.length > 0 ? '1px solid var(--border)' : 'none' }}>
                    {order.items?.map((item, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.85rem', borderBottom: j < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ color: 'var(--text)' }}>{item.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  {actions.length > 0 && (
                    <div style={{ padding: '0.8rem 1rem', display: 'flex', gap: '0.5rem' }}>
                      {actions.map(action => (
                        <button
                          key={action.next}
                          onClick={() => updateOrderStatus(order, action.next)}
                          disabled={isUpdating}
                          style={{
                            flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px',
                            background: action.bg, color: action.color,
                            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                            opacity: isUpdating ? 0.6 : 1
                          }}
                        >
                          {isUpdating ? '...' : action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}