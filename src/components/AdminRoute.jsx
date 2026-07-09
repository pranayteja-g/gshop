import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setChecking(false)
      if (!session) navigate('/admin/login')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) navigate('/admin/login')
    })

    return () => subscription.unsubscribe()
  }, [])

  if (checking) return <p style={{ padding: '2rem' }}>Checking auth...</p>
  if (!session) return null

  return children
}