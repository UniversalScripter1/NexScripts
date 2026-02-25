'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Script } from '@/lib/supabase'

interface Props {
  script: Script
  analytics: { views: number; copies: number }
}

export default function ScriptView({ script, analytics }: Props) {
  const [copied, setCopied] = useState(false)
  const [localViews, setLocalViews] = useState(analytics.views)
  const [localCopies, setLocalCopies] = useState(analytics.copies)
  const tracked = useRef(false)

  // Track view once
  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scriptId: script.id, eventType: 'view' }),
    }).then(() => setLocalViews(v => v + 1))
  }, [script.id])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(script.script_content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: script.id, eventType: 'copy' }),
      }).then(() => setLocalCopies(c => c + 1))
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = script.script_content
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const bgStyle = script.background_image_url
    ? {
        backgroundImage: `url(${script.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {}

  return (
    <div className="min-h-screen relative">
      {/* Background image with blur */}
      {script.background_image_url && (
        <>
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${script.background_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(18px) brightness(0.3) saturate(1.4)',
              transform: 'scale(1.05)',
            }}
          />
          <div className="fixed inset-0 z-0 bg-[#050408]/60" />
        </>
      )}

      {!script.background_image_url && (
        <>
          <div className="stars" />
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vh] rounded-full opacity-[0.07]"
              style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }} />
          </div>
        </>
      )}

      <div className="relative z-10 min-h-screen">
        {/* Nav */}
        <nav className="sticky top-0 z-50 glass border-b border-[var(--glass-border)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-[var(--gold)] group-hover:text-[var(--gold-light)] transition-colors text-lg">←</span>
              <span className="font-heading text-xs tracking-[0.25em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">SCRIPTVAULT</span>
            </Link>
            <div className="flex items-center gap-4 text-xs font-heading tracking-wider text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <EyeIcon />
                {localViews.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <CopyIconSmall />
                {localCopies.toLocaleString()}
              </span>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14">

          {/* Script Frame */}
          <div className="glass glow-border rounded-3xl overflow-hidden fade-up fade-up-1">

            {/* Frame Header */}
            <div className="px-6 sm:px-10 pt-8 sm:pt-12 pb-6 border-b border-[var(--glass-border)]"
              style={{ background: 'linear-gradient(180deg, rgba(201,168,76,0.04) 0%, transparent 100%)' }}>
              
              {/* Game badge */}
              {script.game_name && (
                <div className="mb-4">
                  {script.game_link ? (
                    <a
                      href={script.game_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-[var(--glass-border)] hover:border-[var(--gold)] transition-colors group"
                    >
                      <span className="text-[10px] font-heading tracking-[0.2em] text-[var(--gold-light)] group-hover:text-[var(--gold)] transition-colors">
                        ⬡ {script.game_name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--gold-dim)] transition-colors">↗</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-[var(--glass-border)]">
                      <span className="text-[10px] font-heading tracking-[0.2em] text-[var(--gold-light)]">
                        ⬡ {script.game_name}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold gold-text leading-tight mb-4">
                {script.title}
              </h1>

              {/* Description */}
              {script.description && (
                <p className="font-body text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                  {script.description}
                </p>
              )}

              {/* Meta */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-heading tracking-wider">
                <span>
                  {new Date(script.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
                {script.updated_at !== script.created_at && (
                  <>
                    <span>·</span>
                    <span>Updated {new Date(script.updated_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric'
                    })}</span>
                  </>
                )}
              </div>
            </div>

            {/* Script Content */}
            <div className="relative">
              {/* Code toolbar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--glass-border)]"
                style={{ background: 'rgba(201,168,76,0.02)' }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/60" />
                  </div>
                  <span className="text-[10px] font-heading tracking-[0.25em] text-[var(--text-muted)] ml-2 hidden sm:block">LUA SCRIPT</span>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className={`btn-gold flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs transition-all ${copied ? 'copy-flash' : ''}`}
                >
                  {copied ? (
                    <>
                      <CheckIcon />
                      <span className="hidden sm:inline">COPIED</span>
                      <span className="sm:hidden">✓</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      <span className="hidden sm:inline">COPY SCRIPT</span>
                      <span className="sm:hidden">COPY</span>
                    </>
                  )}
                </button>
              </div>

              {/* The actual code */}
              <div className="overflow-x-auto">
                <pre
                  className="code-block p-5 sm:p-8 m-0 text-[var(--text-primary)] overflow-x-auto"
                  style={{
                    background: 'rgba(5, 4, 8, 0.6)',
                    minHeight: '120px',
                    tabSize: 2,
                  }}
                >
                  <LuaHighlight code={script.script_content} />
                </pre>
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="mt-8 text-center fade-up fade-up-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-colors"
            >
              ← BACK TO VAULT
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Minimal Lua syntax highlighting without external deps
function LuaHighlight({ code }: { code: string }) {
  const highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // strings
    .replace(/"([^"]*)"/g, '<span style="color:#a8e6a3">"$1"</span>')
    .replace(/'([^']*)'/g, '<span style="color:#a8e6a3">\'$1\'</span>')
    // long strings [[...]]
    .replace(/\[\[[\s\S]*?\]\]/g, m => `<span style="color:#a8e6a3">${m}</span>`)
    // comments --
    .replace(/(--[^\n]*)/g, '<span style="color:#6b7a8d;font-style:italic">$1</span>')
    // keywords
    .replace(/\b(local|function|end|if|then|else|elseif|while|do|for|in|repeat|until|return|break|and|or|not|true|false|nil)\b/g,
      '<span style="color:#c9a84c;font-weight:600">$1</span>')
    // numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#e89f6b">$1</span>')
    // built-ins
    .replace(/\b(print|pairs|ipairs|type|tostring|tonumber|table|string|math|io|os|pcall|xpcall|error|assert|require|loadstring|load)\b/g,
      '<span style="color:#b48ead">$1</span>')
    // game services
    .replace(/\b(game|workspace|script|wait|spawn|delay|tick|time|Enum)\b/g,
      '<span style="color:#88c0d0">$1</span>')

  return <code dangerouslySetInnerHTML={{ __html: highlighted }} />
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CopyIconSmall() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
