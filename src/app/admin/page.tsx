'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProgressChart from '@/components/ProgressChart'
import ScrollReveal from '@/components/ScrollReveal'
import { useTheme } from '@/context/ThemeContext'
import {
  CloseIcon,
  AlertIcon,
  SunIcon,
  MoonIcon,
  ExitIcon,
  MenuIcon,
  RefreshIcon,
  TrashIcon,
  UserIcon,
  FitnessPlanIcon,
  DashboardIcon,
} from '@/components/Icons'

interface AdminMetrics {
  active_users: number;
  new_signups_week: number;
  monthly_revenue_naira: number;
  sessions_total: number;
  sessions_upcoming: number;
  sessions_completed_30d: number;
  reschedules_week: number;
}

interface PlatformActivity {
  kind: 'signup' | 'booking' | 'payment';
  ref_id: string;
  summary: string;
  occurred_at: string;
}

interface Client {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: string;
  createdAt: string;
  profile: {
    id: string;
    weightKg: number | null;
    heightCm: number | null;
      dizzinessHistory: boolean;
      preferredSpecialization?: 'senior_fitness' | 'postpartum' | 'corporate_wellness' | null;
      medicalNotes: string | null;
    assignedTrainerId: string | null;
  } | null;
  assignedTrainerName: string | null;
}

interface Trainer {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: string;
  createdAt: string;
  profile: {
    id: string;
    specialization: 'senior_fitness' | 'postpartum' | 'corporate_wellness';
    bio: string | null;
    isOnline: boolean;
    approvedAt: string | null;
    yearsOfExperience: number | null;
    cvUrl: string | null;
    certifications: string | null;
    education: string | null;
    onboardingAnswers: string | null;
  } | null;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceNairaPerSession: number;
}

