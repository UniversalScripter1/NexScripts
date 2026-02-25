import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createServiceClient, Script } from '@/lib/supabase'
import AdminDashboard from '@/components/AdminDashboard'

async function getAdminData() {
  const supabase = createServiceClient()
  
  const { data: scripts } = await supabase
    .from('scripts')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: analytics } = await supabase
    .from('analytics')
    .select('script_id, event_type, created_at, country')
    .order('created_at', { ascending: false })
    .limit(1000)

  return { scripts: scripts || [], analytics: analytics || [] }
}

export default async function AdminPage() {
  if (!isAdminAuthenticated()) {
    redirect('/admin/login')
  }

  const { scripts, analytics } = await getAdminData()

  return <AdminDashboard scripts={scripts} analytics={analytics} />
}
