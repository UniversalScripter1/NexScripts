import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="stars" />
      <div className="text-center relative z-10">
        <div className="font-display text-8xl gold-text mb-4 opacity-30">404</div>
        <h1 className="font-heading text-xl text-[var(--text-secondary)] mb-6 tracking-wider">SCRIPT NOT FOUND</h1>
        <Link href="/" className="btn-gold px-6 py-3 rounded-xl text-sm inline-block">
          RETURN TO VAULT
        </Link>
      </div>
    </div>
  )
}
