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
  const [activeTab, setActiveTab] = useState<'clients' | 'today' | 'messages' | 'plans'>('clients')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileChatActive, setMobileChatActive] = useState(false)
  
  // Data States
  const [trainerUser, setTrainerUser] = useState<any>(null)
  const [trainerProfile, setTrainerProfile] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([])

  // Fitness Plans State
  const [fitnessPlans, setFitnessPlans] = useState<any[]>([])
  const [planClientId, setPlanClientId] = useState('')
  const [planNotes, setPlanNotes] = useState('')
  const [planExercises, setPlanExercises] = useState<any[]>([{ name: '', sets: 3, reps: 10, focus: 'strength' }])
  const [savingPlan, setSavingPlan] = useState(false)
  const [planSuccessMsg, setPlanSuccessMsg] = useState('')
  const [planErrorMsg, setPlanErrorMsg] = useState('')
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [checkingInId, setCheckingInId] = useState<string | null>(null)

  // Cancel Session State
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelSubmitting, setCancelSubmitting] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelTargetSession, setCancelTargetSession] = useState<TrainingSession | null>(null)

  // Reschedule Session State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleTargetSession, setRescheduleTargetSession] = useState<TrainingSession | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleReason, setRescheduleReason] = useState('')
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
  const [rescheduleError, setRescheduleError] = useState('')

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
        setTrainerProfile(meJson.data?.profile ?? null)

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

        // Fetch Fitness Plans
        const plansRes = await fetch('/api/fitness-plans')
        if (plansRes.ok) {
          const plansJson = await plansRes.json()
          setFitnessPlans(plansJson.data?.plans || [])
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
          const serverThreads = (thJson.data?.threads || []) as ChatThread[]
          setThreads(prev => {
            // Find if there is an active local thread that is not in the server threads yet
            const activeLocal = prev.find(t => t.thread_id === activeThreadIdRef.current)
            const existsInServer = serverThreads.some(t => t.thread_id === activeThreadIdRef.current)
            if (activeLocal && !existsInServer) {
              return [activeLocal, ...serverThreads]
            }
            return serverThreads
          })
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

  // Open cancel confirmation modal
  const openCancelModal = (session: TrainingSession) => {
    setCancelTargetSession(session)
    setCancelReason('')
    setShowCancelModal(true)
  }

  // Cancel a session
  const handleCancelSession = async () => {
    if (!cancelTargetSession) return
    setCancelSubmitting(true)
    try {
      const res = await fetch(`/api/sessions/${cancelTargetSession.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() || undefined }),
      })

      if (res.ok) {
        // Refetch sessions
        const sessRes = await fetch('/api/sessions')
        if (sessRes.ok) {
          const sessJson = await sessRes.json()
          setSessions(sessJson.data?.sessions || [])
        }
        // Refetch clients
        const clientRes = await fetch('/api/trainers/clients')
        if (clientRes.ok) {
          const clientJson = await clientRes.json()
          setClients(clientJson.data?.clients || [])
        }
        setShowCancelModal(false)
        setCancelTargetSession(null)
        setCancelReason('')
      } else {
        const json = await res.json()
        alert(json.error?.message || 'Failed to cancel session')
      }
    } catch (err) {
      console.error('Cancel session failed:', err)
      alert('An error occurred while cancelling the session.')
    } finally {
      setCancelSubmitting(false)
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
        // Refetch clients
        const clientRes = await fetch('/api/trainers/clients')
        if (clientRes.ok) {
          const clientJson = await clientRes.json()
          setClients(clientJson.data?.clients || [])
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

  // Fetch fitness plans authored by this trainer
  const fetchFitnessPlans = async () => {
    try {
      const res = await fetch('/api/fitness-plans')
      if (res.ok) {
        const json = await res.json()
        setFitnessPlans(json.data?.plans || [])
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
    }
  }

  // Pre-select client and switch tab to builder
  const handleAssignPlanClick = (clientId: string) => {
    setEditingPlanId(null)
    setPlanClientId(clientId)
    setActiveTab('plans')
  }

  // Load an existing plan into the builder for editing
  const handleEditPlan = (plan: any) => {
    setEditingPlanId(plan.id)
    setPlanClientId(plan.clientId)
    setPlanNotes(plan.notes || '')
    setPlanExercises(
      plan.exercises.map((ex: any) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        focus: ex.focus,
      }))
    )
    setPlanSuccessMsg('')
    setPlanErrorMsg('')
    // Scroll builder into view on mobile
    setTimeout(() => {
      document.getElementById('plan-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Reset the form back to create mode
  const handleResetPlanForm = () => {
    setEditingPlanId(null)
    setPlanClientId('')
    setPlanNotes('')
    setPlanExercises([{ name: '', sets: 3, reps: 10, focus: 'strength' }])
    setPlanSuccessMsg('')
    setPlanErrorMsg('')
  }

  // Exercise builder handlers
  const handleAddExerciseInput = () => {
    setPlanExercises(prev => [...prev, { name: '', sets: 3, reps: 10, focus: 'strength' }])
  }

  const handleRemoveExerciseInput = (index: number) => {
    if (planExercises.length === 1) return
    setPlanExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleExerciseChange = (index: number, field: string, value: any) => {
    setPlanExercises(prev => prev.map((ex, i) => {
      if (i === index) {
        return { ...ex, [field]: value }
      }
      return ex
    }))
  }

  // Submit and assign plan (create or update)
  const handlePublishPlan = async () => {
    setPlanErrorMsg('')
    setPlanSuccessMsg('')
    
    if (!planClientId) {
      setPlanErrorMsg('Please select a client to assign the plan to.')
      return
    }

    const invalidEx = planExercises.some(ex => !ex.name.trim() || ex.sets <= 0 || ex.reps <= 0)
    if (invalidEx) {
      setPlanErrorMsg('Please fill in name, sets, and reps for all exercises.')
      return
    }

    setSavingPlan(true)
    try {
      const isEditing = !!editingPlanId
      const url = isEditing ? `/api/fitness-plans/${editingPlanId}` : '/api/fitness-plans'
      const method = isEditing ? 'PUT' : 'POST'

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (!isEditing) {
        headers['Idempotency-Key'] = crypto.randomUUID()
      }

      const payload: Record<string, unknown> = {
        notes: planNotes.trim() || undefined,
        exercises: planExercises.map(ex => ({
          name: ex.name.trim(),
          sets: Number(ex.sets),
          reps: Number(ex.reps),
          focus: ex.focus,
        })),
      }
      if (!isEditing) {
        payload.clientId = planClientId
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (res.ok) {
        setPlanSuccessMsg(isEditing ? 'Fitness plan updated successfully!' : 'Fitness plan published successfully!')
        handleResetPlanForm()
        fetchFitnessPlans()
      } else {
        setPlanErrorMsg(json.error?.message || json.message || 'Failed to save fitness plan.')
      }
    } catch (err) {
      setPlanErrorMsg('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setSavingPlan(false)
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
        className={`fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-6 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none flex flex-col justify-between overflow-y-auto ${
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
                <button
                  onClick={() => {
                    setActiveTab('plans')
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'plans' ? 'bg-blue-600' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  📋 Fitness Plans
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
          <div className="hidden md:flex w-16 bg-gray-900 md:sticky md:top-0 md:h-screen flex-col items-center py-8 gap-6 transition-all duration-300 overflow-y-auto">
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

          {trainerProfile && !trainerProfile.approvedAt && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded p-4 flex items-start gap-3">
              <span className="text-yellow-600 text-xl leading-none" aria-hidden>⏳</span>
              <div>
                <p className="font-bold text-yellow-900">Account pending approval</p>
                <p className="text-sm text-yellow-900 mt-1">
                  Your trainer account is being reviewed by an admin. You can explore the portal,
                  but you won't appear in client matching or receive client assignments until your
                  account is approved.
                </p>
              </div>
            </div>
          )}

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
                                <div className="flex flex-col gap-1.5 items-start">
                                  <button
                                    onClick={() => handleMessageClientClick(client.fullName, client.id)}
                                    className="text-blue-600 font-semibold hover:text-blue-700 text-sm flex items-center gap-1"
                                  >
                                    💬 Chat
                                  </button>
                                  <button
                                    onClick={() => handleAssignPlanClick(client.id)}
                                    className="text-emerald-600 font-semibold hover:text-emerald-700 text-sm flex items-center gap-1"
                                  >
                                    📋 Assign Plan
                                  </button>
                                </div>
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
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleMessageClientClick(client.fullName, client.id)}
                                className="text-blue-600 font-bold hover:text-blue-700"
                              >
                                💬 Chat
                              </button>
                              <button
                                onClick={() => handleAssignPlanClick(client.id)}
                                className="text-emerald-600 font-bold hover:text-emerald-700"
                              >
                                📋 Plan
                              </button>
                            </div>
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
                        <div className="flex gap-3 w-full md:w-auto flex-wrap">
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
                          <button
                            onClick={() => openRescheduleModal(session)}
                            className="flex-1 md:flex-initial text-center px-5 py-2.5 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition text-sm font-semibold"
                          >
                            🔄 Reschedule
                          </button>
                          <button
                            onClick={() => openCancelModal(session)}
                            className="flex-1 md:flex-initial text-center px-5 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-semibold"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="bg-white rounded-xl p-12 border border-gray-200 text-center text-gray-500 shadow-sm">
                    No remaining scheduled sessions requiring verification today.
                  </div>
                )}

                {/* Cancelled Sessions List */}
                {sessions.filter(s => s.status === 'cancelled').length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-500 mb-4">Cancelled Sessions</h3>
                    <div className="space-y-3">
                      {sessions.filter(s => s.status === 'cancelled').map(session => (
                        <div key={session.id} className="border-l-4 border-l-red-300 bg-white rounded-lg p-5 border border-gray-200 shadow-sm opacity-70">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-red-500 mb-0.5">{formatDateTime(session.scheduledAt)}</p>
                              <p className="text-lg font-bold text-gray-400 line-through">{session.clientName}</p>
                              <p className="text-gray-400 text-xs">{session.serviceName}</p>
                            </div>
                            <span className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full font-bold uppercase">Cancelled</span>
                          </div>
                        </div>
                      ))}
                    </div>
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

          {activeTab === 'plans' && (
            <div>
              <h1 className="text-4xl font-bold mb-2 text-primary-dark">Client Fitness Plans</h1>
              <p className="text-gray-600 mb-8">Design, publish, and assign custom workout programs directly to your active clients.</p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Left side: Published Plans List */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Published Workout Regimens</h3>
                    
                    {fitnessPlans.length > 0 ? (
                      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
                        {fitnessPlans.map((plan) => (
                          <div key={plan.id} className={`border rounded-xl p-5 hover:shadow-md transition ${editingPlanId === plan.id ? 'border-blue-400 bg-blue-50/20 ring-2 ring-blue-200' : 'border-gray-150 bg-gray-50/30'}`}>
                            <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                              <div>
                                <h4 className="font-bold text-base text-primary-dark flex items-center gap-2">
                                  👤 {plan.clientName}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  Published: {new Date(plan.createdAt).toLocaleDateString('en-NG')}
                                  {plan.updatedAt !== plan.createdAt && (
                                    <> · Updated: {new Date(plan.updatedAt).toLocaleDateString('en-NG')}</>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditPlan(plan)}
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full transition ${
                                    editingPlanId === plan.id
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                  }`}
                                >
                                  {editingPlanId === plan.id ? '✏️ Editing...' : '✏️ Edit'}
                                </button>
                                <span className="bg-emerald-50 text-emerald-600 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                  {plan.status}
                                </span>
                              </div>
                            </div>

                            {plan.notes && (
                              <div className="mb-4 text-xs text-gray-600 bg-blue-50/40 p-3 rounded-lg border border-blue-50 italic">
                                <span className="font-bold text-blue-800 not-italic block mb-0.5">Trainer Notes:</span>
                                "{plan.notes}"
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Exercise List ({plan.exercises.length})</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {plan.exercises.map((ex: any, idx: number) => (
                                  <div key={idx} className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center justify-between text-xs shadow-sm">
                                    <div>
                                      <p className="font-bold text-gray-800">{ex.name}</p>
                                      <p className="text-[10px] text-gray-400 mt-0.5">{ex.sets} Sets x {ex.reps} Reps</p>
                                    </div>
                                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                      ex.focus === 'strength' ? 'bg-blue-50 text-blue-600' :
                                      ex.focus === 'balance' ? 'bg-yellow-50 text-yellow-600' :
                                      ex.focus === 'mobility' ? 'bg-sky-50 text-sky-600' :
                                      ex.focus === 'core' ? 'bg-emerald-50 text-emerald-600' :
                                      'bg-indigo-50 text-indigo-600'
                                    }`}>
                                      {ex.focus}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-3xl mb-2">📋</p>
                        <p className="text-sm font-semibold">No fitness plans published yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Use the builder to assign the first plan.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Right side: Fitness Plan Builder Form */}
                <div className="lg:col-span-5" id="plan-builder">
                  <div className={`bg-white rounded-2xl border p-6 shadow-sm sticky top-6 ${
                    editingPlanId ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
                  }`}>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center justify-between">
                      <span>{editingPlanId ? '✏️ Edit Fitness Plan' : '⚡ Fitness Plan Builder'}</span>
                      <div className="flex items-center gap-2">
                        {editingPlanId && (
                          <button
                            onClick={handleResetPlanForm}
                            className="text-[10px] text-gray-500 font-bold hover:underline"
                          >
                            ✕ Cancel Edit
                          </button>
                        )}
                        <button 
                          onClick={handleResetPlanForm}
                          className="text-[10px] text-blue-600 font-bold hover:underline"
                        >
                          {editingPlanId ? 'New Plan' : 'Reset Form'}
                        </button>
                      </div>
                    </h3>

                    {editingPlanId && (
                      <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-3 rounded text-xs font-semibold flex items-center gap-2">
                        ✏️ Editing existing plan for <strong>{clients.find(c => c.id === planClientId)?.fullName || 'Client'}</strong>. Make your changes and save.
                      </div>
                    )}

                    {planSuccessMsg && (
                      <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 rounded text-sm font-semibold">
                        ✓ {planSuccessMsg}
                      </div>
                    )}

                    {planErrorMsg && (
                      <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-800 p-3 rounded text-sm font-semibold">
                        ⚠ {planErrorMsg}
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Select Client */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Assigned Client</label>
                        <select
                          value={planClientId}
                          onChange={(e) => setPlanClientId(e.target.value)}
                          disabled={!!editingPlanId}
                          className={`w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm ${
                            editingPlanId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
                          }`}
                        >
                          <option value="">-- Choose Client --</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.fullName} ({c.serviceName})</option>
                          ))}
                        </select>
                        {editingPlanId && (
                          <p className="text-[10px] text-gray-400 mt-1">Client cannot be changed when editing. Create a new plan instead.</p>
                        )}
                      </div>

                      {/* Notes / Objectives */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Trainer Objectives & Notes</label>
                        <textarea
                          rows={2}
                          value={planNotes}
                          onChange={(e) => setPlanNotes(e.target.value)}
                          placeholder="e.g. Focus on balance exercises twice a week. Increase resistance band sets if stable."
                          className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm placeholder:text-gray-300 bg-white"
                        />
                      </div>

                      {/* Exercises Dynamic Rows */}
                      <div>
                        <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Exercise List</label>
                          <button
                            type="button"
                            onClick={handleAddExerciseInput}
                            className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-bold hover:bg-blue-100 transition"
                          >
                            + Add Row
                          </button>
                        </div>

                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                          {planExercises.map((ex, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative space-y-2.5">
                              {planExercises.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExerciseInput(idx)}
                                  className="absolute top-1 right-2 text-gray-400 hover:text-red-500 font-bold text-sm bg-white"
                                  title="Delete exercise"
                                >
                                  ✕
                                </button>
                              )}

                              {/* Exercise Name */}
                              <div>
                                <input
                                  type="text"
                                  value={ex.name}
                                  onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                                  placeholder="Exercise name (e.g. Calf Raises)"
                                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                {/* Sets */}
                                <div>
                                  <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Sets</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={ex.sets}
                                    onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-800"
                                  />
                                </div>
                                {/* Reps */}
                                <div>
                                  <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Reps</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={ex.reps}
                                    onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-800"
                                  />
                                </div>
                                {/* Focus */}
                                <div>
                                  <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Focus</label>
                                  <select
                                    value={ex.focus}
                                    onChange={(e) => handleExerciseChange(idx, 'focus', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-800"
                                  >
                                    <option value="strength">Strength</option>
                                    <option value="balance">Balance</option>
                                    <option value="mobility">Mobility</option>
                                    <option value="core">Core</option>
                                    <option value="cardio">Cardio</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="button"
                        onClick={handlePublishPlan}
                        disabled={savingPlan || clients.length === 0}
                        className={`w-full text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg disabled:bg-blue-300 ${
                          editingPlanId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {savingPlan
                          ? (editingPlanId ? 'Saving Changes...' : 'Publishing Plan...')
                          : (editingPlanId ? '💾 Save Changes' : 'Publish & Assign Plan')
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        </div>

        {/* Cancel Session Confirmation Modal */}
        {showCancelModal && cancelTargetSession && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowCancelModal(false)}>
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-lg">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Cancel Session</h3>
                  <p className="text-xs text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Session Details</p>
                  <p className="font-bold text-gray-900">{cancelTargetSession.clientName}</p>
                  <p className="text-sm text-gray-600">{cancelTargetSession.serviceName} · {formatDateTime(cancelTargetSession.scheduledAt)}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reason for cancellation (optional)</label>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. I have a scheduling conflict, personal emergency..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder:text-gray-300 bg-white resize-none"
                    maxLength={500}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{cancelReason.length}/500</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                <button
                  onClick={() => { setShowCancelModal(false); setCancelTargetSession(null); setCancelReason('') }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition text-sm font-semibold"
                  disabled={cancelSubmitting}
                >
                  Keep Session
                </button>
                <button
                  onClick={handleCancelSession}
                  disabled={cancelSubmitting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-bold shadow-sm disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {cancelSubmitting ? 'Cancelling...' : 'Yes, Cancel Session'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <p className="font-bold text-gray-900">{rescheduleTargetSession.clientName}</p>
                  <p className="text-sm text-gray-600">{rescheduleTargetSession.serviceName} · {formatDateTime(rescheduleTargetSession.scheduledAt)}</p>
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
                    placeholder="e.g. Client requested a different time, scheduling conflict..."
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
