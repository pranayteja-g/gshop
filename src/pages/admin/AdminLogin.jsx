import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setError('Invalid email or password'); setLoading(false) }
    else navigate('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>

      {/* Logo area */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--primary)', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>✦ Boutique</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Admin Portal</p>
      </div>

      {/* Card */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '380px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '1.5rem' }}>Sign in</h2>

        {error && (
          <div style={{ background: '#FFEBEE', border: '1px solid #ffcdd2', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1rem' }}>
            <p style={{ color: '#C62828', fontSize: '0.88rem' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.3rem' }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', color: 'var(--text)', outline: 'none', background: 'var(--bg)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.3rem' }}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', color: 'var(--text)', outline: 'none', background: 'var(--bg)' }} />
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.9rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', cursor: 'pointer', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}