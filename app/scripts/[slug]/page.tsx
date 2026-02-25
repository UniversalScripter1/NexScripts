import { supabase, Script } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import ScriptView from '@/components/ScriptView'

async function getScript(slug: string): Promise<Script | null> {
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data
}

async function getScriptAnalytics(scriptId: string) {
  const { data } = await supabase
    .from('analytics')
    .select('event_type, created_at')
    .eq('script_id', scriptId)
  
  const views = data?.filter(d => d.event_type === 'view').length || 0
  const copies = data?.filter(d => d.event_type === 'copy').length || 0
  return { views, copies }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const script = await getScript(params.slug)
  if (!script) return { title: 'Script Not Found' }
  return {
    title: `${script.title} — ScriptVault`,
    description: script.description || 'A script from ScriptVault.',
  }
}

export const revalidate = 0

export default async function ScriptPage({ params }: { params: { slug: string } }) {
  const script = await getScript(params.slug)
  if (!script) notFound()

  const analytics = await getScriptAnalytics(script.id)

  return <ScriptView script={script} analytics={analytics} />
}
