'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { AlertIcon, TrashIcon, ChatIcon } from '@/components/Icons'

export default function TrainerSettingsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  
  // Support Form State
  const [supportName, setSupportName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [supportMsg, setSupportMsg] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportSuccess, setSupportSuccess] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const json = await res.json()
          setUser(json.data?.user || null)
          if (json.data?.user) {
            setSupportName(json.data.user.fullName || '')
            setSupportEmail(json.data.user.email || '')
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadUser()
  }, [])

  const handleDelete = async () => {
    if (!confirm('Delete your account? This action is irreversible.')) return
    setLoading(true)
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete account')
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMsg.trim()) return
    setSupportSubmitting(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supportName.trim(),
          email: supportEmail.trim(),
          message: supportMsg.trim(),
        }),
      })
      if (!res.ok) throw new Error('Failed to send support ticket')
      setSupportSuccess(true)
      setSupportMsg('')
    } catch (err) {
      console.error(err)
    } finally {
      setSupportSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0a0f1d] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/trainer-portal" className="text-accent hover:underline font-bold uppercase tracking-wider text-xs">
            ← Back to Trainer Portal
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-display uppercase tracking-wider font-extrabold mb-2">Trainer Settings</h1>
          <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>Manage your trainer profile settings, view credentials, or contact administrative support.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings Left Column / Info */}
          <div className="md:col-span-2 space-y-8">
            {/* User Info Details card */}
            <div className={`border rounded-3xl p-8 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h2 className="text-lg font-bold font-display uppercase tracking-wider mb-6 pb-2 border-b border-white/5">Trainer Profile Details</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Full Name</span>
                  <span className="font-semibold">{user?.fullName || 'Loading...'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Email Address</span>
                  <span className="font-semibold font-mono">{user?.email || 'Loading...'}</span>
                </div>
                <div className="flex justify-between py-2.5 last:border-b-0">
                  <span className="text-gray-400">Account Role</span>
                  <span className="font-semibold capitalize text-accent">{user?.role || 'Loading...'}</span>
                </div>
              </div>
            </div>

            {/* Contact Support Container */}
            <div className={`border rounded-3xl p-8 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/5">
                <ChatIcon size={20} className="text-accent" />
                <h2 className="text-lg font-bold font-display uppercase tracking-wider">Contact administrative Support</h2>
              </div>

              {supportSuccess ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                  <p className="text-green-400 font-bold text-sm mb-2">Support Message Sent!</p>
                  <p className="text-xs text-gray-400 mb-4">Our support supervisors will evaluate your ticket request and email you soon.</p>
                  <button
                    onClick={() => setSupportSuccess(false)}
                    className="text-xs font-bold uppercase tracking-wider text-accent hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={supportName}
                        onChange={(e) => setSupportName(e.target.value)}
                        required
                        className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent ${
                          isDark ? 'border-white/10 bg-[#0a0f1d] text-white' : 'border-slate-250 bg-white text-slate-800'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        required
                        className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent ${
                          isDark ? 'border-white/10 bg-[#0a0f1d] text-white' : 'border-slate-250 bg-white text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Message</label>
                    <textarea
                      placeholder="Describe your issue, billing question, or technical request..."
                      value={supportMsg}
                      onChange={(e) => setSupportMsg(e.target.value)}
                      required
                      rows={4}
                      className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent ${
                        isDark ? 'border-white/10 bg-[#0a0f1d] text-white' : 'border-slate-250 bg-white text-slate-800'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={supportSubmitting}
                    className="w-full bg-accent text-slate-950 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition duration-300 font-display shadow-lg shadow-accent/10 disabled:opacity-40"
                  >
                    {supportSubmitting ? 'Sending Request...' : 'Send Message to Support'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Settings Right Column / Danger Zone */}
          <div className="space-y-6">
            <div className={`border border-red-500/10 rounded-3xl p-8 ${
              isDark ? 'bg-red-500/5' : 'bg-red-50/50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-4 text-red-500">
                <TrashIcon size={18} />
                <h3 className="font-bold font-display uppercase tracking-wider">Danger Zone</h3>
              </div>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Deleting your account is permanent. It will immediately remove your trainer credentials, clear your profile from matched clients, delete all associated session records, and erase access to your portal.
              </p>
              {error && (
                <div className="mb-4 text-xs font-bold text-red-500 flex items-center gap-1.5">
                  <AlertIcon size={14} />
                  <span>{error}</span>
                </div>
              )}
              <button
                disabled={loading}
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-40"
              >
                {loading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
