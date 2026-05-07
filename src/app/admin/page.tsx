'use client'

import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-semibold">Admin Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">Manage the PhysiFit NG platform</h1>
            <p className="text-gray-600 mt-3 max-w-xl">
              View site metrics, manage users, monitor sessions, and control backend operations from one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              View User Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Active users</p>
            <p className="text-4xl font-bold">1,248</p>
            <p className="text-sm text-gray-600 mt-2">Users currently active on the platform.</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">New signups</p>
            <p className="text-4xl font-bold">183</p>
            <p className="text-sm text-gray-600 mt-2">New accounts in the last 7 days.</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Monthly revenue</p>
            <p className="text-4xl font-bold">₦4.2M</p>
            <p className="text-sm text-gray-600 mt-2">Estimated membership and session revenue.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">Session overview</p>
                <p className="text-3xl font-bold mt-3">72</p>
              </div>
              <div className="rounded-full bg-blue-50 px-4 py-2 text-blue-600 text-sm font-semibold">+12% this week</div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Upcoming sessions', value: '24' },
                { label: 'Pending reschedules', value: '7' },
                { label: 'Completed today', value: '18' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center border-t border-gray-100 py-4">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Quick actions</p>
            <div className="grid gap-4">
              {[
                'Approve new trainers',
                'Update service pricing',
                'Review support tickets',
                'Export booking reports',
              ].map((action) => (
                <button
                  key={action}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">Recent activity</p>
              <h2 className="text-2xl font-bold mt-2">Latest platform events</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-blue-600 text-sm font-semibold">Live</span>
          </div>
          <div className="space-y-4">
            {[
              'New user Amaka Okonkwo signed up for Senior Fitness.',
              'Corporate Wellness booking confirmed for 30 team members.',
              'Trainer Tolu sent a message to Amaka Okonkwo.',
              'Pending assessment report ready for review.',
            ].map((event) => (
              <div key={event} className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-700">
                {event}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
