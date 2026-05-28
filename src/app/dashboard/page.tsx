'use client'

import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface TrainingSession {
  id: string;
  bookingId: string;
  clientId: string;
  clientName: string;
  trainerId: string | null;
  scheduledAt: string;
  status: 'upcoming' | 'assessment' | 'completed' | 'missed' | 'cancelled';
  trainerCheckedInAt: string | null;
  clientAttendedAt: string | null;
  serviceName: string;
}

interface FitnessPlan {
  id: string;
  clientId: string;
  clientName: string;
  trainerId: string;
  notes: string | null;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    focus: 'strength' | 'balance' | 'mobility' | 'core' | 'cardio';
  }>;
  status: 'active' | 'archived';
  createdAt: string;
}

interface ChatThread {
  thread_id: string;
  other_user_id: string;
  other_user_name: string;
  body: string;
  created_at: string;
  unread_count: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'messages' | 'plan'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileChatActive, setMobileChatActive] = useState(false)
  
  // Data States
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [assignedTrainer, setAssignedTrainer] = useState<any>(null)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [fitnessPlansList, setFitnessPlansList] = useState<FitnessPlan[]>([])
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([])
  
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Reschedule Session State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleTargetSession, setRescheduleTargetSession] = useState<TrainingSession | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
  const [rescheduleError, setRescheduleError] = useState('')

  const activeMessagesEndRef = useRef<HTMLDivElement>(null)

  // Poll for messages in background
  const activeThreadIdRef = useRef<string | null>(null)
  activeThreadIdRef.current = activeThreadId

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // 1. Initial Load of User and Base Data
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userRes = await fetch('/api/users/me')
        if (!userRes.ok) {
          router.push('/login')
          return
        }
        const userJson = await userRes.json()
        setUser(userJson.data?.user)
        const userProfile = userJson.data?.profile
        setProfile(userProfile)

        // If trainer is assigned, fetch trainer details
        if (userProfile?.assignedTrainerId) {
          const trRes = await fetch(`/api/trainers/${userProfile.assignedTrainerId}`)
          if (trRes.ok) {
            const trJson = await trRes.json()
            setAssignedTrainer(trJson.data?.trainer)
          }
        }

        // Fetch Sessions
        const sessRes = await fetch('/api/sessions')
        if (sessRes.ok) {
          const sessJson = await sessRes.json()
          setSessions(sessJson.data?.sessions || [])
        }

        // Fetch Fitness Plans
        const planRes = await fetch('/api/fitness-plans')
        if (planRes.ok) {
          const planJson = await planRes.json()
          setFitnessPlansList(planJson.data?.plans || [])
        }

        // Fetch Messages Threads
        const threadsRes = await fetch('/api/messages')
        if (threadsRes.ok) {
          const thJson = await threadsRes.json()
          const ths = thJson.data?.threads || []
          setThreads(ths)
          if (ths.length > 0 && !activeThreadIdRef.current) {
            setActiveThreadId(ths[0].thread_id)
          }
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  // 2. Fetch specific thread messages when thread selected
  useEffect(() => {
    if (!activeThreadId) return

    async function loadMessages() {
      try {
        const msgRes = await fetch(`/api/messages/${activeThreadId}`)
        if (msgRes.ok) {
          const msgJson = await msgRes.json()
          setActiveMessages(msgJson.data?.messages || [])
          
          // Mark thread as read locally
          setThreads(prev => 
            prev.map(t => t.thread_id === activeThreadId ? { ...t, unread_count: 0 } : t)
          )
        }
      } catch (err) {
        console.error('Error loading messages thread:', err)
      }
    }

    loadMessages()
    
    // Auto-scroll chat to bottom
    setTimeout(() => {
      activeMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [activeThreadId])

  // 3. REST Polling for Messaging (every 4 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Poll for thread updates
        const threadsRes = await fetch('/api/messages')
        if (threadsRes.ok) {
          const thJson = await threadsRes.json()
          setThreads(thJson.data?.threads || [])
        }

        // Poll messages of active thread
        if (activeThreadIdRef.current) {
          const msgRes = await fetch(`/api/messages/${activeThreadIdRef.current}`)
          if (msgRes.ok) {
            const msgJson = await msgRes.json()
            const freshMsgs = msgJson.data?.messages || []
            
            // Only update state if message counts differ to prevent rerendering cycles
            if (freshMsgs.length !== activeMessages.length) {
              setActiveMessages(freshMsgs)
              setTimeout(() => {
                activeMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }
          }
        }
      } catch (err) {
        console.warn('Polled messaging failed:', err)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [activeMessages.length])

  // Send message
  const handleSendMessage = async () => {
    const trimmed = messageText.trim()
    if (!trimmed || !activeThreadId || sendingMessage) return

    const thread = threads.find(t => t.thread_id === activeThreadId)
    if (!thread) return

    setSendingMessage(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          recipientId: thread.other_user_id,
          body: trimmed,
          threadId: activeThreadId,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        const sent = json.data?.message
        if (sent) {
          setActiveMessages(prev => [...prev, sent])
          setMessageText('')
          setTimeout(() => {
            activeMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSendingMessage(false)
    }
  }

  // Open reschedule modal
  const openRescheduleModal = (session: TrainingSession) => {
    setRescheduleTargetSession(session)
    setRescheduleDate('')
    setRescheduleTime('')
    setRescheduleReason('')
    setRescheduleError('')
    setShowRescheduleModal(true)
  }

  // Reschedule a session
  const handleRescheduleSession = async () => {
    if (!rescheduleTargetSession) return
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please select both a date and time.')
      return
    }

    const newDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`)
    if (isNaN(newDateTime.getTime())) {
      setRescheduleError('Invalid date or time selected.')
      return
    }
    if (newDateTime.getTime() < Date.now()) {
      setRescheduleError('The new session time must be in the future.')
      return
    }

    setRescheduleSubmitting(true)
    setRescheduleError('')
    try {
      const res = await fetch(`/api/sessions/${rescheduleTargetSession.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          toScheduledAt: newDateTime.toISOString(),
          reason: rescheduleReason.trim() || undefined,
        }),
      })

      if (res.ok) {
        // Refetch sessions
        const sessRes = await fetch('/api/sessions')
        if (sessRes.ok) {
          const sessJson = await sessRes.json()
          setSessions(sessJson.data?.sessions || [])
        }
        setShowRescheduleModal(false)
        setRescheduleTargetSession(null)
      } else {
        const json = await res.json()
        setRescheduleError(json.error?.message || 'Failed to reschedule session.')
      }
    } catch (err) {
      console.error('Reschedule session failed:', err)
      setRescheduleError('An error occurred. Please try again.')
    } finally {
      setRescheduleSubmitting(false)
    }
  }

  // Calculate statistics
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming').length
  const assessmentSessions = sessions.filter(s => s.status === 'assessment').length
  const missedSessions = sessions.filter(s => s.status === 'missed').length
  const completionPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  const activeThread = threads.find(t => t.thread_id === activeThreadId)

  // Map focus colors
  const getFocusClass = (focus: string) => {
    switch (focus) {
      case 'strength': return 'bg-blue-100 text-blue-700'
      case 'balance': return 'bg-yellow-100 text-yellow-700'
      case 'mobility': return 'bg-sky-100 text-sky-700'
      case 'core': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-indigo-100 text-indigo-700'
    }
  }

  const formatSessionStatus = (status: string) => {
    switch (status) {
      case 'completed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">Completed</span>
      case 'assessment': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">Assessment</span>
      case 'missed': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">Missed</span>
      case 'cancelled': return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">Cancelled</span>
      default: return <span className="text-blue-600 font-semibold text-sm">Upcoming</span>
    }
  }

  const formatDateTime = (dtStr: string) => {
    try {
      const dt = new Date(dtStr)
      return dt.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dtStr
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your PhysiFit profile...</p>
        </div>
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
        className={`fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-6 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none flex flex-col justify-between overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
          <div>
            <div className="mb-8 flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-dark tracking-wide">PhysiFit <span className="text-blue-600">NG</span></span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg hover:bg-gray-100 border border-gray-200"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase text-gray-500 font-bold mb-4">CLIENT MENU</p>
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('overview')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏠 Overview
                </button>
                <button
                  onClick={() => {
                    setActiveTab('sessions')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'sessions'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📅 My Sessions
                </button>
                <button
                  onClick={() => {
                    setActiveTab('messages')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition relative ${
                    activeTab === 'messages'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💬 Messages
                  {threads.some(t => t.unread_count > 0) && (
                    <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('plan')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'plan'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📋 Fitness Plan
                </button>
              </nav>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase text-gray-500 font-bold mb-4">ACCOUNT</p>
              <nav className="space-y-2">
                <Link
                  href="/book-session"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  ➕ Book Sessions
                </Link>
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    router.push('/')
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  🚪 Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Collapsed Sidebar Icon */}
        {!sidebarOpen && (
          <div className="hidden md:flex w-16 bg-white border-r border-gray-200 md:sticky md:top-0 md:h-screen flex-col items-center py-8 gap-6 transition-all duration-300 overflow-y-auto">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 transition"
              aria-label="Expand sidebar"
            >
              ☰
            </button>
          </div>
        )}

      {/* Main Panel Content */}
      <div className="flex-1 min-h-screen flex flex-col overflow-x-hidden">
        {/* Top bar for mobile menu */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between md:justify-start gap-4">
          <button
            onClick={() => setSidebarOpen(value => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            {sidebarOpen ? '←' : '☰'}
          </button>
          <span className="font-bold text-gray-800 md:hidden">PhysiFit Client</span>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">

          {activeTab === 'overview' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">Good morning, {user?.fullName || 'Amaka'} 👋</h1>
              <p className="text-gray-600 mb-8">Here's your fitness plan and program progress overview.</p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-blue-600 text-white rounded-xl p-8 shadow-sm">
                  <p className="text-gray-200 text-sm uppercase mb-2">TOTAL SESSIONS</p>
                  <p className="text-4xl font-bold mb-2">{totalSessions}</p>
                  <p className="text-sm">Assigned & active</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-sm uppercase mb-2">COMPLETED</p>
                  <p className="text-4xl font-bold mb-2">{completedSessions}</p>
                  <p className="text-sm text-gray-600">{completionPercentage}% of plan done</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-sm uppercase mb-2">UPCOMING</p>
                  <p className="text-4xl font-bold mb-2">{upcomingSessions}</p>
                  <p className="text-sm text-gray-600">
                    Next: {sessions.find(s => s.status === 'upcoming')?.scheduledAt ? formatDateTime(sessions.find(s => s.status === 'upcoming')!.scheduledAt) : 'None'}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-sm uppercase mb-2">MISSED / OTHER</p>
                  <p className="text-4xl font-bold mb-2">{missedSessions + assessmentSessions}</p>
                  <p className="text-sm text-gray-600">Attendance is stable</p>
                </div>
              </div>

              {/* Trainer Assignment Card */}
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 mb-12 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden">
                      {assignedTrainer?.fullName ? assignedTrainer.fullName.charAt(0) : 'T'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{assignedTrainer?.fullName || 'Trainer Assignment Pending'}</h3>
                      <p className="text-gray-600 mb-2">
                        {assignedTrainer?.specialization ? `${assignedTrainer.specialization.replace('_', ' ')} Specialist` : 'We are matching a specialist to your profile.'}
                      </p>
                      {assignedTrainer ? (
                        <p className="text-green-600 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                          Online now
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {assignedTrainer && (
                    <div className="flex gap-4 w-full lg:w-auto">
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="flex-1 lg:flex-initial text-center px-6 py-2.5 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                      >
                        💬 Message
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming sessions */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
                  <button onClick={() => setActiveTab('sessions')} className="text-blue-600 font-semibold hover:text-blue-700">
                    View all →
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {sessions.filter(s => s.status === 'upcoming').length > 0 ? (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-bold">SERVICE</th>
                              <th className="px-6 py-4 text-left text-sm font-bold">DATE & TIME</th>
                              <th className="px-6 py-4 text-left text-sm font-bold">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions
                              .filter(s => s.status === 'upcoming')
                              .slice(0, 3)
                              .map((session) => (
                                <tr key={session.id} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="px-6 py-4 font-bold">{session.serviceName || 'Personal Session'}</td>
                                  <td className="px-6 py-4">{formatDateTime(session.scheduledAt)}</td>
                                  <td className="px-6 py-4">{formatSessionStatus(session.status)}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {sessions
                          .filter(s => s.status === 'upcoming')
                          .slice(0, 3)
                          .map((session) => (
                            <div key={session.id} className="p-5 space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-gray-900">{session.serviceName || 'Personal Session'}</span>
                                {formatSessionStatus(session.status)}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1.5">
                                <span>📅</span> {formatDateTime(session.scheduledAt)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-500">No upcoming sessions. Book a new program to schedule sessions.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">My Sessions</h1>
              <p className="text-gray-600 mb-8">Full history and upcoming schedule.</p>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">All Program Sessions</h2>
                  <Link href="/book-session" className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition">
                    + Book More
                  </Link>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {sessions.length > 0 ? (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-bold">SERVICE</th>
                              <th className="px-6 py-4 text-left text-sm font-bold">DATE & TIME</th>
                              <th className="px-6 py-4 text-left text-sm font-bold">STATUS</th>
                              <th className="px-6 py-4 text-left text-sm font-bold">ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((session) => (
                              <tr key={session.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold">{session.serviceName}</td>
                                <td className="px-6 py-4">{formatDateTime(session.scheduledAt)}</td>
                                <td className="px-6 py-4">{formatSessionStatus(session.status)}</td>
                                <td className="px-6 py-4">
                                  {(session.status === 'upcoming' || session.status === 'assessment') && (
                                    <button
                                      onClick={() => openRescheduleModal(session)}
                                      className="text-amber-600 font-semibold hover:text-amber-700 text-sm flex items-center gap-1"
                                    >
                                      🔄 Reschedule
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {sessions.map((session) => (
                          <div key={session.id} className="p-5 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-gray-900">{session.serviceName}</span>
                              {formatSessionStatus(session.status)}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-500 flex items-center gap-1.5">
                                <span>📅</span> {formatDateTime(session.scheduledAt)}
                              </div>
                              {(session.status === 'upcoming' || session.status === 'assessment') && (
                                <button
                                  onClick={() => openRescheduleModal(session)}
                                  className="text-amber-600 font-semibold text-sm"
                                >
                                  🔄 Reschedule
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center text-gray-500">No sessions recorded yet. Book a session to get started.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">My Fitness Plan</h1>
              <p className="text-gray-600 mb-8">Your customized training program built specifically for your physical capabilities.</p>

              {fitnessPlansList.length > 0 ? (
                fitnessPlansList.map((plan) => (
                  <div key={plan.id} className="space-y-10">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b">
                        <div>
                          <h2 className="text-2xl font-bold text-primary-dark">Active Fitness Plan</h2>
                          <p className="text-xs text-gray-500">Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-4 py-2 text-blue-600 text-sm font-semibold">Active</span>
                      </div>

                      {plan.notes && (
                        <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-6 mb-8 text-gray-700">
                          <p className="text-sm font-bold text-blue-800 mb-2">Trainer Notes & Objectives:</p>
                          <p className="text-gray-600 text-sm italic">{plan.notes}</p>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                          <thead>
                            <tr className="text-sm text-gray-500 uppercase">
                              <th className="px-4 py-2">Exercise</th>
                              <th className="px-4 py-2">Sets</th>
                              <th className="px-4 py-2">Reps</th>
                              <th className="px-4 py-2">Focus Area</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plan.exercises.map((ex, index) => (
                              <tr key={`${ex.name}-${index}`} className="bg-gray-50 hover:bg-gray-100/50 transition">
                                <td className="px-4 py-4 font-semibold text-primary-dark">{ex.name}</td>
                                <td className="px-4 py-4 text-gray-600 font-medium">{ex.sets} sets</td>
                                <td className="px-4 py-4 text-gray-600 font-medium">{ex.reps} reps</td>
                                <td className="px-4 py-4">
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ${getFocusClass(ex.focus)}`}>
                                    {ex.focus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-bold mb-2">Plan is being generated</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Once you attend your initial Physical Assessment session, your trainer will customize and publish your active exercises program right here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">Trainer Chat</h1>
              <p className="text-gray-600 mb-8">Secure communications with your matching program trainer.</p>

              {threads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
                  {/* Threads List */}
                  <div className={`md:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col ${
                    mobileChatActive ? 'hidden md:flex' : 'flex'
                  }`}>
                    <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">Conversations</h3>
                    <div className="space-y-3 overflow-y-auto flex-1 max-h-[400px]">
                      {threads.map((t) => (
                        <div
                          key={t.thread_id}
                          onClick={() => {
                            setActiveThreadId(t.thread_id)
                            setMobileChatActive(true)
                          }}
                          className={`p-4 rounded-xl cursor-pointer transition border ${
                            t.thread_id === activeThreadId
                              ? 'bg-blue-50 border-blue-200 shadow-sm'
                              : 'bg-white hover:bg-gray-50 border-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm text-primary-dark">{t.other_user_name}</p>
                            {t.unread_count > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                {t.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{t.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Chat */}
                  <div className={`md:col-span-2 bg-white rounded-xl border border-gray-200 flex-col shadow-sm ${
                    mobileChatActive ? 'flex' : 'hidden md:flex'
                  }`}>
                    {activeThread ? (
                      <>
                        <div className="border-b border-gray-200 p-6 flex items-center gap-4">
                          <button
                            onClick={() => setMobileChatActive(false)}
                            className="md:hidden p-1 bg-gray-50 rounded border border-gray-200 text-gray-600 font-bold"
                          >
                            ← Back
                          </button>
                          <div>
                            <h3 className="font-bold text-gray-800">{activeThread.other_user_name}</h3>
                            <p className="text-xs text-gray-500">PhysiFit Professional Trainer</p>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[300px] bg-gray-50/50">
                          {activeMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-[70%]">
                                <div
                                  className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                    msg.senderId === user?.id
                                      ? 'bg-blue-600 text-white rounded-tr-none'
                                      : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                                  }`}
                                >
                                  {msg.body}
                                </div>
                                <p className={`text-[10px] text-gray-400 mt-1 ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                  {formatDateTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={activeMessagesEndRef} />
                        </div>

                        {/* Send Area */}
                        <div className="border-t border-gray-200 p-6">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder={`Reply to ${activeThread.other_user_name}...`}
                              className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={sendingMessage || !messageText.trim()}
                              className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                              ↑
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
                        Select a conversation thread to view communications.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-bold mb-2">No conversations initiated</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Once a trainer is matched to your profile, a secure conversation channel will open automatically. Keep a look out!
                  </p>
                </div>
              )}
            </div>
          )}
          </main>
        </div>

        {/* Reschedule Session Modal */}
        {showRescheduleModal && rescheduleTargetSession && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowRescheduleModal(false)}>
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-amber-50 border-b border-amber-100 px-6 py-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">
                  🔄
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Reschedule Session</h3>
                  <p className="text-xs text-gray-500">Choose a new date and time</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Current Session</p>
                  <p className="font-bold text-gray-900">{rescheduleTargetSession.serviceName}</p>
                  <p className="text-sm text-gray-600">{formatDateTime(rescheduleTargetSession.scheduledAt)}</p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-3 text-xs text-amber-800">
                  <strong>Note:</strong> Reschedules require at least 24 hours notice before the original session time.
                </div>

                {rescheduleError && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3 rounded text-sm font-semibold">
                    ⚠ {rescheduleError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Time</label>
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reason (optional)</label>
                  <textarea
                    rows={3}
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="e.g. I have a scheduling conflict, need a different time slot..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-300 bg-white resize-none"
                    maxLength={500}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{rescheduleReason.length}/500</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  onClick={() => { setShowRescheduleModal(false); setRescheduleTargetSession(null) }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition text-sm font-semibold"
                  disabled={rescheduleSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSession}
                  disabled={rescheduleSubmitting || !rescheduleDate || !rescheduleTime}
                  className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition text-sm font-bold shadow-sm disabled:bg-amber-300 disabled:cursor-not-allowed"
                >
                  {rescheduleSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
}
