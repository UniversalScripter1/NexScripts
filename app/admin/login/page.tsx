'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Invalid password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="stars" />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm fade-up fade-up-1">
        <div className="glass glow-border rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="ornament mb-4 text-xs tracking-[0.3em] font-heading text-[var(--text-muted)]">ADMIN</div>
            <h1 className="font-display text-2xl gold-text mb-2">Vault Access</h1>
            <p className="text-[var(--text-muted)] text-sm">Enter your admin password to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="input-glass w-full px-4 py-3 rounded-xl"
                autoFocus
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center font-heading tracking-wider">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ENTERING...' : 'ENTER VAULT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
