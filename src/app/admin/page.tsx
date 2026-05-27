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

export default function AdminDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [activities, setActivities] = useState<PlatformActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  useEffect(() => {
    async function loadAdminData() {
      try {
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

        // Fetch Metrics
        const metricsRes = await fetch('/api/admin/metrics')
        if (metricsRes.ok) {
          const mJson = await metricsRes.json()
          setMetrics(mJson.data?.metrics)
        }

        // Fetch Activity
        const actRes = await fetch('/api/admin/activity')
        if (actRes.ok) {
          const aJson = await actRes.json()
          setActivities(aJson.data?.activity || [])
        }
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [router])

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
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white min-h-screen p-6 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none flex flex-col justify-between ${
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
              className="w-full text-left px-4 py-3 rounded-lg transition bg-blue-600 text-white font-medium shadow-sm"
            >
              📊 Live Metrics
            </button>
            <Link
              href="/dashboard"
              className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 font-medium transition"
            >
              👤 Client Portal
            </Link>
            <Link
              href="/trainer-portal"
              className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 font-medium transition"
            >
              🏋️ Trainer Portal
            </Link>
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

        {/* Content area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
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

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-6 pb-2 border-b">QUICK ACTIONS</p>
              <div className="grid gap-3">
                <button className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100/50 transition">
                  ✓ Approve new trainers
                </button>
                <button className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100/50 transition">
                  ✓ Update service pricing
                </button>
                <button className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100/50 transition">
                  ✓ Review support tickets
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
                    <span>{act.summary}</span>
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
        </main>
      </div>
    </div>
  )
}
