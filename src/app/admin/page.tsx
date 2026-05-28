'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

  // Data States
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [activities, setActivities] = useState<PlatformActivity[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [services, setServices] = useState<Service[]>([])

  // Action / UX States
  const [clientSearch, setClientSearch] = useState('')
  const [trainerFilter, setTrainerFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [inspectingClient, setInspectingClient] = useState<Client | null>(null)
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
        if (meJson.data?.user?.role !== 'admin') {
          router.push('/dashboard')
          return
        }

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
      setMetrics(mJson.data?.metrics || null)
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
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred updating price')
    } finally {
      setActionLoading(false)
    }
  }

  // Helpers
  const getSpecializationLabel = (spec: string) => {
    if (spec === 'senior_fitness') return 'Senior Fitness'
    if (spec === 'postpartum') return 'Postpartum Recovery'
    if (spec === 'corporate_wellness') return 'Corporate Wellness'
    return spec
  }

  const getSpecializationColor = (spec: string) => {
    if (spec === 'senior_fitness') return 'bg-sky-50 text-sky-700 border-sky-200'
    if (spec === 'postpartum') return 'bg-pink-50 text-pink-700 border-pink-200'
    return 'bg-purple-50 text-purple-700 border-purple-200'
  }

  const calculateBMIClass = (bmi: number) => {
    if (bmi < 18.5) return 'text-amber-600 bg-amber-50'
    if (bmi < 25) return 'text-green-600 bg-green-50'
    if (bmi < 30) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600 font-semibold">Verifying administrative access...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white p-6 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none flex flex-col justify-between overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        <div>
          <div className="mb-12 flex items-center justify-between">
            <span className="text-2xl font-bold tracking-wide text-white">PhysiFit <span className="text-blue-500">Admin</span></span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-slate-800 border border-slate-700 text-gray-400"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <p className="text-xs uppercase text-slate-400 font-bold mb-4">CONTROL PANEL</p>
          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab('metrics'); setSuccessMessage(''); setErrorMessage(''); }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                activeTab === 'metrics' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              📊 Live Metrics
            </button>
            <button
              onClick={() => { setActiveTab('clients'); setSuccessMessage(''); setErrorMessage(''); }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                activeTab === 'clients' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              👥 Manage Clients
            </button>
            <button
              onClick={() => { setActiveTab('trainers'); setSuccessMessage(''); setErrorMessage(''); }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                activeTab === 'trainers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏋️ Approve Trainers
            </button>
            <button
              onClick={() => { setActiveTab('services'); setSuccessMessage(''); setErrorMessage(''); }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                activeTab === 'services' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏷️ Services & Pricing
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/')
            }}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg font-medium transition"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 min-h-screen flex flex-col overflow-x-hidden">
        {/* Top bar for mobile menu */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between md:justify-start gap-4">
          <button
            onClick={() => setSidebarOpen(value => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            {sidebarOpen ? '←' : '☰'}
          </button>
          <span className="font-bold text-gray-800 md:hidden">PhysiFit Admin</span>
        </header>

        {/* Action Feedbacks */}
        {successMessage && (
          <div className="mx-6 md:mx-8 mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded text-left shadow-sm">
            <p className="text-green-700 font-semibold flex items-center gap-2"><span>✓</span> {successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mx-6 md:mx-8 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-left shadow-sm">
            <p className="text-red-700 font-semibold flex items-center gap-2"><span>⚠️</span> {errorMessage}</p>
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && (
            <div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-4 border-b">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">Admin Console</p>
                  <h1 className="text-3xl md:text-4xl font-extrabold mt-2 text-primary-dark">Platform Management</h1>
                  <p className="text-gray-600 mt-2 text-sm max-w-xl">
                    Real-time site metrics, database session counts, active platform revenue and activity audits.
                  </p>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-4">ACTIVE USERS</p>
                  <p className="text-4xl font-bold text-slate-800">{metrics?.active_users ?? 0}</p>
                  <p className="text-xs text-gray-500 mt-2">Active customer & trainer profiles.</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-4">NEW SIGNUPS</p>
                  <p className="text-4xl font-bold text-slate-800">{metrics?.new_signups_week ?? 0}</p>
                  <p className="text-xs text-gray-500 mt-2">Signups over the last 7 days.</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-md animate-fade-in">
                  <p className="text-xs uppercase tracking-wider text-blue-200 font-bold mb-4">MONTHLY REVENUE</p>
                  <p className="text-4xl font-bold">₦{(metrics?.monthly_revenue_naira ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-blue-100 mt-2">Naira payments confirmed in 30d.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Session Overview Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-8 pb-4 border-b">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">SESSION ARCHIVE</p>
                      <p className="text-3xl font-extrabold mt-2 text-primary-dark">{metrics?.sessions_total ?? 0}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-blue-600 text-xs font-semibold uppercase">Real time</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Upcoming Sessions</span>
                      <span className="font-bold text-gray-900">{metrics?.sessions_upcoming ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Weekly Reschedules</span>
                      <span className="font-bold text-gray-900">{metrics?.reschedules_week ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-gray-600 font-medium">Sessions Completed (30d)</span>
                      <span className="font-bold text-gray-900">{metrics?.sessions_completed_30d ?? 0}</span>
                    </div>
                  </div>
                </div>

                {/* System Shortcut Links */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-6 pb-2 border-b">MANAGEMENT QUICKLINKS</p>
                  <div className="grid gap-3">
                    <button onClick={() => setActiveTab('trainers')} className="w-full rounded-xl border border-gray-200 bg-gray-50 hover:bg-slate-100/50 p-4 text-left text-sm font-semibold text-slate-700 transition flex items-center justify-between">
                      <span>✓ Review & approve pending trainers</span>
                      <span className="text-blue-600">→</span>
                    </button>
                    <button onClick={() => setActiveTab('clients')} className="w-full rounded-xl border border-gray-200 bg-gray-50 hover:bg-slate-100/50 p-4 text-left text-sm font-semibold text-slate-700 transition flex items-center justify-between">
                      <span>✓ Assign fitness trainers to clients</span>
                      <span className="text-blue-600">→</span>
                    </button>
                    <button onClick={() => setActiveTab('services')} className="w-full rounded-xl border border-gray-200 bg-gray-50 hover:bg-slate-100/50 p-4 text-left text-sm font-semibold text-slate-700 transition flex items-center justify-between">
                      <span>✓ Manage dynamic program pricing</span>
                      <span className="text-blue-600">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">SYSTEM AUDIT FEED</p>
                    <h2 className="text-xl font-bold mt-2 text-primary-dark">Latest Platform Activity</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-emerald-600 text-xs font-bold uppercase animate-pulse">Live feed</span>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {activities.length > 0 ? (
                    activities.map((act, idx) => (
                      <div key={`${act.ref_id}-${idx}`} className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-700 flex justify-between gap-4">
                        <span className="font-semibold">{act.summary}</span>
                        <span className="text-[10px] text-gray-400 self-center font-mono">
                          {new Date(act.occurred_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">No platform activity recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE CLIENTS */}
          {activeTab === 'clients' && (
            <div>
              <div className="mb-10 pb-4 border-b">
                <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">Clients Overseer</p>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-2 text-primary-dark">Manage Platform Clients</h1>
                <p className="text-gray-600 mt-2 text-sm">
                  View patient/client records, review PAR-Q medical statements, and assign matching certified trainers.
                </p>
              </div>

              {/* Client search */}
              <div className="mb-6 max-w-md">
                <input
                  type="text"
                  placeholder="🔍 Search clients by name or email..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Clients Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
                {filteredClients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-gray-200 text-xs text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-6 py-4 text-left">Client</th>
                          <th className="px-6 py-4 text-left">Reg Date</th>
                          <th className="px-6 py-4 text-left">Assigned Trainer</th>
                          <th className="px-6 py-4 text-left">Medical Records</th>
                          <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredClients.map((client) => (
                          <tr key={client.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{client.fullName}</div>
                              <div className="text-xs text-gray-500 font-mono">{client.email}</div>
                              {client.phone && <div className="text-xs text-gray-400">{client.phone}</div>}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {new Date(client.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {client.assignedTrainerName ? (
                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs border border-green-100">
                                  🏋️ {client.assignedTrainerName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs border border-amber-100">
                                  ⚠️ Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setInspectingClient(client)}
                                className="text-blue-600 hover:text-blue-700 font-bold text-xs bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg transition"
                              >
                                🔍 Inspect Health Card
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              {assigningClientId === client.id ? (
                                <div className="flex gap-2 items-center">
                                  <select
                                    value={selectedTrainerId}
                                    onChange={(e) => setSelectedTrainerId(e.target.value)}
                                    className="border border-gray-300 rounded p-1.5 text-xs bg-white focus:outline-none"
                                  >
                                    <option value="">Select Trainer...</option>
                                    <option value="unassign">-- Clear / Unassign --</option>
                                    {approvedTrainers.map(t => (
                                      <option key={t.id} value={t.id}>{t.fullName} ({getSpecializationLabel(t.profile?.specialization || '')})</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleAssignTrainer(client.id)}
                                    disabled={actionLoading}
                                    className="bg-blue-600 text-white px-2.5 py-1.5 rounded text-xs hover:bg-blue-700 disabled:bg-blue-400 font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setAssigningClientId(null); setSelectedTrainerId(''); }}
                                    className="border border-gray-300 px-2.5 py-1.5 rounded text-xs text-gray-500 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAssigningClientId(client.id);
                                    setSelectedTrainerId(client.profile?.assignedTrainerId || '');
                                  }}
                                  className="text-slate-700 hover:text-blue-600 font-bold text-xs"
                                >
                                  🔄 Assign Trainer
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">No matching clients found in system registries.</div>
                )}
              </div>

              {/* Health Card Inspect Side Drawer/Overlay */}
              {inspectingClient && (
                <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
                  <div className="bg-white w-full max-w-md h-full p-8 shadow-2xl overflow-y-auto flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-4 border-b mb-6">
                        <h3 className="text-xl font-bold text-primary-dark">Health Card Inspection</h3>
                        <button onClick={() => setInspectingClient(null)} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs uppercase text-gray-400 font-bold mb-1">CLIENT</p>
                        <p className="text-lg font-bold text-slate-800">{inspectingClient.fullName}</p>
                        <p className="text-sm text-gray-500">{inspectingClient.email}</p>
                      </div>

                      {inspectingClient.profile ? (
                        <div className="space-y-6">
                          <div>
                            <p className="text-xs uppercase text-gray-400 font-bold mb-3">PHYSICAL STATS</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-slate-50 p-3 rounded-lg border text-center">
                                <span className="text-xs text-gray-400 block">Weight</span>
                                <span className="font-extrabold text-slate-700">{inspectingClient.profile.weightKg ?? 'N/A'} kg</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg border text-center">
                                <span className="text-xs text-gray-400 block">Height</span>
                                <span className="font-extrabold text-slate-700">{inspectingClient.profile.heightCm ?? 'N/A'} cm</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg border text-center">
                                <span className="text-xs text-gray-400 block">Dizziness</span>
                                <span className={`font-extrabold px-1.5 py-0.5 rounded text-xs ${inspectingClient.profile.dizzinessHistory ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                  {inspectingClient.profile.dizzinessHistory ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs uppercase text-gray-400 font-bold mb-2">MEDICAL NOTES / PAR-Q STATEMENT</p>
                            <div className="bg-slate-50 p-4 rounded-xl border text-sm text-slate-700 min-h-24 whitespace-pre-wrap">
                              {inspectingClient.profile.medicalNotes || 'No specific medical notes or history declared.'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500 bg-slate-50 rounded-xl border border-dashed">
                          No profile information recorded.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setInspectingClient(null)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition mt-8"
                    >
                      Close Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: APPROVE TRAINERS */}
          {activeTab === 'trainers' && (
            <div>
              <div className="mb-10 pb-4 border-b">
                <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">Trainer Operations</p>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-2 text-primary-dark">Certified Trainers Registry</h1>
                <p className="text-gray-600 mt-2 text-sm">
                  Review professional trainer profiles and approve new platform applications to expand active availability.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setTrainerFilter('all')}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition ${
                    trainerFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All Trainers ({trainers.length})
                </button>
                <button
                  onClick={() => setTrainerFilter('approved')}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition ${
                    trainerFilter === 'approved' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Approved ({trainers.filter(t => t.profile?.approvedAt !== null).length})
                </button>
                <button
                  onClick={() => setTrainerFilter('pending')}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition ${
                    trainerFilter === 'pending' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Pending Review ({trainers.filter(t => t.profile?.approvedAt === null).length})
                </button>
              </div>

              {/* Trainers Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
                {filteredTrainers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-gray-200 text-xs text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-6 py-4 text-left">Trainer</th>
                          <th className="px-6 py-4 text-left">Specialization</th>
                          <th className="px-6 py-4 text-left">Bio / Credentials</th>
                          <th className="px-6 py-4 text-left">Registration Status</th>
                          <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredTrainers.map((trainer) => (
                          <tr key={trainer.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{trainer.fullName}</div>
                              <div className="text-xs text-gray-500 font-mono">{trainer.email}</div>
                              {trainer.phone && <div className="text-xs text-gray-400">{trainer.phone}</div>}
                            </td>
                            <td className="px-6 py-4">
                              {trainer.profile ? (
                                <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-bold ${getSpecializationColor(trainer.profile.specialization)}`}>
                                  {getSpecializationLabel(trainer.profile.specialization)}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">No profile</span>
                              )}
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                              <p className="text-xs text-gray-600 line-clamp-2 italic">
                                "{trainer.profile?.bio || 'No credentials uploaded.'}"
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              {trainer.profile?.approvedAt ? (
                                <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-bold">
                                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-bold animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Pending Review
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {trainer.profile?.approvedAt ? (
                                <span className="text-gray-400 text-xs">Approved on {new Date(trainer.profile.approvedAt).toLocaleDateString()}</span>
                              ) : (
                                <button
                                  onClick={() => handleApproveTrainer(trainer.id)}
                                  disabled={actionLoading}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:bg-blue-400"
                                >
                                  Approve application
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">No trainers fit this filter selection.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SERVICES & PRICING */}
          {activeTab === 'services' && (
            <div>
              <div className="mb-10 pb-4 border-b">
                <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold">Services & Operations</p>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-2 text-primary-dark">Service Offerings & Pricing</h1>
                <p className="text-gray-600 mt-2 text-sm">
                  View and update price per session indices for the main PhysiFit offerings. The changes sync directly with user checkout calculations.
                </p>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {services.map((svc) => (
                  <div key={svc.id} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between h-80">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-bold ${getSpecializationColor(svc.slug === 'senior-fitness' ? 'senior_fitness' : svc.slug === 'postpartum-fitness' ? 'postpartum' : 'corporate_wellness')}`}>
                          {svc.name}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-6">{svc.description}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-gray-400 uppercase font-bold">Session Cost</span>
                        {editingServiceId === svc.id ? (
                          <div className="flex items-center gap-1.5 max-w-[120px]">
                            <span className="text-sm font-bold text-gray-700">₦</span>
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="border border-gray-300 rounded px-1.5 py-1 text-xs w-full focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="font-extrabold text-blue-600 text-lg">₦{svc.priceNairaPerSession.toLocaleString()}</span>
                        )}
                      </div>

                      {editingServiceId === svc.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdatePrice(svc.id)}
                            disabled={actionLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition disabled:bg-blue-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingServiceId(null); setTempPrice(''); }}
                            className="border border-gray-300 text-slate-700 font-bold py-2 px-3 rounded-lg text-xs hover:bg-gray-50 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingServiceId(svc.id);
                            setTempPrice(svc.priceNairaPerSession.toString());
                          }}
                          className="w-full border-2 border-gray-200 hover:border-gray-300 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          ✏️ Edit Session Price
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
