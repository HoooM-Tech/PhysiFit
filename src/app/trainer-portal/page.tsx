'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ScrollReveal from '@/components/ScrollReveal'
import { useTheme } from '@/context/ThemeContext'
import {
  CloseIcon,
  UserIcon,
  CalendarIcon,
  FitnessPlanIcon,
  ChatIcon,
  SunIcon,
  MoonIcon,
  ExitIcon,
  MenuIcon,
  AlertIcon,
  RefreshIcon,
  MicOffIcon,
  MicIcon,
  CameraOffIcon,
  CameraIcon,
  SettingsIcon,
  LockIcon,
  TrashIcon,
} from '@/components/Icons'

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
  const [activeTab, setActiveTab] = useState<'clients' | 'today' | 'messages' | 'plans' | 'settings'>('clients')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileChatActive, setMobileChatActive] = useState(false)

  // Theme state
  const { theme, toggleTheme } = useTheme()
  
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

  // Simulated WebRTC Telehealth States
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // PAR-Q Screening AI Workout Builder States
  const [aiLoading, setAiLoading] = useState(false)
  const [aiStep, setAiStep] = useState(0)
  const [aiResult, setAiResult] = useState<any>(null)

  // Settings — Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editProfileSubmitting, setEditProfileSubmitting] = useState(false)
  const [editProfileError, setEditProfileError] = useState('')

  // Settings — Change Password States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changePasswordSubmitting, setChangePasswordSubmitting] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState('')

  // Settings — Delete Account States
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Settings — Support Form State
  const [supportName, setSupportName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [supportMsg, setSupportMsg] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportSuccess, setSupportSuccess] = useState(false)

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

        // Populate settings edit profile values
        setEditFullName(user?.fullName || '')
        setEditPhone(user?.phone || '')
        setSupportName(user?.fullName || '')
        setSupportEmail(user?.email || '')

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

  // Camera stream activation for WebRTC simulated telehealth video consultation
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
    let existingThread = threads.find(t => t.other_user_id === clientId)
    
    if (existingThread) {
      setActiveThreadId(existingThread.thread_id)
      setActiveTab('messages')
      setMobileChatActive(true)
    } else {
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
    setAiResult(null)
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

  // Settings — Support submit handler
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMsg.trim()) return
    setSupportSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setSupportSubmitting(false)
    setSupportSuccess(true)
    setSupportMsg('')
  }

  // Settings — Save profile handler
  const handleSaveProfile = async () => {
    setEditProfileSubmitting(true)
    setEditProfileError('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          phone: editPhone.trim() || null,
        }),
      })
      if (res.ok) {
        const userRes = await fetch('/api/users/me')
        if (userRes.ok) {
          const userJson = await userRes.json()
          setTrainerUser(userJson.data?.user)
        }
        setShowEditProfileModal(false)
      } else {
        const json = await res.json()
        setEditProfileError(json.error?.message || 'Failed to update profile.')
      }
    } catch {
      setEditProfileError('An error occurred. Please try again.')
    } finally {
      setEditProfileSubmitting(false)
    }
  }

  // Settings — Change password handler
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
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
    } catch {
      setChangePasswordError('An error occurred. Please try again.')
    } finally {
      setChangePasswordSubmitting(false)
    }
  }

  // Settings — Delete account handler
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
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
      } else {
        setDeleteError('Failed to delete account. Please try again.')
      }
    } catch {
      setDeleteError('An error occurred. Please try again.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  // Theme Toggle
  const handleToggleTheme = toggleTheme

  // Date Formatting helper
  const formatDateTime = (dtStr: string) => {
    try {
      const dt = new Date(dtStr)
      return dt.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dtStr
    }
  }

  // Simulated AI Core Screener Analyzer
  const handleTriggerAIWorkoutAssistant = () => {
    const selectedClient = clients.find(c => c.id === planClientId)
    if (!selectedClient) return

    setAiLoading(true)
    setAiStep(0)
    setAiResult(null)

    // Simulate multi-stage AI diagnostic screening
    const interval = setInterval(() => {
      setAiStep(prev => {
        if (prev < 3) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 1200)

    setTimeout(() => {
      // Analyze medical notes keywords to yield customized senior-rehabilitation programs
      const notes = (selectedClient.medicalNotes || '').toLowerCase()
      let generatedPlan: any = null

      if (notes.includes('fall') || notes.includes('dizziness') || notes.includes('balance') || notes.includes('vertigo')) {
        generatedPlan = {
          notes: "AI Recommended: Stability and balance-focused program to combat vertigo/fall records. Rest 45s between sets. Focus on safe footing.",
          exercises: [
            { name: "Single-Leg Stance (Near Wall Support)", sets: 3, reps: 10, focus: 'balance' },
            { name: "Tandem Heel-to-Toe Walking Sequence", sets: 3, reps: 12, focus: 'balance' },
            { name: "Seated Chair Leg Extensions", sets: 3, reps: 10, focus: 'mobility' },
            { name: "Gentle Core Glute Bridge Lift", sets: 3, reps: 8, focus: 'core' }
          ]
        }
      } else if (notes.includes('joint') || notes.includes('arthritis') || notes.includes('knee') || notes.includes('back')) {
        generatedPlan = {
          notes: "AI Recommended: Low-impact joint-sparing strength and mobility routine. Avoid heavy loading. Emphasize full ROM smoothly.",
          exercises: [
            { name: "Seated Chair Wall Sit (Hovering)", sets: 3, reps: 8, focus: 'strength' },
            { name: "Supported Standing Clamshell Exercises", sets: 3, reps: 12, focus: 'mobility' },
            { name: "Gentle Standing Calf Raises", sets: 3, reps: 15, focus: 'balance' },
            { name: "Pelvic Tilts for Spine Mobilization", sets: 3, reps: 10, focus: 'core' }
          ]
        }
      } else if (notes.includes('heart') || notes.includes('hypertension') || notes.includes('cardio') || notes.includes('pressure')) {
        generatedPlan = {
          notes: "AI Recommended: Gentle low-intensity cardiovascular vitals routine. Monitor heart rate closely. Allow longer active rest phases.",
          exercises: [
            { name: "Seated Chair Marching (Paced rhythm)", sets: 3, reps: 20, focus: 'cardio' },
            { name: "Wall Assisted Angled Pushups", sets: 3, reps: 10, focus: 'strength' },
            { name: "Chair Stepping Side Jacks", sets: 3, reps: 15, focus: 'cardio' },
            { name: "Gentle Torso Twists for Balance Check", sets: 3, reps: 10, focus: 'balance' }
          ]
        }
      } else {
        generatedPlan = {
          notes: "AI Recommended: Standard Senior Wellness & Balance baseline routine. Maintain a smooth and steady breathing pace.",
          exercises: [
            { name: "Chair Squats with Hand Guidance", sets: 3, reps: 10, focus: 'strength' },
            { name: "Wall Slide Arm Raises (Shoulder Mobility)", sets: 3, reps: 12, focus: 'mobility' },
            { name: "Single-Leg Stance Balance Hold", sets: 3, reps: 10, focus: 'balance' },
            { name: "Seated Core Core Draw-Ins", sets: 3, reps: 12, focus: 'core' }
          ]
        }
      }

      setAiResult(generatedPlan)
      setAiLoading(false)
    }, 4800)
  }

  const handleLoadAIPlan = () => {
    if (!aiResult) return
    setPlanNotes(aiResult.notes)
    setPlanExercises(aiResult.exercises)
    setAiResult(null)
  }

  const activeThread = threads.find(t => t.thread_id === activeThreadId)
  const isDark = theme === 'dark'
  const optionClass = isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'

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
      <div className={`min-h-screen flex flex-col justify-between ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Header />
        <div className={`flex-1 flex flex-col items-center justify-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
          <div className="animate-spin inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full mb-6"></div>
          <p className="font-display uppercase tracking-widest text-accent text-sm animate-pulse">Syncing Trainer Credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-[#101625] to-[#1c283f] text-white'
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 text-slate-900'
    }`}>
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
          className={`fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 z-50 w-72 backdrop-blur-xl border-r p-8 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden ${
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
              <span className={`text-xl font-display uppercase tracking-widest font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                PhysiFit <span className="text-accent font-extrabold">Trainer</span>
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`md:hidden w-8 h-8 rounded-full border flex items-center justify-center transition ${isDark ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-100'}`}
                aria-label="Close sidebar"
              >
                <CloseIcon size={14} />
              </button>
            </div>

            {/* Trainer Profile Card */}
            <div className={`border rounded-2xl p-4 flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/80 border-slate-200'}`}>
              <div className="w-12 h-12 rounded-full bg-accent text-slate-950 flex items-center justify-center font-bold text-lg font-display">
                {trainerUser?.fullName ? trainerUser.fullName.charAt(0) : 'T'}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate">{trainerUser?.fullName || 'Specialist'}</p>
                <span className={`text-[10px] font-mono tracking-wider block uppercase ${isDark ? 'text-accent' : 'text-slate-500'}`}>Certified Instructor</span>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest font-mono">Specialist Desk</p>
              <nav className="space-y-2">
                {[
                  { id: 'clients', label: 'My Assigned Clients' },
                  { id: 'today', label: 'Sessions Timeline' },
                  { id: 'plans', label: 'Plan Builder Panel' },
                  { id: 'messages', label: 'Messages Desk', indicator: threads.some(t => t.unread_count > 0) },
                  { id: 'settings', label: 'Settings' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any)
                      if (window.innerWidth < 768) setSidebarOpen(false)
                    }}
                    className={`w-full text-left px-5 py-3.5 rounded-xl font-display font-semibold uppercase tracking-wider text-xs transition-all duration-300 relative border flex items-center justify-between ${
                      activeTab === tab.id
                        ? 'bg-accent text-slate-950 border-accent shadow-lg shadow-accent/20 scale-[1.02]'
                        : isDark
                          ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
                          : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 border-slate-200/60'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {tab.id === 'clients' && <UserIcon size={16} />}
                      {tab.id === 'today' && <CalendarIcon size={16} />}
                      {tab.id === 'plans' && <FitnessPlanIcon size={16} />}
                      {tab.id === 'messages' && <ChatIcon size={16} />}
                      {tab.id === 'settings' && <SettingsIcon size={16} />}
                      <span>{tab.label}</span>
                    </span>
                    {tab.indicator && (
                      <span className="w-2.5 h-2.5 bg-red-500 border-2 border-slate-950 rounded-full animate-pulse"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

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
            <span>Exit Portal</span>
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
            <span className="font-display uppercase tracking-widest text-accent text-xs font-bold">Trainer Portal</span>
          </div>

          {trainerProfile && !trainerProfile.approvedAt && (
            <div className={`mb-8 border rounded-2xl p-6 text-left flex gap-4 items-center ${isDark ? 'bg-amber-500/10 border-accent/20' : 'bg-amber-50 border-amber-200'}`}>
              <AlertIcon size={24} className="text-accent shrink-0" />
              <div>
                <p className="font-bold text-accent uppercase tracking-wider text-xs font-display">Account Under Administrative Review</p>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                  Your certified instructor profile is pending manual validation by platform administrators. You can build routines, but active clients cannot be matched to you until approval indices sync.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <ScrollReveal className="space-y-10">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Specialist Dashboard</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>My Active Clients</h1>
                <p className={`mt-2 text-sm max-w-xl ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Review matched wellness profiles, check medical screener PAR-Q notes, and publish dynamic physical strategies.
                </p>
              </div>

              {/* Stats Summary Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Assigned Active Clients', val: activeClientsCount, sub: 'Matched program profiles' },
                  { label: 'Completed verified spots', val: completedThisMonth, sub: 'This calendar month', highlighted: true },
                  { label: "Today's timeline spots", val: todayUpcomingSessions.length, sub: 'Verification remaining today' }
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

              {/* Clients Registry Card */}
              <div className={`border rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-slate-100'}`}>
                {clients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className={`font-display text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 border-b border-white/5 text-gray-400' : 'bg-slate-50 border-b border-slate-100 text-slate-500'}`}>
                        <tr>
                          <th className="px-6 py-4 min-w-[200px]">Client Member</th>
                          <th className="px-6 py-4 min-w-[150px]">Clinical Program</th>
                          <th className="px-6 py-4 min-w-[150px]">Completed Spots</th>
                          <th className="px-6 py-4 min-w-[160px]">Next Scheduled Spot</th>
                          <th className="px-6 py-4 text-right min-w-[220px]">Controller Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-sm ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                        {clients.map((client) => (
                          <tr key={client.id} className={`transition ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent/20 border border-accent/30 text-accent rounded-xl flex items-center justify-center font-bold font-display uppercase">
                                  {client.fullName.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-bold block">{client.fullName}</span>
                                  <span className={`text-[10px] block font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{client.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block whitespace-nowrap border px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${isDark ? 'bg-white/5 border-white/10 text-accent' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                                {client.serviceName}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold">
                              {client.completedSessions} of {client.totalSessions} completed
                            </td>
                            <td className={`px-6 py-4 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                              {client.nextSessionDate ? formatDateTime(client.nextSessionDate) : 'Not scheduled'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-3 justify-end">
                                <button
                                  onClick={() => handleMessageClientClick(client.fullName, client.id)}
                                  className={`font-bold text-xs uppercase tracking-widest border px-4 py-2 rounded-xl transition ${isDark ? 'border-white/10 hover:border-accent/40 bg-white/5 text-white' : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'}`}
                                >
                                  <span className="flex items-center gap-1.5 justify-center">
                                    <ChatIcon size={14} />
                                    <span>Chat</span>
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleAssignPlanClick(client.id)}
                                  className="text-slate-950 bg-accent hover:bg-accent-dark font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl transition"
                                >
                                  <span className="flex items-center gap-1.5 justify-center">
                                    <FitnessPlanIcon size={14} />
                                    <span>Build Plan</span>
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-400 text-sm">No matched client profiles assigned to your credential index.</div>
                )}
              </div>
            </ScrollReveal>
          )}

          {activeTab === 'today' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Session Verification</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Timeline Verification</h1>
              </div>

              <div className="space-y-6">
                {sessions.filter(s => s.status === 'upcoming' || s.status === 'assessment').length > 0 ? (
                  sessions
                    .filter(s => s.status === 'upcoming' || s.status === 'assessment')
                    .map((session) => (
                      <div key={session.id} className={`border-l-4 border-accent rounded-3xl p-6 border shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-slate-100 text-slate-800'}`}>
                        <div>
                          <p className="text-sm font-bold text-accent mb-1 font-display tracking-widest uppercase">{formatDateTime(session.scheduledAt)}</p>
                          <p className={`text-2xl font-bold font-display uppercase tracking-wider mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{session.clientName}</p>
                          <p className={`text-xs uppercase tracking-widest font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {session.serviceName} · {session.status === 'assessment' ? 'Physical Assessment' : 'One-on-One Session'}
                          </p>
                        </div>
                        <div className="flex gap-3 w-full lg:w-auto flex-wrap">
                          <button
                            onClick={() => handleMessageClientClick(session.clientName, session.clientId)}
                            className={`flex-1 lg:flex-initial text-center px-5 py-2.5 border rounded-xl text-xs font-bold uppercase tracking-wider transition ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'}`}
                          >
                            <span className="flex items-center gap-1.5 justify-center">
                              <ChatIcon size={14} />
                              <span>Chat</span>
                            </span>
                          </button>
                          <button
                            onClick={() => handleCheckIn(session.id)}
                            disabled={checkingInId === session.id}
                            className="flex-1 lg:flex-initial text-center px-5 py-2.5 bg-accent text-slate-950 font-bold rounded-xl hover:bg-accent-dark transition text-xs uppercase tracking-wider disabled:opacity-40"
                          >
                            {checkingInId === session.id ? 'Verifying...' : (
                              <span className="flex items-center gap-1.5 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>Check In</span>
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => openRescheduleModal(session)}
                            className={`flex-1 lg:flex-initial text-center px-5 py-2.5 border rounded-xl text-xs font-bold uppercase tracking-wider transition ${isDark ? 'border-white/10 hover:border-accent/30 text-accent bg-white/5 hover:bg-accent/5' : 'border-slate-300 hover:border-accent/40 text-accent bg-white hover:bg-slate-50'}`}
                          >
                            <span className="flex items-center gap-1.5 justify-center">
                              <RefreshIcon size={14} />
                              <span>Reschedule</span>
                            </span>
                          </button>
                          <button
                            onClick={() => openCancelModal(session)}
                            className="flex-1 lg:flex-initial text-center px-5 py-2.5 border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                          >
                            <span className="flex items-center gap-1.5 justify-center">
                              <CloseIcon size={14} />
                              <span>Cancel</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className={`border rounded-3xl p-12 text-center text-gray-400 text-sm shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                    No scheduled sessions pending verification today.
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

          {activeTab === 'messages' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Consultation Panel</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Trainer Messaging Desk</h1>
              </div>

              {threads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[550px] items-stretch">
                  {/* Threads List */}
                  <div className={`md:col-span-1 border rounded-3xl p-6 shadow-2xl flex flex-col justify-between ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800'
                  } ${
                    mobileChatActive ? 'hidden md:flex' : 'flex'
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
                            className={`p-4 rounded-2xl cursor-pointer transition border-2 ${
                              t.thread_id === activeThreadId
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
                  <div className={`md:col-span-2 border rounded-3xl flex flex-col shadow-2xl relative overflow-hidden ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800'
                  } ${
                    mobileChatActive ? 'flex' : 'hidden md:flex'
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
                              <p className="text-[10px] text-accent font-bold uppercase tracking-widest mt-0.5">Assigned Client</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setShowVideoCall(true)}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] transition flex items-center gap-2 border border-red-500/20"
                          >
                            📹 Live Session
                          </button>
                        </div>

                        {/* Chat Messages */}
                        <div className={`flex-1 p-6 space-y-4 overflow-y-auto max-h-[350px] ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/50'}`}>
                          {activeMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderId === trainerUser?.id ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-[70%]">
                                <div
                                  className={`rounded-2xl px-5 py-3.5 text-sm shadow-md leading-relaxed ${
                                    msg.senderId === trainerUser?.id
                                      ? 'bg-accent text-slate-950 rounded-tr-none font-medium'
                                      : isDark ? 'bg-white/5 border border-white/10 text-white rounded-tl-none' : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                                  }`}
                                >
                                  {msg.body}
                                </div>
                                <p className={`text-[9px] text-gray-400 mt-1 font-mono tracking-wider ${msg.senderId === trainerUser?.id ? 'text-right' : 'text-left'}`}>
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
                              className={`flex-1 border rounded-2xl px-5 py-3.5 focus:outline-none text-sm ${isDark ? 'border-white/10 focus:border-accent bg-slate-950/50 text-white' : 'border-slate-200 focus:border-accent bg-white text-slate-800'}`}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={sendingMessage || !messageText.trim()}
                              className="bg-accent text-slate-950 hover:bg-accent-dark w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/20"
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
                  <div className="flex justify-center mb-6">
                    <ChatIcon size={48} className="text-accent/60" />
                  </div>
                  <h3 className="text-xl font-bold font-display uppercase tracking-widest text-accent mb-2">No active communications</h3>
                  <p className={`text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Communications will appear automatically here when active program clients establish matched threads.
                  </p>
                </div>
              )}
            </ScrollReveal>
          )}

          {activeTab === 'plans' && (
            <ScrollReveal className="space-y-8">
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Prescriptive builder</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Client Fitness Plans</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Columns: Published Registry */}
                <div className="lg:col-span-6 space-y-6">
                  <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800 shadow-slate-100'}`}>
                    <h3 className="text-lg font-bold font-display uppercase tracking-wider mb-6 pb-2 border-b border-white/5">Published Client Programs</h3>
                    
                    {fitnessPlans.length > 0 ? (
                      <div className="space-y-6 max-h-[650px] overflow-y-auto pr-1">
                        {fitnessPlans.map((plan) => (
                          <div key={plan.id} className={`border rounded-2xl p-5 transition duration-300 ${
                            editingPlanId === plan.id 
                              ? 'border-accent bg-accent/5' 
                              : isDark ? 'border-white/5 bg-[#0b0e17]/40' : 'border-slate-200 bg-slate-50'
                          }`}>
                            <div className="flex justify-between items-start mb-3 pb-3 border-b border-white/5">
                              <div>
                                <h4 className="font-bold text-base font-display uppercase tracking-wider flex items-center gap-2">
                                  <UserIcon size={16} className="text-accent" /> {plan.clientName}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-widest">
                                  Assigned: {new Date(plan.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditPlan(plan)}
                                  className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider transition ${
                                    editingPlanId === plan.id
                                      ? 'bg-accent text-slate-950'
                                      : isDark ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {editingPlanId === plan.id ? (
                                    <span className="flex items-center gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                      Editing
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                      Edit Plan
                                    </span>
                                  )}
                                </button>
                              </div>
                            </div>

                            {plan.notes && (
                              <div className={`mb-4 text-xs p-3 rounded-xl border italic ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                                <span className="font-bold text-accent not-italic block text-[10px] uppercase tracking-wider font-display mb-1">Trainer Guidelines:</span>
                                "{plan.notes}"
                              </div>
                            )}

                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-display">Exercise List ({plan.exercises.length})</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {plan.exercises.map((ex: any, idx: number) => (
                                  <div key={idx} className={`border rounded-xl p-2.5 flex items-center justify-between text-xs ${isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white border-slate-200'}`}>
                                    <div>
                                      <p className="font-bold">{ex.name}</p>
                                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">{ex.sets} Sets x {ex.reps} Reps</p>
                                    </div>
                                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-accent">
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
                      <div className="text-center py-12 text-gray-400 text-sm">No clinical fitness plans published yet. Use the right panel builder.</div>
                    )}
                  </div>
                </div>

                {/* Right Columns: Builder Arena + AI Assistant */}
                <div className="lg:col-span-6 space-y-6" id="plan-builder">
                  {/* AI Assistant Core Screener Card */}
                  {planClientId && (
                    <div className="bg-gradient-to-r from-[#171a2e] to-[#121424] border border-accent/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-accent"
                          >
                            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" />
                            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-white font-display uppercase tracking-wider text-sm">PAR-Q Clinical AI Builder</h4>
                          <span className="text-[10px] text-accent uppercase tracking-widest font-mono">Rehabilitation Assessment</span>
                        </div>
                      </div>

                      {/* Display Screener details */}
                      <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 text-xs space-y-2.5 mb-4 text-left">
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-gray-400">Target Patient:</span>
                          <span className="text-white font-bold">{clients.find(c => c.id === planClientId)?.fullName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-1">PAR-Q Screener Declarations & Symptoms:</span>
                          <p className="text-gray-200 italic leading-relaxed bg-[#0b0d17]/50 p-2.5 rounded-xl border border-white/5">
                            "{clients.find(c => c.id === planClientId)?.medicalNotes || 'No specific screener restrictions declared. Standard safety indexes apply.'}"
                          </p>
                        </div>
                      </div>

                      {aiLoading ? (
                        <div className="bg-slate-950/80 border border-accent/20 rounded-2xl p-6 text-center text-xs space-y-4">
                          <div className="animate-spin inline-block w-8 h-8 border-3 border-accent border-t-transparent rounded-full mb-2"></div>
                          <div className="space-y-1">
                            <p className="font-display font-bold uppercase tracking-wider text-accent">Clinical Diagnostics Active...</p>
                            <p className="text-gray-400 italic">
                              {aiStep === 0 && 'Parsing PAR-Q Medical Screeners & Patient Card...'}
                              {aiStep === 1 && 'Correlating safety margins for balance fall vectors...'}
                              {aiStep === 2 && 'Synthesizing therapeutic exercise list...'}
                              {aiStep >= 3 && 'Validating cardiac and orthopedic ranges...'}
                            </p>
                          </div>
                        </div>
                      ) : aiResult ? (
                        <div className="bg-white/5 border border-accent/20 rounded-2xl p-4 space-y-4 animate-fade-in text-left">
                          <div>
                            <span className="text-[10px] text-accent font-bold uppercase tracking-wider font-display">AI Recommended Strategy:</span>
                            <p className="text-xs text-gray-300 leading-relaxed italic mt-1 bg-slate-950 p-3 rounded-xl border border-white/5">"{aiResult.notes}"</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 font-display">Prescribed Sequences:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {aiResult.exercises.map((ex: any, i: number) => (
                                <div key={i} className="bg-slate-950 border border-white/5 rounded-xl p-2 flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-bold text-white truncate max-w-[120px]">{ex.name}</p>
                                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">{ex.sets}s x {ex.reps}r</p>
                                  </div>
                                  <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-extrabold">{ex.focus}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={handleLoadAIPlan}
                            className="w-full py-2.5 bg-accent text-slate-950 font-bold uppercase tracking-widest text-[10px] rounded-xl transition hover:bg-accent-dark shadow-md shadow-accent/10"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-950"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                              Load Exercises Into Plan Builder
                            </span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleTriggerAIWorkoutAssistant}
                          className="w-full py-3 bg-[#1e234a] hover:bg-[#252c5c] text-accent rounded-xl font-bold uppercase tracking-widest text-[10px] transition border border-accent/30 flex items-center justify-center gap-2 shadow-lg shadow-accent/5"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-accent"
                            >
                              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" />
                              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" />
                            </svg>
                            Analyze Screeners & Auto-Build Routine
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Standard Plans builder Form */}
                  <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${
                    editingPlanId ? 'border-accent shadow-accent/5' : isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                      <h3 className="text-xl font-bold font-display uppercase tracking-wider">
                        {editingPlanId ? (
                          <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            Edit Workout Regimen
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            Fitness Plan Builder
                          </span>
                        )}
                      </h3>
                      <div className="flex gap-2">
                        {editingPlanId && (
                          <button onClick={handleResetPlanForm} className="text-[10px] text-red-400 font-bold uppercase hover:underline">
                            ✕ Cancel
                          </button>
                        )}
                        <button onClick={handleResetPlanForm} className="text-[10px] text-accent font-bold uppercase hover:underline">
                          Reset Form
                        </button>
                      </div>
                    </div>

                    {planSuccessMsg && (
                      <div className="mb-4 bg-green-500/25 border-l-4 border-green-500 text-green-200 p-3 rounded-2xl text-xs font-semibold leading-relaxed">
                        ✓ {planSuccessMsg}
                      </div>
                    )}

                    {planErrorMsg && (
                      <div className="mb-4 bg-red-500/25 border-l-4 border-red-500 text-red-200 p-3 rounded-2xl text-xs font-semibold leading-relaxed">
                        ⚠ {planErrorMsg}
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Select client */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Target Clinical Client</label>
                        <select
                          value={planClientId}
                          onChange={(e) => setPlanClientId(e.target.value)}
                          disabled={!!editingPlanId}
                          className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-accent text-sm ${
                            editingPlanId ? 'bg-white/5 text-gray-500 cursor-not-allowed' : isDark ? 'border-white/10 bg-[#0c0a27]/50 text-white' : 'border-slate-200 bg-white text-slate-800'
                          }`}
                        >
                          <option value="" className={optionClass}>-- Choose Client Member --</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id} className={optionClass}>{c.fullName} ({c.serviceName})</option>
                          ))}
                        </select>
                      </div>

                      {/* Notes / Objectives */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Objectives & Clinical Guidelines</label>
                        <textarea
                          rows={2}
                          value={planNotes}
                          onChange={(e) => setPlanNotes(e.target.value)}
                          placeholder="e.g. Focus on balance sequence. In case of dizziness, rest for 60 seconds..."
                          className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-accent text-sm bg-transparent resize-none ${isDark ? 'border-white/10 text-white placeholder:text-gray-600' : 'border-slate-200 text-slate-800'}`}
                        />
                      </div>

                      {/* Exercises Dynamic list */}
                      <div>
                        <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/5">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">Exercise List</label>
                          <button
                            type="button"
                            onClick={handleAddExerciseInput}
                            className={`border text-accent px-3 py-1 rounded-full text-xs font-bold transition ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                          >
                            + Add Row
                          </button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {planExercises.map((ex, idx) => (
                            <div key={idx} className={`border p-3.5 rounded-2xl relative space-y-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                              {planExercises.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExerciseInput(idx)}
                                  className="absolute top-1 right-2 text-gray-400 hover:text-red-400 font-bold text-sm bg-transparent"
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
                                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent bg-transparent ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800 bg-white'}`}
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                {/* Sets */}
                                <div>
                                  <label className="block text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Sets</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={ex.sets}
                                    onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                                    className={`w-full border rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent bg-transparent ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800 bg-white'}`}
                                  />
                                </div>
                                {/* Reps */}
                                <div>
                                  <label className="block text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Reps</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={ex.reps}
                                    onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                                    className={`w-full border rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent bg-transparent ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800 bg-white'}`}
                                  />
                                </div>
                                {/* Focus */}
                                <div>
                                  <label className="block text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Focus</label>
                                  <select
                                    value={ex.focus}
                                    onChange={(e) => handleExerciseChange(idx, 'focus', e.target.value)}
                                    className={`w-full border rounded-xl p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent bg-transparent ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800 bg-white'}`}
                                  >
                                    <option value="strength" className={optionClass}>Strength</option>
                                    <option value="balance" className={optionClass}>Balance</option>
                                    <option value="mobility" className={optionClass}>Mobility</option>
                                    <option value="core" className={optionClass}>Core</option>
                                    <option value="cardio" className={optionClass}>Cardio</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Submit builder */}
                      <button
                        type="button"
                        onClick={handlePublishPlan}
                        disabled={savingPlan || clients.length === 0}
                        className={`w-full py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 text-xs font-display uppercase tracking-widest disabled:opacity-40 text-slate-950 shadow-md ${
                          editingPlanId ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-accent hover:bg-accent-dark shadow-accent/15'
                        }`}
                      >
                        {savingPlan
                          ? (editingPlanId ? 'Saving Changes...' : 'Publishing Routine...')
                          : (editingPlanId ? '💾 Save Changes' : 'Publish & Assign Plan')
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {activeTab === 'settings' && (
            <ScrollReveal className="space-y-8">
              {/* Header */}
              <div className="pb-6 border-b border-white/10">
                <span className="text-accent text-xs font-bold uppercase tracking-[0.25em]">Instructor Account</span>
                <h1 className={`text-4xl font-extrabold uppercase font-display mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Settings</h1>
                <p className={`mt-2 text-sm max-w-xl ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Manage your instructor profile, account security, and platform preferences.
                </p>
              </div>

              {/* Profile & Security Card */}
              <div className={`rounded-3xl p-8 shadow-2xl border relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-accent text-slate-950 flex items-center justify-center font-display font-black text-2xl border border-accent/20 shadow-xl flex-shrink-0">
                      {trainerUser?.fullName ? trainerUser.fullName.charAt(0) : 'T'}
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>{trainerUser?.fullName || 'Trainer'}</h2>
                      <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{trainerUser?.email}</p>
                      <span className="inline-flex items-center gap-1.5 mt-1.5 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                        Certified Instructor
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setEditFullName(trainerUser?.fullName || '')
                        setEditPhone(trainerUser?.phone || '')
                        setEditProfileError('')
                        setShowEditProfileModal(true)
                      }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
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
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      <LockIcon size={14} />
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Personal Info Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Full Name', value: trainerUser?.fullName || 'Not provided' },
                    { label: 'Email Address', value: trainerUser?.email || 'Not provided' },
                    { label: 'Phone Number', value: trainerUser?.phone || 'Not provided' },
                    { label: 'Account Role', value: 'Certified Instructor' },
                    { label: 'Active Clients', value: `${clients.length}` },
                    { label: 'Sessions Completed', value: `${sessions.filter(s => s.status === 'completed').length}` },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>{item.label}</p>
                      <div className={`rounded-xl border px-4 py-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-medium text-sm break-words">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className={`rounded-3xl p-8 shadow-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <h3 className={`text-xl font-bold font-display mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Preferences</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Email Notifications', defaultChecked: true },
                    { label: 'SMS Notifications', defaultChecked: false },
                  ].map((pref) => (
                    <label key={pref.label} className={`flex items-center justify-between py-3 border-b last:border-b-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{pref.label}</span>
                      <input type="checkbox" defaultChecked={pref.defaultChecked} className="w-4 h-4 accent-yellow-400" />
                    </label>
                  ))}
                  <label className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Dark Mode</span>
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={handleToggleTheme}
                      className="w-4 h-4 accent-yellow-400"
                    />
                  </label>
                </div>
              </div>

              {/* Contact Support */}
              <div className={`rounded-3xl p-8 shadow-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent">
                    <ChatIcon size={18} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>Contact PhysiFit Support</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Reach our admin team for platform or account issues</p>
                  </div>
                </div>

                {supportSuccess ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-400 text-2xl">✓</span>
                    </div>
                    <p className="text-green-400 font-bold text-sm mb-2">Message Sent Successfully!</p>
                    <p className="text-xs text-gray-400 mb-5">Our administrative support team will review your ticket and respond via email.</p>
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
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>Your Name</label>
                        <input
                          type="text"
                          value={supportName}
                          onChange={(e) => setSupportName(e.target.value)}
                          required
                          className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent ${isDark ? 'border-white/10 bg-slate-950/50 text-white' : 'border-slate-200 bg-white text-slate-800'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>Email Address</label>
                        <input
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          required
                          className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent ${isDark ? 'border-white/10 bg-slate-950/50 text-white' : 'border-slate-200 bg-white text-slate-800'}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>Message</label>
                      <textarea
                        placeholder="Describe your issue, question, or platform feedback..."
                        value={supportMsg}
                        onChange={(e) => setSupportMsg(e.target.value)}
                        required
                        rows={4}
                        className={`w-full text-xs rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-accent resize-none ${isDark ? 'border-white/10 bg-slate-950/50 text-white placeholder:text-gray-600' : 'border-slate-200 bg-white text-slate-800'}`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={supportSubmitting}
                      className="w-full bg-accent text-slate-950 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition duration-300 font-display shadow-lg shadow-accent/10 disabled:opacity-40 hover:shadow-accent/20"
                    >
                      {supportSubmitting ? 'Sending Request...' : 'Send Message to Support'}
                    </button>
                  </form>
                )}
              </div>

              {/* Danger Zone */}
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
                <div className="flex items-center gap-3 mb-3">
                  <TrashIcon size={20} className="text-red-500" />
                  <h3 className="text-red-500 text-xl font-bold font-display">Danger Zone</h3>
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Permanently delete your instructor account and all associated data. This action cannot be reversed.
                </p>
                <button
                  onClick={() => {
                    setDeleteConfirmText('')
                    setDeleteError('')
                    setDeleteSubmitting(false)
                    setShowDeleteAccountModal(true)
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition"
                >
                  <TrashIcon size={14} />
                  Delete Instructor Account
                </button>
              </div>
            </ScrollReveal>
          )}

        </main>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowEditProfileModal(false)}>
          <div
            className="bg-gradient-to-b from-[#1c1e2f] to-slate-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
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
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-slate-950/50 text-white"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-slate-950/50 text-white"
                  placeholder="Enter phone number"
                />
              </div>
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
                className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-slate-950 rounded-xl transition text-xs font-bold uppercase tracking-widest font-display disabled:opacity-40"
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
            className="bg-gradient-to-b from-[#1c1e2f] to-slate-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
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
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-slate-950/50 text-white" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-slate-950/50 text-white" placeholder="•••••••• (min 8 chars)" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-slate-950/50 text-white" placeholder="••••••••" />
              </div>
            </div>
            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
              <button onClick={() => setShowChangePasswordModal(false)} className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest font-display" disabled={changePasswordSubmitting}>Cancel</button>
              <button
                onClick={handleChangePassword}
                disabled={changePasswordSubmitting || !currentPassword || !newPassword || !confirmPassword}
                className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-slate-950 rounded-xl transition text-xs font-bold uppercase tracking-widest font-display disabled:opacity-40"
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
            className="bg-gradient-to-b from-[#1c1e2f] to-slate-950 border border-red-500/20 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
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
              <p className="text-sm text-gray-300 leading-relaxed">Are you absolutely sure you want to delete your instructor account? This will permanently erase your profile, client assignments, and all associated session data.</p>
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
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-slate-950/50 text-white font-mono uppercase tracking-widest"
                  placeholder="DELETE"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
              <button onClick={() => setShowDeleteAccountModal(false)} className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest font-display" disabled={deleteSubmitting}>Cancel</button>
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

      {/* Simulated WebRTC Telehealth coaching Room overlay modal */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-slate-950/95 z-[120] flex flex-col justify-between p-6 sm:p-12 text-white animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest mb-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                Specialist Consultation Node Active
              </span>
              <h2 className="text-xl sm:text-2xl font-bold uppercase font-display tracking-wider">
                Clinical Live Telehealth Desk
              </h2>
            </div>
            <span className="text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-full font-mono text-gray-400">
              Session ID: {activeThreadId?.slice(0, 8) || 'clinical-trainer-node'}
            </span>
          </div>

          {/* Video Streams */}
          <div className="flex-1 my-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto w-full">
            {/* Trainer Local Webcam feed */}
            <div className="bg-white/5 border border-white/10 rounded-3xl aspect-video relative overflow-hidden flex flex-col items-center justify-center shadow-2xl h-full min-h-[260px]">
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase text-accent border border-accent/20 z-10 animate-pulse">
                Instructor Camera (Streaming Live)
              </div>

              {!camOff ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover transform -scale-x-100 absolute inset-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/25 flex items-center justify-center font-bold text-gray-600 text-3xl mb-4">
                    ✕
                  </div>
                  <p className="text-sm font-bold text-gray-400 font-display uppercase tracking-wider">Camera Terminated</p>
                </div>
              )}
            </div>

            {/* Patient simulated stream connection */}
            <div className="bg-white/5 border border-white/10 rounded-3xl aspect-video relative overflow-hidden flex flex-col items-center justify-center p-8 shadow-2xl h-full min-h-[260px]">
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase text-gray-300 border border-white/10 z-10">
                Patient Receiver Node (Active)
              </div>

              <div className="w-24 h-24 rounded-full bg-accent/15 border-2 border-accent flex items-center justify-center font-display font-black text-4xl text-accent animate-pulse mb-4 shadow-xl">
                {activeThread?.other_user_name ? activeThread.other_user_name.charAt(0) : 'P'}
              </div>
              <p className="font-display font-bold uppercase tracking-wider text-white text-lg">{activeThread?.other_user_name || 'Matched Patient'}</p>
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Connected
              </span>
            </div>
          </div>

          {/* Controllers */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-6">
            <div className="flex gap-4">
              <button
                onClick={() => setMicMuted(m => !m)}
                className={`w-28 h-14 rounded-2xl flex items-center justify-center border font-bold text-xs uppercase tracking-wider transition ${
                  micMuted
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                }`}
              >
                {micMuted ? (
                  <span className="flex items-center gap-1.5">
                    <MicOffIcon size={16} /> Muted
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <MicIcon size={16} /> Mic On
                  </span>
                )}
              </button>
              <button
                onClick={() => setCamOff(c => !c)}
                className={`w-28 h-14 rounded-2xl flex items-center justify-center border font-bold text-xs uppercase tracking-wider transition ${
                  camOff
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                }`}
              >
                {camOff ? (
                  <span className="flex items-center gap-1.5">
                    <CameraOffIcon size={16} /> Cam Off
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CameraIcon size={16} /> Cam On
                  </span>
                )}
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
              className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs rounded-2xl transition shadow-xl shadow-red-600/25 border border-red-500/20 flex items-center gap-2"
            >
              <CloseIcon size={16} />
              <span>Disconnect Consultation Room</span>
            </button>
          </div>
        </div>
      )}

      {/* Cancel Session Modal */}
      {showCancelModal && cancelTargetSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowCancelModal(false)}>
          <div
            className="bg-gradient-to-b from-[#1c1e2f] to-slate-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-white/5 border-b border-white/5 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-lg border border-red-500/20 text-red-400">
                <AlertIcon size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Cancel Timed Session</h3>
                <p className="text-[10px] text-red-400 uppercase tracking-widest">This action cannot be undone</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 text-left">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-xs">
                <p className="text-gray-400 uppercase tracking-wider mb-1 font-display">Target Session Details</p>
                <p className="font-bold text-white font-display uppercase tracking-wider text-base">{cancelTargetSession.clientName}</p>
                <p className="text-accent mt-1 font-semibold">{cancelTargetSession.serviceName} · {formatDateTime(cancelTargetSession.scheduledAt)}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">Reason for Cancellation</label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, specialist emergency..."
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-400 placeholder:text-gray-600 bg-slate-950/50 text-white resize-none"
                  maxLength={500}
                />
                <p className="text-[9px] text-gray-500 mt-1 text-right font-mono">{cancelReason.length}/500</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3 justify-end">
              <button
                onClick={() => { setShowCancelModal(false); setCancelTargetSession(null); setCancelReason('') }}
                className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition text-xs font-bold uppercase tracking-widest font-display"
                disabled={cancelSubmitting}
              >
                Keep Session
              </button>
              <button
                onClick={handleCancelSession}
                disabled={cancelSubmitting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-xs font-bold uppercase tracking-widest font-display disabled:opacity-40"
              >
                {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && rescheduleTargetSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowRescheduleModal(false)}>
          <div
            className="bg-gradient-to-b from-[#1c1e2f] to-slate-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-white/5 border-b border-white/5 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-lg border border-accent/20 text-accent">
                <RefreshIcon size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg uppercase tracking-wider">Reschedule Scheduled Spot</h3>
                <p className="text-[10px] text-accent uppercase tracking-widest font-display">Modify session details</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 text-left">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-xs">
                <p className="text-gray-400 uppercase tracking-wider mb-1 font-display">Target Session Details</p>
                <p className="font-bold text-white font-display uppercase tracking-wider text-base">{rescheduleTargetSession.clientName}</p>
                <p className="text-accent mt-1 font-semibold">{rescheduleTargetSession.serviceName} · {formatDateTime(rescheduleTargetSession.scheduledAt)}</p>
              </div>

              <div className="bg-accent/10 border-l-4 border-accent rounded p-3 text-[11px] text-accent leading-relaxed">
                <strong>Attention:</strong> Make sure the adjusted time matches the active clinical timeline of matched slots.
              </div>

              {rescheduleError && (
                <div className="bg-red-500/25 border-l-4 border-red-500 text-red-200 p-3 rounded text-xs font-semibold leading-relaxed">
                  ⚠ {rescheduleError}
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
                    className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-slate-950/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-display">New Time</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-slate-950/50 text-white"
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
                  className="w-full border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-600 bg-slate-950/50 text-white resize-none"
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
                className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-slate-950 rounded-xl transition text-xs font-bold uppercase tracking-widest font-display disabled:opacity-40"
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