type Tab = 'metrics' | 'clients' | 'trainers' | 'services';

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('metrics')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  // Theme state
  const { theme, toggleTheme } = useTheme()

  // Data States
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [activities, setActivities] = useState<PlatformActivity[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [services, setServices] = useState<Service[]>([])

  // Interactive Admin Analytics mock points for dynamic tracking
  const [revenueData, setRevenueData] = useState([
    { label: 'Wk 1', value: 150000 },
    { label: 'Wk 2', value: 350000 },
    { label: 'Wk 3', value: 500000 },
    { label: 'Wk 4', value: 650000 },
    { label: 'Wk 5', value: 950000 },
  ])
  
  const [userTrendData, setUserTrendData] = useState([
    { label: 'Wk 1', value: 12 },
    { label: 'Wk 2', value: 18 },
    { label: 'Wk 3', value: 29 },
    { label: 'Wk 4', value: 35 },
    { label: 'Wk 5', value: 52 },
  ])

  // Action / UX States
  const [clientSearch, setClientSearch] = useState('')
  const [trainerFilter, setTrainerFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [inspectingClient, setInspectingClient] = useState<Client | null>(null)
  const [inspectingTrainer, setInspectingTrainer] = useState<Trainer | null>(null)
  const [assigningClientId, setAssigningClientId] = useState<string | null>(null)
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('')
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<string>('')
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // Core administrative verification + mount data loading
  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true)
        const meRes = await fetch('/api/users/me')
        if (!meRes.ok) {
          router.push('/login')
          return
        }
        const meJson = await meRes.json()
        const role = meJson.data?.user?.role
        // allow both admin and super_admin to access this console
        if (role !== 'admin' && role !== 'super_admin') {
          router.push('/dashboard')
          return
        }
        setCurrentUserRole(role)

        // Fetch Metrics & Activities on mount
        await fetchMetricsAndActivity()
        // Fetch all other datasets so switching tabs is instant and responsive
        await fetchClients()
        await fetchTrainers()
        await fetchServices()
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [router])

  // Data fetchers
  async function fetchMetricsAndActivity() {
    const [metricsRes, actRes] = await Promise.all([
      fetch('/api/admin/metrics'),
      fetch('/api/admin/activity')
    ])
    if (metricsRes.ok) {
      const mJson = await metricsRes.json()
      const serverMetrics = mJson.data?.metrics || null
      setMetrics(serverMetrics)
      
      // Sync the final week point of charts with active DB metrics responsive calculations!
      if (serverMetrics) {
        setRevenueData(prev => {
          const updated = [...prev]
          if (updated.length > 0) {
            updated[updated.length - 1].value = serverMetrics.monthly_revenue_naira || 950000
          }
          return updated
        })
        setUserTrendData(prev => {
          const updated = [...prev]
          if (updated.length > 0) {
            updated[updated.length - 1].value = serverMetrics.active_users || 52
          }
          return updated
        })
      }
    }
    if (actRes.ok) {
      const aJson = await actRes.json()
      setActivities(aJson.data?.activity || [])
    }
  }

  async function fetchClients() {
    const res = await fetch('/api/admin/clients')
    if (res.ok) {
      const json = await res.json()
      setClients(json.data?.clients || [])
    }
  }

  async function fetchTrainers() {
    const res = await fetch('/api/admin/trainers')
    if (res.ok) {
      const json = await res.json()
      setTrainers(json.data?.trainers || [])
    }
  }

  async function fetchServices() {
    const res = await fetch('/api/services')
    if (res.ok) {
      const json = await res.json()
      setServices(json.data?.services || [])
    }
  }

  // Action Handlers
  const handleAssignTrainer = async (clientId: string) => {
    if (!selectedTrainerId) return
    setErrorMessage('')
    setSuccessMessage('')
    setActionLoading(true)
    try {
      const trainerId = selectedTrainerId === 'unassign' ? null : selectedTrainerId
      const res = await fetch('/api/admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, assignedTrainerId: trainerId })
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Assignment failed')
      }
      setSuccessMessage('Trainer assigned successfully!')
      setAssigningClientId(null)
      setSelectedTrainerId('')
      await fetchClients()
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during trainer assignment')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveTrainer = async (trainerId: string) => {
    setErrorMessage('')
    setSuccessMessage('')
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/trainers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerId })
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Approval failed')
      }
      setSuccessMessage('Trainer application approved successfully!')
      await fetchTrainers()
      await fetchMetricsAndActivity()
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during trainer approval')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdatePrice = async (serviceId: string) => {
    const numericPrice = parseInt(tempPrice)
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage('Price must be a valid positive integer')
      return
    }
    setErrorMessage('')
    setSuccessMessage('')
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, priceNairaPerSession: numericPrice })
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to update price')
      }
      setSuccessMessage('Service pricing updated successfully!')
      setEditingServiceId(null)
      setTempPrice('')
      await fetchServices()
      await fetchMetricsAndActivity()
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred updating price')
    } finally {
      setActionLoading(false)
    }
  }

  // Theme Toggle
  const handleToggleTheme = toggleTheme

  // Helpers
  const getSpecializationLabel = (spec: string) => {
    if (spec === 'senior_fitness') return 'Senior Fitness'
    if (spec === 'postpartum') return 'Postpartum Fitness'
    if (spec === 'corporate_wellness') return 'Corporate Wellness'
    return spec
  }

  const getSpecializationColor = (spec: string) => {
    if (spec === 'senior_fitness') return 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    if (spec === 'postpartum') return 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }

  // Filter lists
  const filteredClients = clients.filter(c => 
    c.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const approvedTrainers = trainers.filter(t => t.profile?.approvedAt !== null && t.status === 'active')

  const filteredTrainers = trainers.filter(t => {
    if (trainerFilter === 'approved') return t.profile?.approvedAt !== null
    if (trainerFilter === 'pending') return t.profile?.approvedAt === null
    return true
  })

  const isDark = theme === 'dark'

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`h-20 border-b flex items-center px-8 ${isDark ? 'bg-[#0b0f19] border-white/5' : 'bg-white border-slate-200'}`}>
          <span className={`text-xl font-display uppercase tracking-widest font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>PhysiFit Admin</span>
        </div>
        <div className={`flex-1 flex flex-col items-center justify-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <div className="animate-spin inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full mb-6"></div>
          <p className="font-display uppercase tracking-widest text-accent text-sm animate-pulse">Verifying Administrative Access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-[#0e1322] to-[#1a2336] text-white'
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900'
    }`} style={{ backgroundColor: isDark ? 'rgba(2, 6, 23, 1)' : 'rgba(248, 250, 252, 1)' }}>
      {/* Admin header */}
      <header className={`border-b h-20 px-8 flex items-center justify-between z-30 ${isDark ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <span className={`text-xl font-display uppercase tracking-widest font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            PhysiFit <span className="text-accent font-extrabold">Admin</span>
          </span>
          <span className="text-[10px] bg-accent/20 border border-accent/30 text-accent font-mono uppercase px-2.5 py-1 rounded-full font-bold">
            System Console
          </span>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Mobile Sidebar backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 w-72 backdrop-blur-xl border-r p-8 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto ${
            isDark
              ? 'bg-slate-950/95 border-white/5 text-white'
              : 'bg-white/95 border-slate-200 text-slate-800'
          } ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          style={{ backgroundColor: isDark ? 'rgba(2, 6, 23, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}
        >
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display uppercase tracking-widest text-gray-400 font-bold">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`md:hidden w-8 h-8 rounded-full border flex items-center justify-center transition ${isDark ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-100'}`}
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'metrics', label: 'Platform Metrics' },
                { id: 'clients', label: 'Matched Clients' },
                { id: 'trainers', label: 'Trainer Registry' },
                { id: 'services', label: 'Pricing Offers' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    setSuccessMessage('')
                    setErrorMessage('')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-5 py-3.5 rounded-xl font-display font-semibold uppercase tracking-wider text-xs transition-all duration-300 border flex items-center gap-2.5 ${
                    activeTab === tab.id
                      ? 'bg-accent text-slate-950 border-accent shadow-lg shadow-accent/20 scale-[1.02]'
                      : isDark
                        ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 border-slate-200/60'
                  }`}
                >
                  {tab.id === 'metrics' && <DashboardIcon size={16} />}
                  {tab.id === 'clients' && <UserIcon size={16} />}
                  {tab.id === 'trainers' && <FitnessPlanIcon size={16} />}
                  {tab.id === 'services' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Appearance Toggle */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest font-mono">Appearance</p>
              <button
                onClick={handleToggleTheme}
                className={`w-full text-left px-5 py-3.5 rounded-xl font-display font-semibold uppercase tracking-wider text-xs transition-all duration-300 border flex items-center justify-between ${
                  isDark
                    ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 border-slate-200/60'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </span>
                <span className="text-[9px] opacity-60 font-mono">Theme</span>
              </button>
            </div>
          </div>

          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/')
            }}
            className="w-full text-left px-5 py-3 rounded-xl text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-xs font-bold font-display uppercase tracking-widest transition flex items-center justify-center gap-2"
          >
            <ExitIcon size={16} />
            <span>Exit Console</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-h-screen flex flex-col p-6 sm:p-12 overflow-x-hidden">
          {/* Mobile Sidebar Trigger */}
          <div className="flex md:hidden items-center justify-between mb-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`w-12 h-12 border rounded-2xl flex items-center justify-center font-bold text-xl transition ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
              aria-label="Open sidebar"
            >
              <MenuIcon size={20} />
            </button>
            <span className="font-display uppercase tracking-widest text-accent text-xs font-bold font-mono">System Supervisor</span>
          </div>

          {/* User notifications feed */}
          {successMessage && (
            <div className="mb-8 bg-green-500/15 border-l-4 border-green-500 rounded-2xl p-4 text-left border border-green-500/20">
              <p className="text-green-300 font-semibold flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-300 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{successMessage}</span>
              </p>
            </div>
          )}
          {errorMessage && (
            <div className="mb-8 bg-red-500/15 border-l-4 border-red-500 rounded-2xl p-4 text-left border border-red-500/20">
              <p className="text-red-300 font-semibold flex items-center gap-2 text-sm">
                <AlertIcon size={16} className="text-red-300 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </p>
            </div>
          )}

          {activeTab === 'metrics' && (
            <ScrollReveal className="space-y-12">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Live Platform Metrics</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Platform Performance Cockpit</h1>
                <p className={`mt-2 text-sm max-w-xl ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Real-time database indices, payment configurations, certified trainer approvals, and monthly registration records.
                </p>
              </div>

              {/* Metrics cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'ACTIVE REGISTERED MEMBERS', val: metrics?.active_users ?? 0, sub: 'Active wellness accounts' },
                  { label: 'NEW SIGNUPS THIS WEEK', val: metrics?.new_signups_week ?? 0, sub: 'Over the last 7 calendar days' },
                  { label: 'CONFIRMED MONTHLY REVENUE', val: `₦${(metrics?.monthly_revenue_naira ?? 0).toLocaleString()}`, sub: 'Live checkout payments (30d)', highlighted: true }
                ].map((card, i) => (
                  <div key={i} className={`rounded-3xl p-6 shadow-xl relative overflow-hidden transition hover:scale-[1.02] duration-300 ${
                    card.highlighted
                      ? isDark ? 'bg-accent/15 border border-accent/30 text-white' : 'bg-accent/20 border border-accent/30 text-slate-800 shadow-sm'
                      : isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm shadow-slate-100'
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">{card.label}</span>
                    <p className={`text-4xl font-extrabold font-display tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{card.val}</p>
                    <p className="text-xs text-accent font-semibold">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Analytics curves SVG progress charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProgressChart
                  data={revenueData}
                  title="Monthly Revenue Timeline"
                  unit=" ₦"
                  color="#d4a500"
                  dark={isDark}
                />
                <ProgressChart
                  data={userTrendData}
                  title="Weekly Platform Growth"
                  unit=" members"
                  color="#38bdf8"
                  dark={isDark}
                />
              </div>

              {/* Secondary operations metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Session details */}
                <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm shadow-slate-100'}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  <h3 className="text-lg font-bold font-display uppercase tracking-wider mb-6 pb-2 border-b border-white/5">Session Overview Metrics</h3>
                  <div className="space-y-4 text-sm">
                    {[
                      { label: 'Total Database Sessions Logged', val: metrics?.sessions_total ?? 0 },
                      { label: 'Upcoming Client Training Slots', val: metrics?.sessions_upcoming ?? 0 },
                      { label: 'Verified Weekly Adjustments', val: metrics?.reschedules_week ?? 0 },
                      { label: 'Completed verified spots (30d)', val: metrics?.sessions_completed_30d ?? 0 }
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between py-2.5 border-b border-white/5 last:border-b-0 ${isDark ? 'border-white/5 text-gray-300' : 'border-slate-100 text-slate-600'}`}>
                        <span>{row.label}</span>
                        <span className="font-bold font-mono">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform actions shortcut index */}
                <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-sm shadow-slate-100'}`}>
                  <h3 className="text-lg font-bold font-display uppercase tracking-wider mb-6 pb-2 border-b border-white/5">Platform Shortcuts</h3>
                  <div className="grid gap-3">
                    {[
                      { tab: 'trainers', label: 'Review Pending Instructor Files', icon: <FitnessPlanIcon size={16} />, sub: `${trainers.filter(t => t.profile?.approvedAt === null).length} reviews awaiting` },
                      { tab: 'clients', label: 'Matched Client Placements', icon: <UserIcon size={16} />, sub: `${clients.filter(c => !c.assignedTrainerName).length} unassigned patients` },
                      { tab: 'services', label: 'Price Session Packages', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, sub: 'Syncing naira checkout parameters' }
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTab(btn.tab as any)}
                        className={`w-full text-left border rounded-2xl p-4 transition-all duration-300 flex items-center justify-between ${isDark ? 'bg-[#0c101c]/60 hover:bg-white/5 border-white/5 hover:border-white/10' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                      >
                        <div>
                          <p className="font-bold text-xs uppercase tracking-wider font-display flex items-center gap-2">{btn.icon} <span>{btn.label}</span></p>
                          <span className="text-[10px] text-accent mt-0.5 block font-semibold">{btn.sub}</span>
                        </div>
                        <span className="text-accent text-lg">&rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity audit registry feed */}
              <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-sm shadow-slate-100'}`}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold font-display uppercase tracking-wider">System Activity Audit Log</h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Audit log of system events across registration, booking and payments.</p>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Live
                  </span>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {activities.length > 0 ? (
                    activities.map((act, i) => (
                      <div key={i} className={`border px-5 py-4 rounded-2xl flex justify-between gap-4 text-xs ${isDark ? 'bg-[#0b0e18]/60 border-white/5 text-gray-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                        <span className="font-bold">{act.summary}</span>
                        <span className="text-[10px] text-gray-500 self-center font-mono font-bold tracking-widest uppercase">
                          {new Date(act.occurred_at).toLocaleTimeString('en-NG')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">No recent platform activities stored.</div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          )}

          {activeTab === 'clients' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Clients Placement</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Manage Platform Clients</h1>
              </div>

              {/* Search bar */}
              <div className="max-w-md relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="Search clients by name or email..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className={`w-full border rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent ${isDark ? 'border-white/10 bg-[#0b0e18]/50 text-white' : 'border-slate-200 bg-white text-slate-800'}`}
                />
              </div>

              {/* Clients Table Card */}
              <div className={`border rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-slate-100'}`}>
                {filteredClients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className={`font-display text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 border-b border-white/5 text-gray-400' : 'bg-slate-50 border-b border-slate-100 text-slate-500'}`}>
                        <tr>
                          <th className="px-6 py-4 min-w-[200px]">Client Member</th>
                          <th className="px-6 py-4 min-w-[150px]">Placement Date</th>
                          <th className="px-6 py-4 min-w-[220px]">Assigned Recovery Specialist</th>
                          <th className="px-6 py-4 min-w-[150px]">Clinical Card</th>
                          <th className="px-6 py-4 text-right min-w-[180px]">Placements Controls</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-sm ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {filteredClients.map((client) => (
                          <tr key={client.id} className={`transition ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <td className="px-6 py-4">
                              <div className="font-bold">{client.fullName}</div>
                              <span className="text-[14px] text-gray-400 font-mono block">{client.email}</span>
                              {client.phone && (
                                <span className="text-[14px] text-gray-500 font-mono block mt-1">{client.phone}</span>
                              )}
                              {client.profile?.preferredSpecialization && (
                                <span className="inline-block mt-2 text-[14px] font-bold uppercase rounded-full px-2 py-0.5 bg-purple-50 text-purple-600">
                                  {getSpecializationLabel(client.profile.preferredSpecialization)}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {new Date(client.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {client.assignedTrainerName ? (
                                <span className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                                  <FitnessPlanIcon size={12} className="text-green-300" />
                                  <span>{client.assignedTrainerName}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-accent/20 text-accent px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                                  <AlertIcon size={12} className="text-accent" />
                                  <span>Unassigned</span>
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setInspectingClient(client)}
                                className={`font-bold text-xs uppercase tracking-widest border px-4 py-2 rounded-xl transition ${isDark ? 'border-white/10 hover:border-accent/40 bg-white/5 text-white' : 'border-slate-300 hover:border-accent/40 bg-white text-slate-750'}`}
                              >
                                <span className="flex items-center gap-1.5 justify-center">
                                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                  <span>Inspect Health</span>
                                </span>
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {assigningClientId === client.id ? (
                                <div className="flex gap-2 items-center justify-end">
                                  <select
                                    value={selectedTrainerId}
                                    onChange={(e) => setSelectedTrainerId(e.target.value)}
                                    className={`border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent ${isDark ? 'border-white/10 bg-[#0b0e18] text-white' : 'border-slate-200 bg-white text-slate-800'}`}
                                  >
                                    <option value="">Select Specialist...</option>
                                    <option value="unassign">-- Clear placement --</option>
                                    {approvedTrainers.map(t => (
                                      <option key={t.id} value={t.id}>{t.fullName} ({getSpecializationLabel(t.profile?.specialization || '')})</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleAssignTrainer(client.id)}
                                    disabled={actionLoading}
                                    className="bg-accent text-slate-950 px-4 py-2 rounded-xl text-xs hover:bg-accent-dark font-bold uppercase tracking-wider"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setAssigningClientId(null); setSelectedTrainerId(''); }}
                                    className={`border px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${isDark ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'}`}
                                  >
                                    <CloseIcon size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAssigningClientId(client.id);
                                    setSelectedTrainerId(client.profile?.assignedTrainerId || '');
                                  }}
                                  className="text-accent hover:text-accent-light font-bold text-xs uppercase tracking-widest"
                                >
                                  <span className="flex items-center gap-1.5 justify-center">
                                    <RefreshIcon size={12} className="text-accent" />
                                    <span>Assign Specialist</span>
                                  </span>
                                </button>
                              )}
                              &nbsp;
                              {client.status === 'archived' ? (
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Recover client ${client.fullName}? This will restore account access.`)) return
                                    try {
                                      const res = await fetch('/api/admin/clients/recover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: client.id }) })
                                      if (!res.ok) {
                                        const j = await res.json().catch(() => ({}))
                                        throw new Error(j.error?.message || 'Recover failed')
                                      }
                                      await fetchClients()
                                      setSuccessMessage('Client recovered')
                                    } catch (err: any) {
                                      setErrorMessage(err.message || 'Error recovering client')
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-800 font-bold text-xs uppercase tracking-widest ml-3"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <RefreshIcon size={12} />
                                    <span>Recover</span>
                                  </span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Archive client ${client.fullName}? This will disable the account but data can be recovered.`)) return
                                      try {
                                        const res = await fetch('/api/admin/clients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: client.id }) })
                                        if (!res.ok) {
                                          const j = await res.json().catch(() => ({}))
                                          throw new Error(j.error?.message || 'Archive failed')
                                        }
                                        await fetchClients()
                                        setSuccessMessage('Client archived')
                                      } catch (err: any) {
                                        setErrorMessage(err.message || 'Error archiving client')
                                      }
                                    }}
                                    className="text-amber-600 hover:text-amber-800 font-bold text-xs uppercase tracking-widest ml-3"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                                      <span>Archive</span>
                                    </span>
                                  </button>
                                  {currentUserRole === 'super_admin' && (
                                    <button
                                      onClick={async () => {
                                        if (!confirm(`Fully delete client ${client.fullName}? This cannot be undone.`)) return
                                        try {
                                          const res = await fetch('/api/admin/clients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: client.id, force: true }) })
                                          if (!res.ok) {
                                            const j = await res.json().catch(() => ({}))
                                            throw new Error(j.error?.message || 'Full delete failed')
                                          }
                                          await fetchClients()
                                          setSuccessMessage('Client fully deleted')
                                        } catch (err: any) {
                                          setErrorMessage(err.message || 'Error deleting client')
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-widest ml-3"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <TrashIcon size={12} />
                                        <span>Full Delete</span>
                                      </span>
                                    </button>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">No matched client profiles found.</div>
                )}
              </div>

              {/* Side Drawer Inspection Panel */}
              {inspectingClient && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
                  <div className={`w-full max-w-md h-full p-8 shadow-2xl border-l overflow-y-auto flex flex-col justify-between ${isDark ? 'bg-slate-950 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <div>
                      <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-8">
                        <h3 className="text-xl font-bold font-display uppercase tracking-wider">Screener Inspection</h3>
                        <button onClick={() => setInspectingClient(null)} className="text-gray-400 hover:text-red-500 transition" aria-label="Close details">
                          <CloseIcon size={20} />
                        </button>
                      </div>

                      <div className="mb-8">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">CLIENT PROFILE</span>
                        <p className="text-xl font-bold font-display uppercase tracking-wider">{inspectingClient.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{inspectingClient.email}</p>
                      </div>

                      {inspectingClient.profile ? (
                        <div className="space-y-8 text-left">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-3">PHYSICAL STATS</span>
                            <div className="grid grid-cols-3 gap-3">
                              <div className={`border p-3 rounded-2xl text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] text-gray-400 block mb-0.5">Weight</span>
                                <span className="font-extrabold">{inspectingClient.profile.weightKg ?? 'N/A'} kg</span>
                              </div>
                              <div className={`border p-3 rounded-2xl text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] text-gray-400 block mb-0.5">Height</span>
                                <span className="font-extrabold">{inspectingClient.profile.heightCm ?? 'N/A'} cm</span>
                              </div>
                              <div className={`border p-3 rounded-2xl text-center flex flex-col items-center justify-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] text-gray-400 block mb-0.5">Dizziness</span>
                                <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] uppercase font-display ${inspectingClient.profile.dizzinessHistory ? 'bg-red-500/25 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                  {inspectingClient.profile.dizzinessHistory ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 font-display">PAR-Q Screener Declarations:</span>
                            <div className={`border p-5 rounded-2xl text-xs min-h-24 whitespace-pre-wrap leading-relaxed ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                              {inspectingClient.profile.medicalNotes || 'No specific restrictions declared.'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10 text-sm">
                          No profile information recorded.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setInspectingClient(null)}
                      className="w-full bg-accent text-slate-950 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 font-display shadow-lg shadow-accent/10 mt-8"
                    >
                      Close Health Card
                    </button>
                  </div>
                </div>
              )}
            </ScrollReveal>
          )}

          {activeTab === 'trainers' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Registry validation</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Instructor Approvals Desk</h1>
              </div>

              {/* Filter tags */}
              <div className="flex gap-2">
                {[
                  { id: 'all', label: `All Instructors (${trainers.length})` },
                  { id: 'approved', label: `Approved Matched (${trainers.filter(t => t.profile?.approvedAt !== null).length})` },
                  { id: 'pending', label: `Pending Validation (${trainers.filter(t => t.profile?.approvedAt === null).length})` }
                ].map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setTrainerFilter(tag.id as any)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border transition duration-300 ${
                      trainerFilter === tag.id
                        ? 'bg-accent text-slate-950 border-accent shadow-md shadow-accent/5'
                        : isDark ? 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Trainers Table Card */}
              <div className={`border rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-slate-100'}`}>
                {filteredTrainers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className={`font-display text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 border-b border-white/5 text-gray-400' : 'bg-slate-50 border-b border-slate-100 text-slate-500'}`}>
                        <tr>
                          <th className="px-6 py-4 min-w-[200px]">Specialist Member</th>
                          <th className="px-6 py-4 min-w-[150px]">Specialization</th>
                          <th className="px-6 py-4 min-w-[200px]">Application File</th>
                          <th className="px-6 py-4 min-w-[150px]">Validation Status</th>
                          <th className="px-6 py-4 text-right min-w-[180px]">Administrative Action</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-sm ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {filteredTrainers.map((trainer) => (
                          <tr key={trainer.id} className={`transition ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <td className="px-6 py-4">
                              <div className="font-bold">{trainer.fullName}</div>
                              <span className="text-[10px] text-gray-400 font-mono block">{trainer.email}</span>
                            </td>
                            <td className="px-6 py-4">
                              {trainer.profile ? (
                                <span className={`inline-block whitespace-nowrap border px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getSpecializationColor(trainer.profile.specialization)}`}>
                                  {getSpecializationLabel(trainer.profile.specialization)}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">No profile registered</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setInspectingTrainer(trainer)}
                                className={`font-bold text-xs uppercase tracking-widest border px-4 py-2 rounded-xl transition ${isDark ? 'border-white/10 hover:border-accent/40 bg-white/5 text-white' : 'border-slate-300 hover:border-accent/40 bg-white text-slate-755'}`}
                              >
                                <span className="flex items-center gap-1.5 justify-center">
                                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                  <span>Review File</span>
                                </span>
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              {trainer.profile?.approvedAt ? (
                                <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-bold">
                                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span> Pending review
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {trainer.profile?.approvedAt ? (
                                  <span className="text-gray-400 text-xs">Approved on {new Date(trainer.profile.approvedAt).toLocaleDateString()}</span>
                                ) : (
                                  <button
                                    onClick={() => handleApproveTrainer(trainer.id)}
                                    disabled={actionLoading}
                                    className="bg-accent hover:bg-accent-dark text-slate-950 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition disabled:opacity-40"
                                  >
                                    Approve Instructor
                                  </button>
                                )}
                                {currentUserRole === 'super_admin' && (
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Fully delete trainer ${trainer.fullName}? This will remove all associated profiles and fitness plans, and cannot be undone.`)) return
                                      setErrorMessage('')
                                      setSuccessMessage('')
                                      setActionLoading(true)
                                      try {
                                        const res = await fetch('/api/admin/trainers', {
                                          method: 'DELETE',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ trainerId: trainer.id })
                                        })
                                        const json = await res.json()
                                        if (!res.ok) {
                                          throw new Error(json.error?.message || json.message || 'Delete failed')
                                        }
                                        setSuccessMessage('Trainer deleted successfully!')
                                        await fetchTrainers()
                                      } catch (err: any) {
                                        setErrorMessage(err.message || 'Error deleting trainer')
                                      } finally {
                                        setActionLoading(false)
                                      }
                                    }}
                                    disabled={actionLoading}
                                    className="text-red-500 hover:text-red-750 font-bold text-xs uppercase tracking-widest"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <TrashIcon size={12} />
                                      <span>Delete</span>
                                    </span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">No matched instructors files found.</div>
                )}
              </div>
              {/* Side Drawer Trainer Inspection Panel */}
              {inspectingTrainer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
                  <div className={`w-full max-w-md h-full p-8 shadow-2xl border-l overflow-y-auto flex flex-col justify-between ${isDark ? 'bg-slate-950 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <div>
                      <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-8">
                        <h3 className="text-xl font-bold font-display uppercase tracking-wider">Trainer Application Review</h3>
                        <button onClick={() => setInspectingTrainer(null)} className="text-gray-400 hover:text-red-500 transition" aria-label="Close details">
                          <CloseIcon size={20} />
                        </button>
                      </div>

                      <div className="mb-8">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">TRAINER APPLICANT</span>
                        <p className="text-xl font-bold font-display uppercase tracking-wider">{inspectingTrainer.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{inspectingTrainer.email}</p>
                        {inspectingTrainer.phone && (
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">{inspectingTrainer.phone}</p>
                        )}
                      </div>

                      {inspectingTrainer.profile ? (
                        <div className="space-y-6 text-left">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-3">PROFESSIONAL STATS</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div className={`border p-3 rounded-2xl text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] text-gray-400 block mb-0.5">Experience</span>
                                <span className="font-extrabold text-base">{inspectingTrainer.profile.yearsOfExperience ?? '0'} years</span>
                              </div>
                              <div className={`border p-3 rounded-2xl text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-[10px] text-gray-400 block mb-0.5">Specialization</span>
                                <span className="font-extrabold text-xs uppercase block truncate">{getSpecializationLabel(inspectingTrainer.profile.specialization)}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 font-display">Education:</span>
                            <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                              {inspectingTrainer.profile.education || 'Not specified'}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 font-display">Certifications:</span>
                            <div className={`border p-3 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                              {inspectingTrainer.profile.certifications || 'None declared'}
                            </div>
                          </div>

                          {/* Onboarding Answers */}
                          {(() => {
                            let q1 = 'No response';
                            let q2 = 'No response';
                            if (inspectingTrainer.profile.onboardingAnswers) {
                              try {
                                const parsed = JSON.parse(inspectingTrainer.profile.onboardingAnswers);
                                if (parsed.q1) q1 = parsed.q1;
                                if (parsed.q2) q2 = parsed.q2;
                              } catch (e) {
                                // fallback if not JSON
                              }
                            }
                            return (
                              <div className="space-y-4">
                                <div>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 font-display">
                                    Rehabilitation & Senior Wellness Experience:
                                  </span>
                                  <div className={`border p-3 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                    {q1}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1 font-display">
                                    Motivation to Join Network:
                                  </span>
                                  <div className={`border p-3 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                    {q2}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* CV File Link */}
                          {inspectingTrainer.profile.cvUrl && (
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 font-display">Uploaded CV:</span>
                              <a
                                href={inspectingTrainer.profile.cvUrl}
                                download={`CV_${inspectingTrainer.fullName.replace(/\s+/g, '_')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#1e293b] hover:bg-[#334155] border border-white/10 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 font-display flex items-center justify-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download / View CV File
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10 text-sm">
                          No profile details recorded.
                        </div>
                      )}
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-3">
                      {!inspectingTrainer.profile?.approvedAt && (
                        <button
                          onClick={async () => {
                            await handleApproveTrainer(inspectingTrainer.id);
                            setInspectingTrainer(null);
                          }}
                          className="w-full bg-accent text-slate-950 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 font-display shadow-lg shadow-accent/10 block text-center"
                        >
                          Approve Instructor Application
                        </button>
                      )}
                      <button
                        onClick={() => setInspectingTrainer(null)}
                        className={`w-full border py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 font-display text-center block ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                      >
                        Close Application
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </ScrollReveal>
          )}

          {activeTab === 'services' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Services offers</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Offerings & Pricing Index</h1>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  View and update Naira session cost indicators. Pricing adjustments update checkout calculations dynamically.
                </p>
              </div>

              {/* Services cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <div key={svc.id} className={`border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden transition hover:scale-[1.01] duration-300 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm shadow-slate-100'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`inline-block border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSpecializationColor(svc.slug === 'senior-fitness' ? 'senior_fitness' : svc.slug === 'postpartum-fitness' ? 'postpartum' : 'corporate_wellness')}`}>
                          {svc.name}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>{svc.description}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-display font-bold">Price Index Per Spot</span>
                        {editingServiceId === svc.id ? (
                          <div className="flex items-center gap-1.5 max-w-[140px]">
                            <span className="text-xs font-bold text-accent">₦</span>
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className={`border rounded-xl px-2.5 py-1.5 text-xs w-full focus:outline-none ${isDark ? 'border-white/10 focus:border-accent bg-[#0c101c] text-white' : 'border-slate-200 focus:border-accent bg-white text-slate-800'}`}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="font-extrabold text-accent text-lg font-display tracking-tight">₦{svc.priceNairaPerSession.toLocaleString()}</span>
                        )}
                      </div>

                      {editingServiceId === svc.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePrice(svc.id)}
                            disabled={actionLoading}
                            className="flex-1 bg-accent hover:bg-accent-dark text-slate-950 font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-40 uppercase tracking-widest font-display shadow-md shadow-accent/10"
                          >
                            Save Price
                          </button>
                          <button
                            onClick={() => { setEditingServiceId(null); setTempPrice(''); }}
                            className={`border font-bold py-2.5 px-4 rounded-xl text-xs transition uppercase tracking-widest font-display ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-slate-350 text-slate-700 hover:bg-slate-50'}`}
                          >
                            <CloseIcon size={12} className="mx-auto" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingServiceId(svc.id);
                            setTempPrice(svc.priceNairaPerSession.toString());
                          }}
                          className={`w-full border hover:border-accent/40 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 uppercase tracking-widest font-display bg-white/5 ${isDark ? 'border-white/10 text-gray-300 hover:text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                        >
                          <span className="flex items-center gap-1.5 justify-center">
                            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            <span>Edit Offer Price</span>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          )}
        </main>
      </div>
    </div>
  )
}
