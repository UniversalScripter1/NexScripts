'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Script } from '@/lib/supabase'
import Link from 'next/link'

interface AnalyticsRow {
  script_id: string
  event_type: 'view' | 'copy'
  created_at: string
  country: string | null
}

interface Props {
  scripts: Script[]
  analytics: AnalyticsRow[]
}

type Tab = 'scripts' | 'analytics' | 'upload'

export default function AdminDashboard({ scripts: initialScripts, analytics }: Props) {
  const [scripts, setScripts] = useState(initialScripts)
  const [tab, setTab] = useState<Tab>('scripts')
  const [editingScript, setEditingScript] = useState<Script | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/')
    router.refresh()
  }

  function flash(m: string) {
    setMsg(m)
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteScript(id: string) {
    if (!confirm('Delete this script? This cannot be undone.')) return
    const res = await fetch('/api/admin/scripts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setScripts(s => s.filter(sc => sc.id !== id))
      flash('Script deleted.')
    }
  }

  // Per-script analytics
  const analyticsMap: Record<string, { views: number; copies: number }> = {}
  analytics.forEach(a => {
    if (!analyticsMap[a.script_id]) analyticsMap[a.script_id] = { views: 0, copies: 0 }
    if (a.event_type === 'view') analyticsMap[a.script_id].views++
    if (a.event_type === 'copy') analyticsMap[a.script_id].copies++
  })

  const totalViews = analytics.filter(a => a.event_type === 'view').length
  const totalCopies = analytics.filter(a => a.event_type === 'copy').length

  // Country breakdown
  const countryMap: Record<string, number> = {}
  analytics.filter(a => a.event_type === 'view' && a.country).forEach(a => {
    countryMap[a.country!] = (countryMap[a.country!] || 0) + 1
  })
  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Recent events
  const recent = analytics.slice(0, 20)

  // 7-day activity
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const count = analytics.filter(a => a.created_at.slice(0, 10) === key).length
    return { key, label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), count }
  })
  const maxActivity = Math.max(...last7.map(d => d.count), 1)

  return (
    <div className="min-h-screen">
      <div className="stars" />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vh] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        {/* Admin Nav */}
        <nav className="glass border-b border-[var(--glass-border)] sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/" className="font-heading text-xs tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-colors hidden sm:block">
                ← PUBLIC
              </Link>
              <span className="text-[var(--glass-border)] hidden sm:block">|</span>
              <span className="font-heading text-xs tracking-[0.25em] gold-text">ADMIN VAULT</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {(['scripts', 'analytics'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-heading tracking-widest transition-all ${
                    tab === t
                      ? 'bg-[rgba(201,168,76,0.15)] text-[var(--gold-light)] border border-[var(--glass-border)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="ml-2 text-xs font-heading tracking-widest text-[var(--text-muted)] hover:text-red-400 transition-colors px-2"
              >
                EXIT
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Flash message */}
          {msg && (
            <div className="mb-4 glass border border-[rgba(201,168,76,0.4)] rounded-xl px-4 py-3 text-sm font-heading tracking-wider gold-text text-center">
              {msg}
            </div>
          )}

          {/* ── SCRIPTS TAB ── */}
          {tab === 'scripts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl sm:text-2xl gold-text tracking-wider">Scripts</h2>
                <button
                  onClick={() => { setEditingScript(null); setShowForm(true) }}
                  className="btn-gold px-4 sm:px-6 py-2 rounded-xl text-xs"
                >
                  + NEW SCRIPT
                </button>
              </div>

              {showForm && (
                <ScriptForm
                  script={editingScript}
                  onClose={() => { setShowForm(false); setEditingScript(null) }}
                  onSave={(s) => {
                    if (editingScript) {
                      setScripts(prev => prev.map(p => p.id === s.id ? s : p))
                      flash('Script updated!')
                    } else {
                      setScripts(prev => [s, ...prev])
                      flash('Script created!')
                    }
                    setShowForm(false)
                    setEditingScript(null)
                  }}
                />
              )}

              <div className="space-y-3 mt-4">
                {scripts.length === 0 && (
                  <div className="text-center py-16 text-[var(--text-muted)] font-heading tracking-widest text-sm">
                    NO SCRIPTS YET
                  </div>
                )}
                {scripts.map(script => (
                  <div key={script.id} className="glass glow-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {script.background_image_url && (
                      <div className="w-full sm:w-16 h-24 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={script.background_image_url} alt="" className="w-full h-full object-cover opacity-70" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-heading text-sm text-[var(--text-primary)] truncate">{script.title}</h3>
                        {script.game_name && (
                          <span className="text-[10px] font-heading tracking-wider text-[var(--gold-dim)] glass px-2 py-0.5 rounded-full border border-[var(--glass-border)]">
                            {script.game_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="font-heading">{new Date(script.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{analyticsMap[script.id]?.views || 0} views</span>
                        <span>·</span>
                        <span>{analyticsMap[script.id]?.copies || 0} copies</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/scripts/${script.slug}`}
                        target="_blank"
                        className="text-xs font-heading tracking-wider text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-colors px-2 py-1"
                      >
                        VIEW
                      </Link>
                      <button
                        onClick={() => { setEditingScript(script); setShowForm(true) }}
                        className="btn-gold px-3 py-1.5 rounded-lg text-xs"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => deleteScript(script.id)}
                        className="text-xs font-heading tracking-wider text-red-500/60 hover:text-red-400 transition-colors px-2 py-1"
                      >
                        DEL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && (
            <div>
              <h2 className="font-heading text-xl sm:text-2xl gold-text tracking-wider mb-6">Analytics</h2>

              {/* Overview stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                {[
                  { label: 'TOTAL SCRIPTS', value: scripts.length },
                  { label: 'TOTAL VIEWS', value: totalViews },
                  { label: 'TOTAL COPIES', value: totalCopies },
                  { label: 'COPY RATE', value: totalViews > 0 ? `${Math.round(totalCopies / totalViews * 100)}%` : '0%' },
                ].map(stat => (
                  <div key={stat.label} className="glass glow-border rounded-2xl p-4 text-center">
                    <div className="font-heading text-2xl sm:text-3xl gold-text mb-1">{stat.value}</div>
                    <div className="text-[10px] font-heading tracking-[0.2em] text-[var(--text-muted)]">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* 7-day activity bar chart */}
              <div className="glass glow-border rounded-2xl p-5 sm:p-6 mb-6">
                <h3 className="font-heading text-xs tracking-[0.25em] text-[var(--text-muted)] mb-5">7-DAY ACTIVITY</h3>
                <div className="flex items-end gap-2 sm:gap-3 h-24">
                  {last7.map(day => (
                    <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm transition-all duration-500" style={{
                        height: `${(day.count / maxActivity) * 80}px`,
                        minHeight: day.count > 0 ? '4px' : '1px',
                        background: day.count > 0
                          ? 'linear-gradient(180deg, rgba(201,168,76,0.7) 0%, rgba(201,168,76,0.2) 100%)'
                          : 'rgba(255,255,255,0.05)',
                      }} />
                      <span className="text-[9px] font-heading text-[var(--text-muted)] tracking-wide">{day.label.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Per-script breakdown */}
                <div className="glass glow-border rounded-2xl p-5">
                  <h3 className="font-heading text-xs tracking-[0.25em] text-[var(--text-muted)] mb-4">BY SCRIPT</h3>
                  <div className="space-y-3">
                    {scripts.map(s => {
                      const a = analyticsMap[s.id] || { views: 0, copies: 0 }
                      const pct = totalViews > 0 ? (a.views / totalViews) * 100 : 0
                      return (
                        <div key={s.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-heading text-[var(--text-secondary)] truncate max-w-[60%]">{s.title}</span>
                            <span className="text-[var(--text-muted)] font-heading">{a.views}v · {a.copies}c</span>
                          </div>
                          <div className="h-1 rounded-full bg-[var(--glass-border)] overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c9a84c, #f0d080)' }} />
                          </div>
                        </div>
                      )
                    })}
                    {scripts.length === 0 && <p className="text-[var(--text-muted)] text-xs">No data yet</p>}
                  </div>
                </div>

                {/* Country breakdown */}
                <div className="glass glow-border rounded-2xl p-5">
                  <h3 className="font-heading text-xs tracking-[0.25em] text-[var(--text-muted)] mb-4">TOP COUNTRIES</h3>
                  <div className="space-y-2">
                    {topCountries.length === 0 && <p className="text-[var(--text-muted)] text-xs">No location data yet</p>}
                    {topCountries.map(([country, count]) => (
                      <div key={country} className="flex justify-between items-center">
                        <span className="font-heading text-xs text-[var(--text-secondary)]">{country}</span>
                        <span className="font-heading text-xs text-[var(--text-muted)]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent events */}
              <div className="glass glow-border rounded-2xl p-5">
                <h3 className="font-heading text-xs tracking-[0.25em] text-[var(--text-muted)] mb-4">RECENT EVENTS</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {recent.map((r, i) => {
                    const sc = scripts.find(s => s.id === r.script_id)
                    return (
                      <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-[var(--glass-border)] last:border-0">
                        <span className={`font-heading tracking-widest px-2 py-0.5 rounded-full text-[10px] ${
                          r.event_type === 'view'
                            ? 'bg-blue-500/10 text-blue-400/80 border border-blue-500/20'
                            : 'bg-[rgba(201,168,76,0.1)] text-[var(--gold-dim)] border border-[rgba(201,168,76,0.2)]'
                        }`}>
                          {r.event_type.toUpperCase()}
                        </span>
                        <span className="text-[var(--text-secondary)] truncate flex-1">{sc?.title || 'Unknown'}</span>
                        <span className="text-[var(--text-muted)] whitespace-nowrap">
                          {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                  {recent.length === 0 && <p className="text-[var(--text-muted)] text-xs text-center py-4">No events yet</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Script Form ───────────────────────────────────────────────────────────────
function ScriptForm({
  script,
  onClose,
  onSave,
}: {
  script: Script | null
  onClose: () => void
  onSave: (s: Script) => void
}) {
  const [title, setTitle] = useState(script?.title || '')
  const [description, setDescription] = useState(script?.description || '')
  const [content, setContent] = useState(script?.script_content || '')
  const [gameName, setGameName] = useState(script?.game_name || '')
  const [gameLink, setGameLink] = useState(script?.game_link || '')
  const [bgUrl, setBgUrl] = useState(script?.background_image_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadImage(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    setUploading(false)
    if (data.url) setBgUrl(data.url)
    else setError(data.error || 'Upload failed')
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError('Title and script content are required.')
      return
    }
    setSaving(true)
    setError('')

    const method = script ? 'PUT' : 'POST'
    const body = {
      ...(script ? { id: script.id } : {}),
      title, description, script_content: content,
      game_name: gameName, game_link: gameLink,
      background_image_url: bgUrl,
    }

    const res = await fetch('/api/admin/scripts', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)

    if (data.ok) onSave(data.script)
    else setError(data.error || 'Failed to save.')
  }

  return (
    <div className="glass glow-border rounded-2xl p-5 sm:p-7 mb-6 animate-[fadeUp_0.3s_ease_forwards]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-sm tracking-[0.2em] gold-text">
          {script ? 'EDIT SCRIPT' : 'NEW SCRIPT'}
        </h3>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-lg leading-none">×</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] font-heading tracking-[0.2em] text-[var(--text-muted)] mb-1.5">TITLE *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Script title"
            className="input-glass w-full px-4 py-2.5 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-[10px] font-heading tracking-[0.2em] text-[var(--text-muted)] mb-1.5">GAME NAME</label>
          <input
            type="text"
            value={gameName}
            onChange={e => setGameName(e.target.value)}
            placeholder="e.g. Blox Fruits"
            className="input-glass w-full px-4 py-2.5 rounded-xl"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[10px] font-heading tracking-[0.2em] text-[var(--text-muted)] mb-1.5">GAME LINK (clickable)</label>
        <input
          type="url"
          value={gameLink}
          onChange={e => setGameLink(e.target.value)}
          placeholder="https://www.roblox.com/games/..."
          className="input-glass w-full px-4 py-2.5 rounded-xl"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[10px] font-heading tracking-[0.2em] text-[var(--text-muted)] mb-1.5">DESCRIPTION</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Brief description of what the script does"
          rows={2}
          className="input-glass w-full px-4 py-2.5 rounded-xl resize-none"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[10px] font-heading tracking-[0.2em] text-[var(--text-muted)] mb-1.5">SCRIPT CONTENT *</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="-- Paste your Lua script here"
          rows={10}
          className="input-glass w-full px-4 py-3 rounded-xl resize-y font-code text-sm"
          spellCheck={false}
        />
      </div>

      {/* Background image upload */}
      <div className="mb-5">
        <label className="block text-[10px] font-heading tracking-[0.2em] text-[var(--text-muted)] mb-1.5">BACKGROUND IMAGE</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={bgUrl}
              onChange={e => setBgUrl(e.target.value)}
              placeholder="Or paste image URL"
              className="input-glass w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-gold px-4 py-2.5 rounded-xl text-xs whitespace-nowrap"
            disabled={uploading}
          >
            {uploading ? 'UPLOADING...' : 'UPLOAD'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])}
          />
        </div>
        {bgUrl && (
          <div className="mt-2 relative h-20 w-full rounded-lg overflow-hidden">
            <img src={bgUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />
            <button
              onClick={() => setBgUrl('')}
              className="absolute top-1 right-1 glass rounded-full w-6 h-6 flex items-center justify-center text-xs text-[var(--text-muted)] hover:text-red-400"
            >×</button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm font-heading tracking-wider mb-4">{error}</p>
      )}

      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="text-xs font-heading tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-4 py-2">
          CANCEL
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gold px-6 py-2.5 rounded-xl text-xs disabled:opacity-50"
        >
          {saving ? 'SAVING...' : script ? 'UPDATE' : 'PUBLISH'}
        </button>
      </div>
    </div>
  )
}
