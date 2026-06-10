'use client'

import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ProgressChart from '@/components/ProgressChart'
import WorkoutPlayer from '@/components/WorkoutPlayer'
import ScrollReveal from '@/components/ScrollReveal'
import { useTheme } from '@/context/ThemeContext'
import {
  DashboardIcon,
  CalendarIcon,
  FitnessPlanIcon,
  ChatIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  ExitIcon,
  PlusIcon,
  UserIcon,
  LockIcon,
  TrashIcon,
  AlertIcon,
  RefreshIcon,
  VideoIcon,
  MicIcon,
  MicOffIcon,
  CameraIcon,
  CameraOffIcon,
  TrophyIcon,
  MenuIcon,
  CloseIcon,
} from '@/components/Icons'

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


function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </p>

      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="font-medium break-words">
          {value}
        </p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'messages' | 'plan' | 'settings'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileChatActive, setMobileChatActive] = useState(false)

  // Theme States
  const { theme, toggleTheme } = useTheme()

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

  // Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editWeightKg, setEditWeightKg] = useState<number | ''>('')
  const [editHeightCm, setEditHeightCm] = useState<number | ''>('')
  const [editMedicalNotes, setEditMedicalNotes] = useState('')
  const [editProfileSubmitting, setEditProfileSubmitting] = useState(false)
  const [editProfileError, setEditProfileError] = useState('')

  // Change Password States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changePasswordSubmitting, setChangePasswordSubmitting] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState('')

  // Delete Account States
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Support Form State
  const [supportName, setSupportName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [supportMsg, setSupportMsg] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportSuccess, setSupportSuccess] = useState(false)

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMsg.trim()) return
    setSupportSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setSupportSubmitting(false)
    setSupportSuccess(true)
    setSupportMsg('')
  }

  // Interactive Workout Tracker & Charts States
  const [showWorkoutPlayer, setShowWorkoutPlayer] = useState(false)
  const [workoutSuccess, setWorkoutSuccess] = useState(false)
  const [complianceData, setComplianceData] = useState([
    { label: 'Wk 1', value: 45 },
    { label: 'Wk 2', value: 60 },
    { label: 'Wk 3', value: 75 },
    { label: 'Wk 4', value: 80 },
    { label: 'Wk 5', value: 92 },
  ])
  const [stabilityData, setStabilityData] = useState([
    { label: 'Wk 1', value: 58 },
    { label: 'Wk 2', value: 62 },
    { label: 'Wk 3', value: 71 },
    { label: 'Wk 4', value: 76 },
    { label: 'Wk 5', value: 85 },
  ])

  // Simulated Video Call States
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

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
        const fetchedUser = userJson.data?.user
        setUser(fetchedUser)
        if (fetchedUser) {
          setSupportName(fetchedUser.fullName || '')
          setSupportEmail(fetchedUser.email || '')
        }
        const userProfile = userJson.data?.profile
        setProfile(userProfile)

        // Populate edit profile values
        setEditFullName(userJson.data?.user?.fullName || '')
        setEditPhone(userJson.data?.user?.phone || '')
        setEditWeightKg(userProfile?.weightKg ?? '')
        setEditHeightCm(userProfile?.heightCm ?? '')
        setEditMedicalNotes(userProfile?.medicalNotes || '')

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

  // Camera stream activation for video consultation
  useEffect(() => {
    if (showVideoCall && !camOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(s => {
          setStream(s)
          if (videoRef.current) {
            videoRef.current.srcObject = s
          }
        })
        .catch(err => {
          console.warn("Camera access denied or unavailable:", err)
        })
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [showVideoCall, camOff, stream])

  // Theme Toggle
  const handleToggleTheme = toggleTheme

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
    const originalTime = new Date(rescheduleTargetSession.scheduledAt).getTime()
    if (originalTime - Date.now() < 24 * 60 * 60 * 1000) {
      setRescheduleError('You cannot reschedule this session. Rescheduling must be done at least 24 hours before the fixed session time.')
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

  // Account deletion (basic flow)
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.')
      return
    }

    setDeleteSubmitting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' })
      if (res.ok) {
        // log out and redirect home
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
      } else {
        const text = await res.text()
        console.error('Delete failed', text)
        setDeleteError('Failed to delete account. Please try again.')
      }
    } catch (err) {
      console.error(err)
      setDeleteError('An error occurred. Please try again.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  // Save profile info
  const handleSaveProfile = async () => {
    setEditProfileSubmitting(true)
    setEditProfileError('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          phone: editPhone.trim() || null,
          weightKg: editWeightKg !== '' ? Number(editWeightKg) : null,
          heightCm: editHeightCm !== '' ? Number(editHeightCm) : null,
          medicalNotes: editMedicalNotes.trim() || null,
        }),
      })

      if (res.ok) {
        // Refetch user data
        const userRes = await fetch('/api/users/me')
        if (userRes.ok) {
          const userJson = await userRes.json()
          setUser(userJson.data?.user)
          setProfile(userJson.data?.profile)
        }
        setShowEditProfileModal(false)
      } else {
        const json = await res.json()
        setEditProfileError(json.error?.message || 'Failed to update profile.')
      }
    } catch (err) {
      console.error(err)
      setEditProfileError('An error occurred. Please try again.')
    } finally {
      setEditProfileSubmitting(false)
    }
  }

  // Change password handler
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setChangePasswordError('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters.')
      return
    }

    setChangePasswordSubmitting(true)
    setChangePasswordError('')
    try {
      const res = await fetch('/api/users/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (res.ok) {
        setShowChangePasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        alert('Password changed successfully!')
      } else {
        const json = await res.json()
        setChangePasswordError(json.error?.message || 'Failed to change password.')
      }
    } catch (err) {
      console.error(err)
      setChangePasswordError('An error occurred. Please try again.')
    } finally {
      setChangePasswordSubmitting(false)
    }
  }

  const handleWorkoutComplete = () => {
    setShowWorkoutPlayer(false)
    setWorkoutSuccess(true)

    // Dynamically bump the last week's values to show responsive progress tracking!
    setComplianceData(prev => {
      const updated = [...prev]
      if (updated.length > 0) {
        updated[updated.length - 1].value = Math.min(100, updated[updated.length - 1].value + 8)
      }
      return updated
    })
    setStabilityData(prev => {
      const updated = [...prev]
      if (updated.length > 0) {
        updated[updated.length - 1].value = Math.min(100, updated[updated.length - 1].value + 5)
      }
      return updated
    })
  }

  // Calculate statistics
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming').length
  const assessmentSessions = sessions.filter(s => s.status === 'assessment').length
  const missedSessions = sessions.filter(s => s.status === 'missed').length
  const completionPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  const activeThread = threads.find(t => t.thread_id === activeThreadId)
  const isDark = theme === 'dark'

  // Map focus colors
  const getFocusClass = (focus: string) => {
    switch (focus) {
      case 'strength': return isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
      case 'balance': return isDark ? 'bg-amber-500/20 text-accent border border-accent/30' : 'bg-amber-50 text-amber-600 border border-amber-200'
      case 'mobility': return isDark ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-sky-50 text-sky-600 border border-sky-200'
      case 'core': return isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      default: return isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
    }
  }

  const formatSessionStatus = (status: string) => {
    switch (status) {
      case 'completed': return <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-50 text-green-600 border-green-200'}`}>Completed</span>
      case 'assessment': return <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-amber-500/20 text-accent border-accent/30' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>Assessment</span>
      case 'missed': return <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200'}`}>Missed</span>
      case 'cancelled': return <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-white/10 text-gray-400 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Cancelled</span>
      default: return <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>Upcoming</span>
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
      <div className={`min-h-screen flex flex-col justify-between ${isDark ? 'bg-primary-darker' : 'bg-slate-50'}`}>
        <Header />
        <div className={`flex-1 flex flex-col items-center justify-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <div className={`animate-spin inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full mb-6`}></div>
          <p className="font-display uppercase tracking-widest text-accent text-sm animate-pulse">Syncing PhysiFit Profile...</p>
        </div>
      </div>
    )
  }


  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${isDark
      ? 'bg-gradient-to-br from-primary-darker via-[#120f3a] to-primary-dark text-white'
      : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900'
      }`}>
      {/* Top Banner Header */}
      <Header />

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
          className={`fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 w-72 backdrop-blur-xl border-r p-8 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto scrollbar-none ${isDark
            ? 'bg-primary-darker/95 border-white/5 text-white'
            : 'bg-white/95 border-slate-200 text-slate-800'
            } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
        >
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className={`text-xl font-display uppercase tracking-widest font-bold inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent rounded ${isDark ? 'text-white' : 'text-slate-800'}`}
                aria-label="Go to Dashboard"
              >
                <span>PhysiFit</span>
                <span className="text-accent font-extrabold">NG</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`md:hidden w-8 h-8 rounded-full border flex items-center justify-center transition ${isDark ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-100'}`}
                aria-label="Close sidebar"
              >
                <CloseIcon size={14} />
              </button>
            </div>

            {/* User Profile Summary */}
            <div className={`border rounded-2xl p-4 flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/80 border-slate-200'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent font-display text-lg">
                  {user?.fullName ? user.fullName.charAt(0) : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{user?.fullName || 'Client'}</p>
                  <span className={`text-[10px] font-mono tracking-wider block uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Member Card</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Main Dashboard</p>
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Core Cockpit', icon: <DashboardIcon size={16} className="mr-3" /> },
                  { id: 'sessions', label: 'My Timeline', icon: <CalendarIcon size={16} className="mr-3" /> },
                  { id: 'plan', label: 'Clinical Fitness Plan', icon: <FitnessPlanIcon size={16} className="mr-3" /> },
                  { id: 'messages', label: 'Trainer Chat', icon: <ChatIcon size={16} className="mr-3" />, indicator: threads.some(t => t.unread_count > 0) },
                  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={16} className="mr-3" /> },
                ].map((tab) => {
                  const btnClass = `w-full text-left px-5 py-3.5 rounded-xl font-display font-semibold uppercase tracking-wider text-xs transition-all duration-300 relative border flex items-center justify-between ${activeTab === tab.id
                    ? 'bg-accent text-primary-darker border-accent shadow-lg shadow-accent/20 scale-[1.02]'
                    : isDark
                      ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 border-slate-200/60'
                    }`

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any)
                        if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false)
                      }}
                      className={btnClass}
                      aria-label={`Open ${tab.label.trim()}`}
                    >
                      <span className="flex items-center">
                        {tab.icon}
                        {tab.label}
                      </span>
                      {tab.indicator && (
                        <span className="w-2.5 h-2.5 bg-red-500 border-2 border-primary-darker rounded-full animate-pulse"></span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Dynamic Light Mode / Dark Mode Toggle inside sidebar */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest font-mono">Appearance</p>
              <button
                onClick={handleToggleTheme}
                className={`w-full text-left px-5 py-3.5 rounded-xl font-display font-semibold uppercase tracking-wider text-xs transition-all duration-300 border flex items-center justify-between ${isDark
                  ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 border-slate-200/60'
                  }`}
              >
                <span className="flex items-center gap-3">
                  {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
                <span className="text-[9px] opacity-60 font-mono">Theme</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest font-mono">Operations</p>
              <nav className="space-y-2">
                <Link
                  href="/book-session"
                  className="flex items-center justify-center gap-2 block text-center px-5 py-3 rounded-xl border border-accent/30 text-accent hover:bg-accent/10 text-xs font-bold font-display uppercase tracking-widest transition"
                >
                  <PlusIcon size={14} />
                  Book Session Spot
                </Link>
              </nav>
            </div>
          </div>

          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/')
            }}
            className="flex items-center gap-3 w-full text-left px-5 py-3 rounded-xl text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-xs font-bold font-display uppercase tracking-widest transition"
          >
            <ExitIcon size={16} />
            Exit Platform
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-h-screen flex flex-col p-6 sm:p-12 overflow-x-hidden">
          {/* Header Mobile Toggle */}
          <div className="flex md:hidden items-center justify-between mb-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`w-12 h-12 border rounded-2xl flex items-center justify-center transition ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
              aria-label="Open sidebar"
            >
              <MenuIcon size={20} />
            </button>
            <span className="font-display uppercase tracking-widest text-accent text-xs font-bold">PhysiFit Member Dashboard</span>
          </div>

          {activeTab === 'overview' && (
            <ScrollReveal className="space-y-12">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/10">
                <div>
                  <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">PhysiFit Wellness Platform</span>
                  <h1 className={`text-4xl sm:text-5xl font-extrabold uppercase font-display tracking-tight mt-2 leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Welcome Back, {user?.fullName?.split(' ')[0] || 'Amaka'}
                  </h1>
                  <p className={`mt-2 text-sm max-w-xl ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Your daily wellness analytics, recovery vitals, and structured exercise plans are loaded below.
                  </p>
                </div>
                {fitnessPlansList.length > 0 && (
                  <button
                    onClick={() => {
                      setShowWorkoutPlayer(true)
                      setWorkoutSuccess(false)
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent to-accent-light text-primary-darker hover:scale-105 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 shadow-xl shadow-accent/20 border-2 border-accent/20"
                  >
                    <VideoIcon size={14} className="fill-current" />
                    Launch Workout Player
                  </button>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: 'Total Sessions Scheduled', val: totalSessions, sub: 'Assigned plans' },
                  { label: 'Completed Sessions', val: completedSessions, sub: `${completionPercentage}% Compliance`, highlighted: true },
                  { label: 'Upcoming Training', val: upcomingSessions, sub: sessions.find(s => s.status === 'upcoming')?.scheduledAt ? formatDateTime(sessions.find(s => s.status === 'upcoming')!.scheduledAt) : 'None pending' },
                  { label: 'Assessment / Missed', val: missedSessions + assessmentSessions, sub: 'Attendance metric is stable' }
                ].map((card, i) => (
                  <div key={i} className={`rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden transition hover:scale-[1.02] duration-300 ${card.highlighted
                    ? isDark ? 'bg-accent/15 border border-accent/30 text-white' : 'bg-accent/20 border border-accent/30 text-slate-800 shadow-sm'
                    : isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-sm shadow-slate-100'
                    }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block mb-2 ${isDark ? 'text-gray-400' : 'text-slate-400'} truncate`}>{card.label}</span>
                    <p className={`text-3xl sm:text-4xl font-extrabold font-display tracking-tight mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{card.val}</p>
                    <p className="text-[10px] sm:text-xs text-accent font-semibold leading-tight">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Dynamic Zero-Dependency Interactive Progress Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProgressChart
                  data={complianceData}
                  title="Workout Compliance Curve"
                  unit="%"
                  color="#d4a500"
                  dark={isDark}
                />
                <ProgressChart
                  data={stabilityData}
                  title="Balance & Stability Index"
                  unit="%"
                  color="#38bdf8"
                  dark={isDark}
                />
              </div>

              {/* Specialist Bio Card */}
              <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${isDark
                ? 'bg-gradient-to-r from-primary-darker to-[#19154a] border-white/10'
                : 'bg-gradient-to-r from-slate-100 to-slate-200 border-slate-200 text-slate-800 shadow-sm shadow-slate-100'
                }`}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent text-primary-darker flex items-center justify-center font-display font-black text-2xl border border-accent/20 shadow-xl flex-shrink-0">
                      {assignedTrainer?.fullName ? assignedTrainer.fullName.charAt(0) : 'T'}
                    </div>
                    <div>
                      <span className="text-accent text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">Your Assigned Recovery Specialist</span>
                      <h3 className={`text-2xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>{assignedTrainer?.fullName || 'Assigning Certified Specialist'}</h3>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        {assignedTrainer?.specialization ? `${assignedTrainer.specialization.replace(/_/g, ' ')} Specialist` : 'Matching a clinical instructor to your PAR-Q screening data.'}
                      </p>
                      {assignedTrainer && (
                        <span className="inline-flex items-center gap-2 text-xs text-green-400 mt-2 font-semibold animate-pulse">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                          Specialist Online & Active
                        </span>
                      )}
                    </div>
                  </div>
                  {assignedTrainer && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-xl font-bold uppercase tracking-wider text-[11px] text-center transition ${isDark ? 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700'}`}
                      >
                        <ChatIcon size={14} />
                        Text Specialist
                      </button>
                      <button
                        onClick={() => setShowVideoCall(true)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] text-center transition shadow-lg shadow-red-600/10 flex items-center justify-center gap-2 border border-red-500/20"
                      >
                        <VideoIcon size={14} />
                        Video Call Room
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming sessions timeline */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={`text-2xl font-bold font-display uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>Upcoming Program Spots</h2>
                  <button onClick={() => setActiveTab('sessions')} className="text-accent font-bold hover:text-accent-light text-sm">
                    Open Timeline →
                  </button>
                </div>

                <div className={`border rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-slate-100 text-slate-800'}`}>
                  {sessions.filter(s => s.status === 'upcoming').length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className={`font-display text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 border-b border-white/5 text-gray-400' : 'bg-slate-50 border-b border-slate-100 text-slate-500'}`}>
                          <tr>
                            <th className="px-6 py-4 min-w-[160px]">Clinical Program</th>
                            <th className="px-6 py-4 min-w-[160px]">Scheduled Slot</th>
                            <th className="px-6 py-4 min-w-[160px]">Validation Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y text-sm ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                          {sessions
                            .filter(s => s.status === 'upcoming')
                            .slice(0, 3)
                            .map((session) => (
                              <tr key={session.id} className={`transition ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                                <td className="px-6 py-4 font-bold">{session.serviceName || 'Personal Session'}</td>
                                <td className="px-6 py-4">{formatDateTime(session.scheduledAt)}</td>
                                <td className="px-6 py-4">{formatSessionStatus(session.status)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">No upcoming sessions. Book a new wellness slot to schedule.</div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          )}

          {activeTab === 'sessions' && (
            <ScrollReveal className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Scheduling Timeline</span>
                  <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>My Sessions Card</h1>
                </div>
                <Link
                  href="/book-session"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent-light text-primary-darker hover:scale-105 rounded-xl font-bold uppercase tracking-widest text-[11px] transition"
                >
                  <PlusIcon size={14} />
                  Book Wellness Session
                </Link>
              </div>

              <div className={`border rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-slate-100'}`}>
                {sessions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className={`font-display text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 border-b border-white/5 text-gray-400' : 'bg-slate-50 border-b border-slate-100 text-slate-500'}`}>
                        <tr>
                          <th className="px-6 py-4 min-w-[160px]">Service Package</th>
                          <th className="px-6 py-4 min-w-[160px]">Date & Time Slot</th>
                          <th className="px-6 py-4 min-w-[160px]">Validation Status</th>
                          <th className="px-6 py-4 text-right min-w-[120px]">Controller</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-sm ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {sessions.map((session) => (
                          <tr key={session.id} className={`transition ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <td className="px-6 py-4 font-bold">{session.serviceName}</td>
                            <td className="px-6 py-4">{formatDateTime(session.scheduledAt)}</td>
                            <td className="px-6 py-4">{formatSessionStatus(session.status)}</td>
                            <td className="px-6 py-4 text-right">
                              {(session.status === 'upcoming' || session.status === 'assessment') && (
                                <button
                                  onClick={() => openRescheduleModal(session)}
                                  className="inline-flex items-center gap-2 text-accent hover:text-accent-light font-bold text-xs uppercase tracking-widest border border-accent/20 hover:border-accent/40 bg-accent/5 px-4 py-2 rounded-xl transition"
                                >
                                  <RefreshIcon size={12} />
                                  Reschedule
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-400 text-sm">No scheduled sessions recorded yet. Book a session to get started.</div>
                )}
              </div>
            </ScrollReveal>
          )}

          {activeTab === 'plan' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Prescribed Routine</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>My Fitness Plan</h1>
              </div>

              {fitnessPlansList.length > 0 ? (
                fitnessPlansList.map((plan) => (
                  <div key={plan.id} className="space-y-8">
                    <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-slate-100'}`}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
                      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                        <div>
                          <h2 className="text-2xl font-bold font-display uppercase">Active Recovery Prescription</h2>
                          <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-1">Generated: {new Date(plan.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="rounded-full bg-accent/20 border border-accent/30 px-4 py-1.5 text-accent text-xs font-bold uppercase tracking-wider">
                            Active Plan
                          </span>
                          <button
                            onClick={() => {
                              setShowWorkoutPlayer(true)
                              setWorkoutSuccess(false)
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-accent text-primary-darker hover:bg-accent-dark rounded-xl font-bold uppercase tracking-wider text-xs transition"
                          >
                            <VideoIcon size={12} className="fill-current" />
                            Start Workout
                          </button>
                        </div>
                      </div>

                      {plan.notes && (
                        <div className={`rounded-2xl border p-6 mb-8 ${isDark ? 'bg-accent/5 border-accent/15 text-gray-300' : 'bg-accent/10 border-accent/20 text-slate-700'}`}>
                          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-2 font-display">Specialist Clinical Notes & Guidelines:</p>
                          <p className="text-sm italic leading-relaxed">"{plan.notes}"</p>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                          <thead>
                            <tr className={`text-[10px] uppercase tracking-widest font-display ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                              <th className="px-4 py-2 min-w-[180px]">Clinical Exercise</th>
                              <th className="px-4 py-2 min-w-[120px]">Prescribed Sets</th>
                              <th className="px-4 py-2 min-w-[120px]">Target Reps</th>
                              <th className="px-4 py-2 min-w-[120px]">Target Focus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plan.exercises.map((ex, index) => (
                              <tr key={`${ex.name}-${index}`} className={`transition border rounded-2xl ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}>
                                <td className="px-4 py-4 font-bold rounded-l-2xl">{ex.name}</td>
                                <td className="px-4 py-4 font-medium">{ex.sets} sets</td>
                                <td className="px-4 py-4 font-medium">{ex.reps} reps</td>
                                <td className="px-4 py-4 rounded-r-2xl">
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase whitespace-nowrap ${getFocusClass(ex.focus)}`}>
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
                <div className={`border rounded-3xl p-12 text-center shadow-2xl max-w-2xl mx-auto ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800'}`}>
                  <div className="flex justify-center text-accent mb-6">
                    <FitnessPlanIcon size={48} />
                  </div>
                  <h3 className="text-xl font-bold font-display uppercase tracking-widest text-accent mb-2">Prescription Under Review</h3>
                  <p className={`text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Following your initial Physical Assessment session, your Recovery Specialist will structure and upload your tailored therapeutic program here. Keep a look out!
                  </p>
                </div>
              )}
            </ScrollReveal>
          )}

          {activeTab === 'messages' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Secure Communications</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Specialist Consultation Chat</h1>
              </div>

              {threads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[550px] items-stretch">
                  {/* Threads List */}
                  <div className={`md:col-span-1 border rounded-3xl p-6 shadow-2xl flex flex-col justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800'
                    } ${mobileChatActive ? 'hidden md:flex' : 'flex'
                    }`}>
                    <div>
                      <h3 className="font-display font-bold text-xs uppercase tracking-widest mb-6 pb-2 border-b border-white/5">Conversations</h3>
                      <div className="space-y-3 overflow-y-auto max-h-[400px]">
                        {threads.map((t) => (
                          <div
                            key={t.thread_id}
                            onClick={() => {
                              setActiveThreadId(t.thread_id)
                              setMobileChatActive(true)
                            }}
                            className={`p-4 rounded-2xl cursor-pointer transition border-2 ${t.thread_id === activeThreadId
                              ? 'bg-accent/15 border-accent shadow-lg shadow-accent/5'
                              : isDark ? 'bg-white/5 hover:bg-white/10 border-white/5' : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className={`font-bold text-sm font-display uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.other_user_name}</p>
                              {t.unread_count > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  {t.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{t.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Chat */}
                  <div className={`md:col-span-2 border rounded-3xl flex flex-col shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800'
                    } ${mobileChatActive ? 'flex' : 'hidden md:flex'
                    }`}>
                    {activeThread ? (
                      <>
                        <div className="border-b border-white/10 p-6 flex justify-between items-center gap-4 bg-white/5">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setMobileChatActive(false)}
                              className={`p-2 rounded-xl text-xs font-bold transition ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}
                            >
                              ← Back
                            </button>
                            <div>
                              <h3 className="font-display font-bold uppercase tracking-wider">{activeThread.other_user_name}</h3>
                              <p className="text-[10px] text-accent font-bold uppercase tracking-widest mt-0.5">Clinical Wellness Specialist</p>
                            </div>
                          </div>

                          <button
                            onClick={() => setShowVideoCall(true)}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition flex items-center gap-2 border border-red-500/20"
                          >
                            <VideoIcon size={12} />
                            Live Session
                          </button>
                        </div>

                        {/* Pulsing Live Invitation banner */}
                        <div className="bg-red-600/10 border-b border-red-500/20 px-6 py-3.5 flex items-center justify-between text-xs text-red-200">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span>Live Consultation Room is Active. Join now!</span>
                          </div>
                          <button
                            onClick={() => setShowVideoCall(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition"
                          >
                            Join Consultation
                          </button>
                        </div>

                        {/* Chat Messages */}
                        <div className={`flex-1 p-6 space-y-4 overflow-y-auto max-h-[350px] ${isDark ? 'bg-[#0c0a27]/30' : 'bg-slate-50/50'}`}>
                          {activeMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-[70%]">
                                <div
                                  className={`rounded-2xl px-5 py-3.5 text-sm shadow-md leading-relaxed ${msg.senderId === user?.id
                                    ? 'bg-accent text-primary-darker rounded-tr-none font-medium'
                                    : isDark ? 'bg-white/5 border border-white/10 text-white rounded-tl-none' : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                                    }`}
                                >
                                  {msg.body}
                                </div>
                                <p className={`text-[9px] text-gray-400 mt-1 font-mono tracking-wider ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                                  {formatDateTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={activeMessagesEndRef} />
                        </div>

                        {/* Send Area */}
                        <div className="border-t border-white/10 p-6 bg-white/5">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder={`Secure reply to ${activeThread.other_user_name}...`}
                              className={`flex-1 border rounded-2xl px-5 py-3.5 focus:outline-none text-sm ${isDark ? 'border-white/10 focus:border-accent bg-[#0c0a27]/50 text-white' : 'border-slate-200 focus:border-accent bg-white text-slate-800'}`}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={sendingMessage || !messageText.trim()}
                              className="bg-accent text-primary-darker hover:bg-accent-dark w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/20"
                            >
                              ↑
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400 text-sm">
                        Select a conversation thread to view communications.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`border rounded-3xl p-12 text-center shadow-2xl max-w-2xl mx-auto ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-center text-accent mb-6">
                    <ChatIcon size={48} />
                  </div>
                  <h3 className="text-xl font-bold font-display uppercase tracking-widest text-accent mb-2">No active communications</h3>
                  <p className={`text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Once a clinical Recovery Specialist is matched to your PAR-Q screening profile, a secure communication channel will open automatically right here.
                  </p>
                </div>
              )}
            </ScrollReveal>
          )}

          {activeTab === 'settings' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">
                  Account Controls
                </span>

                <h1
                  className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'
                    }`}
                >
                  Account Settings
                </h1>

                <p
                  className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'
                    }`}
                >
                  Manage your profile, preferences, security settings and account details.
                </p>
              </div>

              {/* Profile Overview */}
              <div
                className={`rounded-3xl p-8 shadow-2xl border ${isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-4xl font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>

                  <div className="flex-1">
                    <h2
                      className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'
                        }`}
                    >
                      {user?.fullName || 'User'}
                    </h2>

                    <p
                      className={`mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'
                        }`}
                    >
                      {user?.email || 'No email available'}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={() => {
                          setEditFullName(user?.fullName || '')
                          setEditPhone(user?.phone || '')
                          setEditWeightKg(profile?.weightKg ?? '')
                          setEditHeightCm(profile?.heightCm ?? '')
                          setEditMedicalNotes(profile?.medicalNotes || '')
                          setEditProfileError('')
                          setShowEditProfileModal(true)
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-primary-darker font-bold text-sm"
                      >
                        <UserIcon size={14} />
                        Edit Profile
                      </button>

                      <button
                        onClick={() => {
                          setCurrentPassword('')
                          setNewPassword('')
                          setConfirmPassword('')
                          setChangePasswordError('')
                          setShowChangePasswordModal(true)
                        }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl border font-bold text-sm ${isDark
                          ? 'border-white/10 text-white'
                          : 'border-slate-200 text-slate-700'
                          }`}
                      >
                        <LockIcon size={14} />
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div
                className={`rounded-3xl p-8 shadow-2xl border ${isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <h3 className="text-xl font-bold mb-6">
                  Personal Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <InfoCard
                    label="Full Name"
                    value={user?.fullName || 'Not provided'}
                  />

                  <InfoCard
                    label="Email Address"
                    value={user?.email || 'Not provided'}
                  />

                  <InfoCard
                    label="Phone Number"
                    value={
                      profile?.phoneNumber ||
                      profile?.phone ||
                      user?.phone ||
                      'Not provided'
                    }
                  />

                  <InfoCard
                    label="Gender"
                    value={profile?.gender || 'Not provided'}
                  />

                  <InfoCard
                    label="Date of Birth"
                    value={profile?.dateOfBirth || 'Not provided'}
                  />

                  <InfoCard
                    label="Assigned Specialist"
                    value={
                      assignedTrainer?.fullName ||
                      'No specialist assigned'
                    }
                  />
                </div>
              </div>

              {/* Trainer Information */}
              {assignedTrainer && (
                <div
                  className={`rounded-3xl p-8 shadow-2xl border ${isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-slate-200'
                    }`}
                >
                  <h3 className="text-xl font-bold mb-6">
                    Recovery Specialist
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <InfoCard
                      label="Specialist Name"
                      value={assignedTrainer.fullName}
                    />

                    <InfoCard
                      label="Specialization"
                      value={
                        assignedTrainer.specialization ||
                        'General Physiotherapy'
                      }
                    />
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div
                className={`rounded-3xl p-8 shadow-2xl border ${isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <h3 className="text-xl font-bold mb-6">
                  Preferences
                </h3>

                <div className="space-y-5">
                  <label className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <input type="checkbox" defaultChecked />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>SMS Notifications</span>
                    <input type="checkbox" />
                  </label>

                  <label className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={handleToggleTheme}
                    />
                  </label>
                </div>
              </div>

              {/* Account Statistics */}
              <div
                className={`rounded-3xl p-8 shadow-2xl border ${isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <h3 className="text-xl font-bold mb-6">
                  Account Summary
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <InfoCard
                    label="Total Sessions"
                    value={`${sessions.length}`}
                  />

                  <InfoCard
                    label="Fitness Plans"
                    value={`${fitnessPlansList.length}`}
                  />

                  <InfoCard
                    label="Unread Messages"
                    value={`${threads.reduce(
                      (acc, t) => acc + t.unread_count,
                      0
                    )}`}
                  />
                </div>
              </div>

              {/* Contact Support */}
              <div
                className={`rounded-3xl p-8 shadow-2xl border ${isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
                  }`}
              >
                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/5">
                  <ChatIcon size={20} className="text-accent" />
                  <h3 className="text-xl font-bold">Contact PhysiFit Support</h3>
                </div>

                {supportSuccess ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                    <p className="text-green-400 font-bold text-sm mb-2">Message Sent Successfully!</p>
                    <p className="text-xs text-gray-400 mb-4">Our administrative support team will review your ticket and reach out via email shortly.</p>
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
                          className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent ${isDark ? 'border-white/10 bg-[#0a0f1d] text-white' : 'border-slate-250 bg-white text-slate-800'
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
                          className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent ${isDark ? 'border-white/10 bg-[#0a0f1d] text-white' : 'border-slate-250 bg-white text-slate-800'
                            }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Message</label>
                      <textarea
                        placeholder="How can we help you? Describe your issue or question..."
                        value={supportMsg}
                        onChange={(e) => setSupportMsg(e.target.value)}
                        required
                        rows={4}
                        className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent ${isDark ? 'border-white/10 bg-[#0a0f1d] text-white' : 'border-slate-250 bg-white text-slate-800'
                          }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={supportSubmitting}
                      className="w-full bg-accent text-slate-950 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition duration-300 font-display shadow-lg shadow-accent/10 disabled:opacity-40"
                    >
                      {supportSubmitting ? 'Sending Request...' : 'Send Message to Support'}
                    </button>
                  </form>
                )}
              </div>

              {/* Danger Zone */}
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
                <h3 className="text-red-500 text-xl font-bold">
                  Danger Zone
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Delete your account permanently. This action cannot be undone.
                </p>

                <button
                  onClick={() => {
                    setDeleteConfirmText('')
                    setDeleteError('')
                    setDeleteSubmitting(false)
                    setShowDeleteAccountModal(true)
                  }}
                  className="mt-5 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Delete Account
                </button>
              </div>
            </ScrollReveal>
          )}

        </main>
      </div>

      {/* Workout success celebration modal overlay */}
      {workoutSuccess && (
        <div className="fixed inset-0 bg-primary-darker/95 z-[110] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-gradient-to-b from-[#181549] to-primary-darker border border-accent/20 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex justify-center mb-6">
              <TrophyIcon size={64} className="text-accent animate-bounce" />
            </div>
            <span className="text-accent text-[10px] font-bold uppercase tracking-[0.25em]">Session Verified</span>
            <h2 className="text-3xl font-bold font-display uppercase tracking-tight text-white mt-2 mb-4 leading-none">Workout Logged!</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              Fantastic work! Your exercise completion has been checked off and synchronized with your Wellness Compliance records.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 font-display">Daily Progress Indicators:</p>
              <div className="flex justify-between text-xs py-1">
                <span className="text-gray-300">Vitals Stability:</span>
                <span className="text-green-400 font-bold">+5% Gain</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-gray-300">Weekly Compliance:</span>
                <span className="text-accent font-bold">+8% Up</span>
              </div>
            </div>
            <button
              onClick={() => setWorkoutSuccess(false)}
              className="w-full py-3.5 bg-accent text-primary-darker hover:bg-accent-dark rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 shadow-xl shadow-accent/10"
            >
              Continue Dashboard Cockpit
            </button>
          </div>
        </div>
      )}

      {/* Interactive Workout Player */}
      {showWorkoutPlayer && fitnessPlansList.length > 0 && (
        <WorkoutPlayer
          exercises={fitnessPlansList[0].exercises}
          onClose={() => setShowWorkoutPlayer(false)}
          onComplete={handleWorkoutComplete}
        />
      )}

      {/* Simulated Premium Video Consultation Call Overlay Modal */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-primary-darker/95 z-[120] flex flex-col justify-between p-6 sm:p-12 text-white animate-fade-in">
          {/* Call Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest mb-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                Secure Telehealth Session
              </span>
              <h2 className="text-xl sm:text-2xl font-bold uppercase font-display tracking-wider">
                Live Wellness Consultation Room
              </h2>
            </div>
            <span className="text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-full font-mono text-gray-400">
              Room ID: {activeThreadId?.slice(0, 8) || 'clinical-tele-room'}
            </span>
          </div>

          {/* Video streams arena */}
          <div className="flex-1 my-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto w-full">
            {/* Trainer Video stream - large simulated active frame */}
            <div className="bg-white/5 border border-white/10 rounded-3xl aspect-video relative overflow-hidden flex flex-col items-center justify-center p-8 shadow-2xl h-full min-h-[260px]">
              <div className="absolute top-4 left-4 bg-primary-darker/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase text-accent border border-accent/20 z-10">
                Recovery Specialist (Active)
              </div>

              {/* Pulsating premium therapeutic specializer icon placeholder */}
              <div className="w-24 h-24 rounded-full bg-accent/15 border-2 border-accent flex items-center justify-center font-display font-black text-4xl text-accent animate-pulse mb-4 shadow-xl">
                {assignedTrainer?.fullName ? assignedTrainer.fullName.charAt(0) : 'T'}
              </div>
              <p className="font-display font-bold uppercase tracking-wider text-white text-lg">{assignedTrainer?.fullName || 'Clinical Instructor'}</p>
              <p className="text-xs text-gray-400 mt-1 italic">"Adjusting focus sequence to support balance indexes..."</p>

              {/* Pulsing signal waveform */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1">
                <span className="w-1 h-3 bg-accent rounded-full animate-pulse"></span>
                <span className="w-1 h-5 bg-accent rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-2 bg-accent rounded-full animate-pulse delay-150"></span>
                <span className="w-1 h-4 bg-accent rounded-full animate-pulse delay-300"></span>
              </div>
            </div>

            {/* Client Video stream - standard feed / camera hook */}
            <div className="bg-white/5 border border-white/10 rounded-3xl aspect-video relative overflow-hidden flex flex-col items-center justify-center shadow-2xl h-full min-h-[260px]">
              <div className="absolute top-4 left-4 bg-primary-darker/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase text-gray-300 border border-white/10 z-10 animate-pulse">
                My Webcam {camOff ? '(Camera disabled)' : '(Streaming Live)'}
              </div>

              {!camOff ? (
                /* Native HTML5 video component streaming user camera! */
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100 absolute inset-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center font-bold text-gray-500 text-3xl mb-4">
                    <CameraOffIcon size={32} className="text-gray-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">Camera Stream Blocked</p>
                  <p className="text-[10px] text-gray-500 mt-1">Check system permissions or toggle camera controls.</p>
                </div>
              )}
            </div>
          </div>

          {/* Call Controllers panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-6">
            <div className="flex gap-4">
              <button
                onClick={() => setMicMuted(m => !m)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-bold text-xs uppercase tracking-wider transition ${micMuted
                  ? 'bg-red-500/20 border-red-500 text-red-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  }`}
              >
                <span className="flex flex-col items-center gap-1">
                  {micMuted ? <MicOffIcon size={20} /> : <MicIcon size={20} />}
                  <span className="text-[9px] lowercase tracking-wider mt-0.5">{micMuted ? 'Muted' : 'On'}</span>
                </span>
              </button>
              <button
                onClick={() => setCamOff(c => !c)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-bold text-xs uppercase tracking-wider transition ${camOff
                  ? 'bg-red-500/20 border-red-500 text-red-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  }`}
              >
                <span className="flex flex-col items-center gap-1">
                  {camOff ? <CameraOffIcon size={20} /> : <CameraIcon size={20} />}
                  <span className="text-[9px] lowercase tracking-wider mt-0.5">{camOff ? 'Off' : 'On'}</span>
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                setShowVideoCall(false)
                if (stream) {
                  stream.getTracks().forEach(track => track.stop())
                }
                setStream(null)
                if (videoRef.current) {
                  videoRef.current.srcObject = null
                }
              }}
              className="flex items-center gap-2 px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs rounded-2xl transition shadow-xl shadow-red-600/25 border border-red-500/20"
            >
              <CloseIcon size={14} />
              Disconnect Consultation Session
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Session Modal */}
      {showRescheduleModal && rescheduleTargetSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowRescheduleModal(false)}>
          <div
            className="bg-[#181549] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-white/5 border-b border-white/5 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/20 text-accent">
                <RefreshIcon size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Reschedule Wellness Spot</h3>
                <p className="text-[10px] text-accent uppercase tracking-widest">Adjust schedule details</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 text-left">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Target Session</p>
                <p className="font-bold text-white font-display uppercase tracking-wider">{rescheduleTargetSession.serviceName}</p>
                <p className="text-xs text-accent font-semibold">{formatDateTime(rescheduleTargetSession.scheduledAt)}</p>
              </div>

              <div className="bg-accent/10 border-l-4 border-accent rounded p-3 text-[11px] text-accent leading-relaxed">
                <strong>Attention:</strong> Rescheduling a session must be done at least 24 hours before the fixed target time.
              </div>

              {rescheduleError && (
                <div className="bg-red-500/25 border-l-4 border-red-500 text-red-200 p-3 rounded text-xs font-semibold leading-relaxed flex items-start gap-2">
                  <AlertIcon size={14} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{rescheduleError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">New Date</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">New Time</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Adjustment Reason</label>
                <textarea
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Describe your schedule adjustment reason..."
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-600 bg-[#0c0a27]/50 text-white resize-none"
                  maxLength={500}
                />
                <p className="text-[9px] text-gray-500 mt-1 text-right font-mono">{rescheduleReason.length}/500</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
              <button
                onClick={() => { setShowRescheduleModal(false); setRescheduleTargetSession(null) }}
                className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest font-display"
                disabled={rescheduleSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSession}
                disabled={rescheduleSubmitting || !rescheduleDate || !rescheduleTime}
                className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-primary-darker rounded-xl transition text-xs font-bold uppercase tracking-widest font-display disabled:opacity-40"
              >
                {rescheduleSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowEditProfileModal(false)}>
          <div
            className="bg-[#181549] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/5 border-b border-white/5 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/20 text-accent">
                <UserIcon size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Edit Profile</h3>
                <p className="text-[10px] text-accent uppercase tracking-widest">Update your personal information</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 text-left">
              {editProfileError && (
                <div className="bg-red-500/25 border-l-4 border-red-500 text-red-200 p-3 rounded text-xs font-semibold leading-relaxed flex items-start gap-2">
                  <AlertIcon size={14} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{editProfileError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                  placeholder="Enter phone number"
                />
              </div>

              {user?.role === 'client' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Weight (kg)</label>
                      <input
                        type="number"
                        value={editWeightKg}
                        onChange={(e) => setEditWeightKg(e.target.value !== '' ? Number(e.target.value) : '')}
                        className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                        placeholder="e.g. 70"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Height (cm)</label>
                      <input
                        type="number"
                        value={editHeightCm}
                        onChange={(e) => setEditHeightCm(e.target.value !== '' ? Number(e.target.value) : '')}
                        className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                        placeholder="e.g. 175"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Medical Notes</label>
                    <textarea
                      rows={3}
                      value={editMedicalNotes}
                      onChange={(e) => setEditMedicalNotes(e.target.value)}
                      placeholder="List any medical history, allergies, physical constraints..."
                      className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-600 bg-[#0c0a27]/50 text-white resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest font-display"
                disabled={editProfileSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editProfileSubmitting || !editFullName.trim()}
                className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-primary-darker rounded-xl transition text-xs font-bold uppercase tracking-widest font-display disabled:opacity-40"
              >
                {editProfileSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowChangePasswordModal(false)}>
          <div
            className="bg-[#181549] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/5 border-b border-white/5 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/20 text-accent">
                <LockIcon size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Change Password</h3>
                <p className="text-[10px] text-accent uppercase tracking-widest">Update your login security credentials</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 text-left">
              {changePasswordError && (
                <div className="bg-red-500/25 border-l-4 border-red-500 text-red-200 p-3 rounded text-xs font-semibold leading-relaxed flex items-start gap-2">
                  <AlertIcon size={14} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                  placeholder="•••••••• (min 8 chars)"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-[#0c0a27]/50 text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest font-display"
                disabled={changePasswordSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changePasswordSubmitting || !currentPassword || !newPassword || !confirmPassword}
                className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-primary-darker rounded-xl transition text-xs font-bold uppercase tracking-widest font-display disabled:opacity-40"
              >
                {changePasswordSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowDeleteAccountModal(false)}>
          <div
            className="bg-[#181549] border border-red-500/20 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-950/20 border-b border-red-500/10 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500">
                <AlertIcon size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Delete Account</h3>
                <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold">This action is irreversible</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 text-left">
              <p className="text-sm text-gray-300 leading-relaxed">
                Are you absolutely sure you want to delete your account? This will permanently erase your profile, recovery timeline index, and clinic fitness plan data.
              </p>

              {deleteError && (
                <div className="bg-red-500/25 border-l-4 border-red-500 text-red-200 p-3 rounded text-xs font-semibold leading-relaxed flex items-start gap-2">
                  <AlertIcon size={14} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-display">
                  Type <span className="text-red-400 font-mono font-bold bg-red-500/10 px-1.5 py-0.5 rounded">DELETE</span> below to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-[#0c0a27]/50 text-white font-mono uppercase tracking-widest"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest font-display"
                disabled={deleteSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteSubmitting || deleteConfirmText !== 'DELETE'}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition text-xs font-bold uppercase tracking-widest font-display disabled:opacity-40"
              >
                {deleteSubmitting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
