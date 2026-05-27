'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  weightKg: number | null;
  heightCm: number | null;
  medicalNotes: string | null;
  serviceName: string;
  completedSessions: number;
  totalSessions: number;
  nextSessionDate: string | null;
}

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

export default function TrainerPortal() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'clients' | 'today' | 'messages'>('clients')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileChatActive, setMobileChatActive] = useState(false)
  
  // Data States
  const [trainerUser, setTrainerUser] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([])

  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [checkingInId, setCheckingInId] = useState<string | null>(null)

  const activeMessagesEndRef = useRef<HTMLDivElement>(null)
  const activeThreadIdRef = useRef<string | null>(null)
  activeThreadIdRef.current = activeThreadId

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // 1. Initial Load of Trainer and Associated Client/Session Data
  useEffect(() => {
    async function loadTrainerData() {
      try {
        // Fetch current user and check role
        const meRes = await fetch('/api/users/me')
        if (!meRes.ok) {
          router.push('/login')
          return
        }
        const meJson = await meRes.json()
        const user = meJson.data?.user
        if (user?.role !== 'trainer') {
          router.push('/dashboard') // Clients shouldn't access trainer portal
          return
        }
        setTrainerUser(user)

        // Fetch Clients
        const clientRes = await fetch('/api/trainers/clients')
        if (clientRes.ok) {
          const clientJson = await clientRes.json()
          setClients(clientJson.data?.clients || [])
        }

        // Fetch Sessions assigned to trainer
        const sessRes = await fetch('/api/sessions')
        if (sessRes.ok) {
          const sessJson = await sessRes.json()
          setSessions(sessJson.data?.sessions || [])
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
        console.error('Error loading trainer portal:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTrainerData()
  }, [router])

  // 2. Fetch specific thread messages when thread selected
  useEffect(() => {
    if (!activeThreadId) return

    async function loadThreadMessages() {
      try {
        const msgRes = await fetch(`/api/messages/${activeThreadId}`)
        if (msgRes.ok) {
          const msgJson = await msgRes.json()
          setActiveMessages(msgJson.data?.messages || [])
          
          // Clear locally
          setThreads(prev => 
            prev.map(t => t.thread_id === activeThreadId ? { ...t, unread_count: 0 } : t)
          )
        }
      } catch (err) {
        console.error('Error loading thread messages:', err)
      }
    }

    loadThreadMessages()
    
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

  // Trainer check in for a session
  const handleCheckIn = async (sessionId: string) => {
    setCheckingInId(sessionId)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        // Refetch sessions
        const sessRes = await fetch('/api/sessions')
        if (sessRes.ok) {
          const sessJson = await sessRes.json()
          setSessions(sessJson.data?.sessions || [])
        }
        
        // Refetch clients to update session completed count
        const clientRes = await fetch('/api/trainers/clients')
        if (clientRes.ok) {
          const clientJson = await clientRes.json()
          setClients(clientJson.data?.clients || [])
        }
      }
    } catch (err) {
      console.error('Check in failed:', err)
    } finally {
      setCheckingInId(null)
    }
  }

  // Find or create conversation with a client
  const handleMessageClientClick = async (clientName: string, clientId: string) => {
    // Check if thread exists
    let existingThread = threads.find(t => t.other_user_id === clientId)
    
    if (existingThread) {
      setActiveThreadId(existingThread.thread_id)
      setActiveTab('messages')
      setMobileChatActive(true)
    } else {
      // If conversation is not started in mock, let's open it by establishing a first message placeholder or thread lookup
      // Since Paystack keys/database use stable thread_id on backend, sending a message automatically creates the thread!
      // Let's create a thread placeholder in threads list locally to switch tabs
      const mockThreadId = crypto.randomUUID()
      const newThread: ChatThread = {
        thread_id: mockThreadId,
        other_user_id: clientId,
        other_user_name: clientName,
        body: 'Click to start chatting...',
        created_at: new Date().toISOString(),
        unread_count: 0,
      }
      setThreads(prev => [newThread, ...prev])
      setActiveThreadId(mockThreadId)
      setActiveTab('messages')
      setMobileChatActive(true)
    }
  }

  // Date Formatting helper
  const formatDateTime = (dtStr: string) => {
    try {
      const dt = new Date(dtStr)
      return dt.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dtStr
    }
  }

  const activeThread = threads.find(t => t.thread_id === activeThreadId)

  // Calculate trainer summary statistics
  const activeClientsCount = clients.length
  const todayUpcomingSessions = sessions.filter(s => {
    const today = new Date().toDateString()
    const sessionDate = new Date(s.scheduledAt).toDateString()
    return sessionDate === today && s.status === 'upcoming'
  })
  const completedThisMonth = sessions.filter(s => s.status === 'completed').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Trainer Portal...</p>
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
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white min-h-screen p-6 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
          <div>
            <div className="mb-12 flex items-center justify-between">
              <span className="text-2xl font-bold tracking-wide">PhysiFit <span className="text-blue-500">Trainer</span></span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg hover:bg-gray-800 border border-gray-700 text-gray-400"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase text-gray-400 font-bold mb-4">TRAINER PORTAL</p>
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('clients')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'clients' ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  👥 My Clients
                </button>
                <button
                  onClick={() => {
                    setActiveTab('today')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'today' ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  📅 Sessions Timeline
                </button>
                <button
                  onClick={() => {
                    setActiveTab('messages')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition relative ${
                    activeTab === 'messages' ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  💬 Messages
                  {threads.some(t => t.unread_count > 0) && (
                    <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </nav>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase text-gray-400 font-bold mb-4">ACCOUNT</p>
              <nav className="space-y-2">
                <div className="px-4 py-2 text-xs text-gray-400 font-mono">
                  Role: Trainer
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    router.push('/')
                  }}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition"
                >
                  🚪 Sign Out
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Collapsed Sidebar Icon */}
        {!sidebarOpen && (
          <div className="hidden md:flex w-16 bg-gray-900 min-h-screen flex-col items-center py-8 gap-6 transition-all duration-300">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 transition"
              aria-label="Expand sidebar"
            >
              ☰
            </button>
          </div>
        )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col overflow-x-hidden">
        {/* Top bar for mobile menu */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between md:justify-start gap-4">
          <button
            onClick={() => setSidebarOpen(value => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            {sidebarOpen ? '←' : '☰'}
          </button>
          <span className="font-bold text-gray-800 md:hidden">PhysiFit Trainer</span>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">

          {activeTab === 'clients' && (
            <div>
              <h1 className="text-4xl font-bold mb-2 text-primary-dark">My Assigned Clients</h1>
              <p className="text-gray-600 mb-8">Manage and review all your assigned fitness program clients.</p>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-blue-600 text-white rounded-xl p-8 shadow-sm">
                  <p className="text-gray-200 text-sm uppercase mb-2">ACTIVE CLIENTS</p>
                  <p className="text-4xl font-bold mb-2">{activeClientsCount}</p>
                  <p className="text-sm">Assigned program profiles</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-sm uppercase mb-2">COMPLETED TOTAL</p>
                  <p className="text-4xl font-bold mb-2">{completedThisMonth}</p>
                  <p className="text-sm text-gray-600">Sessions verified this month</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-sm uppercase mb-2">TODAY'S SCHEDULE</p>
                  <p className="text-4xl font-bold mb-2">{todayUpcomingSessions.length}</p>
                  <p className="text-sm text-gray-600">Sessions remaining today</p>
                </div>
              </div>

              {/* Clients Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {clients.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold">CLIENT</th>
                            <th className="px-6 py-4 text-left text-sm font-bold">PROGRAM</th>
                            <th className="px-6 py-4 text-left text-sm font-bold">PROGRESS</th>
                            <th className="px-6 py-4 text-left text-sm font-bold">NEXT SESSION</th>
                            <th className="px-6 py-4 text-left text-sm font-bold">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clients.map((client) => (
                            <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm">
                                    {client.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-primary-dark block">{client.fullName}</span>
                                    <span className="text-xs text-gray-500 block">{client.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                                  {client.serviceName}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-gray-700">
                                {client.completedSessions}/{client.totalSessions} sessions
                              </td>
                              <td className="px-6 py-4 text-gray-600 text-sm">
                                {client.nextSessionDate ? formatDateTime(client.nextSessionDate) : 'Not scheduled'}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleMessageClientClick(client.fullName, client.id)}
                                  className="text-blue-600 font-semibold hover:text-blue-700 text-sm"
                                >
                                  Message Chat →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100">
                      {clients.map((client) => (
                        <div key={client.id} className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm">
                              {client.fullName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-primary-dark block text-base">{client.fullName}</span>
                              <span className="text-xs text-gray-500 block">{client.email}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg text-sm">
                            <div>
                              <span className="text-xs text-gray-400 block uppercase font-semibold">Program</span>
                              <span className="font-semibold text-gray-700">{client.serviceName}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400 block uppercase font-semibold">Progress</span>
                              <span className="font-semibold text-gray-700">{client.completedSessions}/{client.totalSessions}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-sm pt-2">
                            <span className="text-gray-500">📅 {client.nextSessionDate ? formatDateTime(client.nextSessionDate) : 'Not scheduled'}</span>
                            <button
                              onClick={() => handleMessageClientClick(client.fullName, client.id)}
                              className="text-blue-600 font-bold hover:text-blue-700"
                            >
                              Message Chat →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-gray-500">No assigned clients registered yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'today' && (
            <div>
              <h1 className="text-4xl font-bold mb-2 text-primary-dark">Sessions Timeline</h1>
              <p className="text-gray-600 mb-8">Verification and check-ins for assigned client schedules.</p>

              <div className="space-y-6">
                {sessions.filter(s => s.status === 'upcoming' || s.status === 'assessment').length > 0 ? (
                  sessions
                    .filter(s => s.status === 'upcoming' || s.status === 'assessment')
                    .map((session) => (
                      <div key={session.id} className="border-l-4 border-l-blue-600 bg-white rounded-lg p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow transition">
                        <div>
                          <p className="text-lg font-bold text-blue-600 mb-1">{formatDateTime(session.scheduledAt)}</p>
                          <p className="text-2xl font-bold text-primary-dark mb-2">{session.clientName}</p>
                          <p className="text-gray-600 text-sm">{session.serviceName} · {session.status === 'assessment' ? 'Physical Assessment' : 'One-on-One Session'}</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                          <button
                            onClick={() => handleMessageClientClick(session.clientName, session.clientId)}
                            className="flex-1 md:flex-initial text-center px-5 py-2.5 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                          >
                            💬 Chat
                          </button>
                          <button
                            onClick={() => handleCheckIn(session.id)}
                            disabled={checkingInId === session.id}
                            className="flex-1 md:flex-initial text-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm disabled:bg-blue-400"
                          >
                            {checkingInId === session.id ? 'Verifying...' : '✓ I\'m Here'}
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="bg-white rounded-xl p-12 border border-gray-200 text-center text-gray-500 shadow-sm">
                    No remaining scheduled sessions requiring verification today.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">Trainer Chat</h1>
              <p className="text-gray-600 mb-8">Secure messaging with your active Physifit clients.</p>

              {threads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
                  {/* Threads List */}
                  <div className={`md:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col ${
                    mobileChatActive ? 'hidden md:block' : 'flex'
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
                            <p className="text-xs text-gray-500">Assigned Client</p>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[300px] bg-gray-50/50">
                          {activeMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderId === trainerUser?.id ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-[70%]">
                                <div
                                  className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                    msg.senderId === trainerUser?.id
                                      ? 'bg-blue-600 text-white rounded-tr-none'
                                      : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                                  }`}
                                >
                                  {msg.body}
                                </div>
                                <p className={`text-[10px] text-gray-400 mt-1 ${msg.senderId === trainerUser?.id ? 'text-right' : 'text-left'}`}>
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
                        Select a conversation thread to start secure chat.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-bold mb-2">No active communications</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Communications will appear automatically when clients message you or book programs.
                  </p>
                </div>
              )}
            </div>
          )}
          </main>
        </div>
      </div>
    )
}
