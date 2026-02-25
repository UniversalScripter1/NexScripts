import { supabase, Script } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

async function getScripts(): Promise<Script[]> {
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching scripts:', error)
    return []
  }
  return data || []
}

async function getStats() {
  const { data } = await supabase
    .from('analytics')
    .select('event_type')
  
  const views = data?.filter(d => d.event_type === 'view').length || 0
  const copies = data?.filter(d => d.event_type === 'copy').length || 0
  return { views, copies }
}

export const revalidate = 30

export default async function Home() {
  const scripts = await getScripts()
  const stats = await getStats()

  return (
    <div className="min-h-screen relative">
      {/* Starfield */}
      <div className="stars" />
      
      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vh] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vh] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        
        {/* Header */}
        <header className="text-center mb-12 sm:mb-20 fade-up-1 fade-up">
          <div className="ornament mb-6 text-xs tracking-[0.3em] font-heading">SCRIPTVAULT</div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black gold-text mb-4 leading-tight">
            Script Library
          </h1>
          <p className="font-body text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Curated scripts, ready to execute. Browse the collection below.
          </p>

          {/* Stats bar */}
          <div className="mt-8 inline-flex gap-6 sm:gap-10 glass rounded-2xl px-6 sm:px-10 py-3 glow-border">
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl gold-text">{scripts.length}</div>
              <div className="text-xs text-[var(--text-muted)] font-heading tracking-widest mt-0.5">SCRIPTS</div>
            </div>
            <div className="w-px bg-[var(--glass-border)]" />
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl gold-text">{stats.views.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)] font-heading tracking-widest mt-0.5">VIEWS</div>
            </div>
            <div className="w-px bg-[var(--glass-border)]" />
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl gold-text">{stats.copies.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)] font-heading tracking-widest mt-0.5">COPIES</div>
            </div>
          </div>
        </header>

        {/* Script Grid */}
        {scripts.length === 0 ? (
          <div className="text-center py-24 fade-up-2 fade-up">
            <div className="text-5xl mb-6 opacity-30">✦</div>
            <p className="font-heading text-[var(--text-muted)] text-lg tracking-widest">NO SCRIPTS YET</p>
            <p className="text-[var(--text-muted)] mt-2 text-sm">The vault awaits its first script.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {scripts.map((script, i) => (
              <ScriptCard key={script.id} script={script} index={i} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="ornament text-xs tracking-[0.3em] text-[var(--text-muted)] font-heading">
            ✦
          </div>
        </footer>
      </div>
    </div>
  )
}

function ScriptCard({ script, index }: { script: Script; index: number }) {
  const delay = (index % 6) * 0.08

  return (
    <Link href={`/scripts/${script.slug}`}>
      <div
        className="glass glow-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
        style={{ animationDelay: `${delay}s` }}
      >
        {/* Background image thumbnail */}
        {script.background_image_url ? (
          <div className="relative h-40 overflow-hidden">
            <img
              src={script.background_image_url}
              alt={script.title}
              className="w-full h-full object-cover"
              style={{ filter: 'blur(2px) brightness(0.6) saturate(1.2)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050408]" />
            {script.game_name && (
              <div className="absolute top-3 right-3">
                <span className="glass text-[10px] font-heading tracking-[0.2em] text-[var(--gold-light)] px-2 py-1 rounded-full border border-[var(--glass-border)]">
                  {script.game_name}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-24 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="font-display text-6xl text-[var(--gold)]">✦</span>
            </div>
            {script.game_name && (
              <div className="absolute top-3 right-3">
                <span className="glass text-[10px] font-heading tracking-[0.2em] text-[var(--gold-light)] px-2 py-1 rounded-full border border-[var(--glass-border)]">
                  {script.game_name}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          <h2 className="font-heading text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 leading-snug line-clamp-2">
            {script.title}
          </h2>
          {script.description && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 flex-1">
              {script.description}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-heading tracking-wider">
              {new Date(script.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-xs gold-text font-heading tracking-widest">VIEW →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
