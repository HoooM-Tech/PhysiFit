'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import DotPattern from '@/components/DotPattern'
import CornerTriangle from '@/components/CornerTriangle'

type Role = 'client' | 'trainer'
type Specialization = 'senior_fitness' | 'postpartum' | 'corporate_wellness'
type Step = 'role' | 'personal' | 'health' | 'specialization' | 'trainerOnboarding' | 'confirm'

type YesNo = 'yes' | 'no' | null

interface ParqState {
  heartCondition: YesNo
  chestPain: YesNo
  dizzinessOrLossOfConsciousness: YesNo
  boneOrJointProblems: YesNo
  bpOrHeartMedication: YesNo
  otherReasonsNotToExercise: YesNo
  otherReasonsDetails: string
  informationCorrect: YesNo
  healthChangeAcknowledged: boolean
  additionalQuestions: string
}

const PARQ_QUESTIONS: {
  key:
    | 'heartCondition'
    | 'chestPain'
    | 'dizzinessOrLossOfConsciousness'
    | 'boneOrJointProblems'
    | 'bpOrHeartMedication'
    | 'otherReasonsNotToExercise'
    | 'informationCorrect'
  label: string
  icon: string
  subtext?: string
}[] = [
  {
    key: 'heartCondition',
    label: 'Has a doctor ever said you have a heart condition and that you should only do physical activity recommended by a doctor?',
    icon: '❤️',
    subtext: 'Cardiac condition screening',
  },
  {
    key: 'chestPain',
    label: 'Do you feel pain in your chest when performing physical activities?',
    icon: '🫀',
    subtext: 'Cardiovascular response indicator',
  },
  {
    key: 'dizzinessOrLossOfConsciousness',
    label: 'Do you ever lose balance because of dizziness or experience loss of consciousness?',
    icon: '🌀',
    subtext: 'Postural stability & equilibrium',
  },
  {
    key: 'boneOrJointProblems',
    label: 'Do you have a bone or joint problem (e.g. back, knee, hip, shoulder) that could be made worse by exercise?',
    icon: '🦴',
    subtext: 'Musculoskeletal safety screener',
  },
  {
    key: 'bpOrHeartMedication',
    label: 'Is your doctor currently prescribing medication for your blood pressure or a heart condition?',
    icon: '💊',
    subtext: 'Prescription & cardiac monitoring',
  },
  {
    key: 'otherReasonsNotToExercise',
    label: 'Do you know of any other reason why you should not undergo physical activity (e.g. asthma, diabetes, recent injury, or surgery)?',
    icon: '🩺',
    subtext: 'General medical restrictions',
  },
  {
    key: 'informationCorrect',
    label: 'To the best of your knowledge, is all the information provided in this questionnaire accurate and complete?',
    icon: '📋',
    subtext: 'Truthfulness declaration',
  },
]

const SPECIALIZATION_OPTIONS: { value: Specialization; label: string; description: string }[] = [
  {
    value: 'senior_fitness',
    label: 'Senior Fitness',
    description: 'Specialized training for older adults focused on mobility, balance, and strength.',
  },
  {
    value: 'postpartum',
    label: 'Postpartum Fitness',
    description: 'Recovery-focused training for new mothers, including core and pelvic floor.',
  },
  {
    value: 'corporate_wellness',
    label: 'Corporate Wellness',
    description: 'Workplace fitness programs, posture correction, and stress management.',
  },
]

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('role')
  const [formData, setFormData] = useState({
    role: null as Role | null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    weight: 65,
    bmi: 24.5,
    height: 165,
    dizziness: 'No',
    medicalConditions: '',
    specialization: '' as '' | Specialization,
    yearsOfExperience: '',
    education: '',
    certifications: '',
    q1: '',
    q2: '',
    cvUrl: '',
    cvFileName: '',
  })

  // Full PAR-Q Screening state for clients
  const [parq, setParq] = useState<ParqState>({
    heartCondition: null,
    chestPain: null,
    dizzinessOrLossOfConsciousness: null,
    boneOrJointProblems: null,
    bpOrHeartMedication: null,
    otherReasonsNotToExercise: null,
    otherReasonsDetails: '',
    informationCorrect: null,
    healthChangeAcknowledged: false,
    additionalQuestions: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [consent, setConsent] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordsMatch = formData.password === formData.confirmPassword
  const isPasswordValid = formData.password.length >= 8
  const isTrainer = formData.role === 'trainer'

  const steps: Step[] = isTrainer
    ? ['role', 'personal', 'specialization', 'trainerOnboarding', 'confirm']
    : ['role', 'personal', 'health', 'specialization', 'confirm']

  const currentStepIndex = steps.indexOf(step) + 1
  const totalSteps = steps.length

  // Set all PAR-Q questions to 'no' (All Clear shortcut)
  const setAllParqNo = () => {
    setParq({
      heartCondition: 'no',
      chestPain: 'no',
      dizzinessOrLossOfConsciousness: 'no',
      boneOrJointProblems: 'no',
      bpOrHeartMedication: 'no',
      otherReasonsNotToExercise: 'no',
      otherReasonsDetails: '',
      informationCorrect: 'yes',
      healthChangeAcknowledged: true,
      additionalQuestions: parq.additionalQuestions,
    })
    setFormData((prev) => ({ ...prev, dizziness: 'No' }))
  }

  // Real-time BMI calculation
  const computedBmi = useMemo(() => {
    const w = Number(formData.weight)
    const h = Number(formData.height)
    if (!w || !h || h <= 0) return null
    const bmiVal = w / Math.pow(h / 100, 2)
    return parseFloat(bmiVal.toFixed(1))
  }, [formData.weight, formData.height])

  const bmiCategory = useMemo(() => {
    if (!computedBmi) return null
    if (computedBmi < 18.5) return { label: 'Underweight', color: 'text-amber-700 bg-amber-50 border-amber-200' }
    if (computedBmi < 25) return { label: 'Normal Weight', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    if (computedBmi < 30) return { label: 'Overweight', color: 'text-orange-700 bg-orange-50 border-orange-200' }
    return { label: 'Obese Range', color: 'text-rose-700 bg-rose-50 border-rose-200' }
  }, [computedBmi])

  // Flagged conditions on PAR-Q
  const parqFlags = useMemo(() => {
    const flags: string[] = []
    if (parq.heartCondition === 'yes') flags.push('Heart Condition')
    if (parq.chestPain === 'yes') flags.push('Chest Pain')
    if (parq.dizzinessOrLossOfConsciousness === 'yes') flags.push('Dizziness / Loss of Balance')
    if (parq.boneOrJointProblems === 'yes') flags.push('Bone / Joint Issues')
    if (parq.bpOrHeartMedication === 'yes') flags.push('BP / Heart Medication')
    if (parq.otherReasonsNotToExercise === 'yes' && parq.otherReasonsDetails.trim()) {
      flags.push(`Other: ${parq.otherReasonsDetails.trim()}`)
    }
    return flags
  }, [parq])

  // PAR-Q validation for clients
  const isParqComplete = useMemo(() => {
    const allQuestionsAnswered = PARQ_QUESTIONS.every((q) => parq[q.key] !== null)
    const otherDetailsValid =
      parq.otherReasonsNotToExercise !== 'yes' ||
      parq.otherReasonsDetails.trim().length > 0
    const acknowledged = parq.healthChangeAcknowledged
    const hasMeasurements =
      Number(formData.weight) >= 20 && Number(formData.height) >= 50
    return allQuestionsAnswered && otherDetailsValid && acknowledged && hasMeasurements
  }, [parq, formData.weight, formData.height])

  const canContinue =
    consent &&
    isPasswordValid &&
    formData.confirmPassword &&
    passwordsMatch &&
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.dateOfBirth !== '' &&
    formData.gender !== ''

  const canPickSpecialization = !!formData.specialization
  const canCreateAccount = termsAgreed && canPickSpecialization

  const pickRole = (role: Role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      specialization: role === 'trainer' ? prev.specialization : '',
    }))
    setStep('personal')
  }

  const handleRegister = async () => {
    setError('')
    setLoading(true)
    try {
      const baseBody = {
        email: formData.email,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
      }

      const formattedMedicalNotes = parqFlags.length > 0
        ? `PAR-Q Flagged Conditions: ${parqFlags.join('; ')}${parq.additionalQuestions.trim() ? ` | Notes: ${parq.additionalQuestions.trim()}` : ''}`
        : `PAR-Q Cleared (All No)${parq.additionalQuestions.trim() ? ` | Notes: ${parq.additionalQuestions.trim()}` : ''}`

      const body = isTrainer
        ? {
            ...baseBody,
            role: 'trainer' as const,
            specialization: formData.specialization || undefined,
            yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
            cvUrl: formData.cvUrl || undefined,
            certifications: formData.certifications || undefined,
            education: formData.education || undefined,
            onboardingAnswers: JSON.stringify({
              q1: formData.q1,
              q2: formData.q2,
            }),
          }
        : {
            ...baseBody,
            role: 'client' as const,
            weightKg: Number(formData.weight) || undefined,
            heightCm: Number(formData.height) || undefined,
            dizzinessHistory: parq.dizzinessOrLossOfConsciousness === 'yes',
            medicalNotes: formattedMedicalNotes,
            specialization: formData.specialization || undefined,
            parq: {
              heartCondition: parq.heartCondition === 'yes',
              chestPain: parq.chestPain === 'yes',
              dizzinessOrLossOfConsciousness: parq.dizzinessOrLossOfConsciousness === 'yes',
              boneOrJointProblems: parq.boneOrJointProblems === 'yes',
              bpOrHeartMedication: parq.bpOrHeartMedication === 'yes',
              informationCorrect: parq.informationCorrect === 'yes',
              otherReasonsNotToExercise: parq.otherReasonsNotToExercise === 'yes',
              otherReasonsDetails: parq.otherReasonsDetails.trim() || undefined,
              healthChangeAcknowledged: parq.healthChangeAcknowledged,
              additionalQuestions: parq.additionalQuestions.trim() || undefined,
            },
          }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) {
        if (json.error?.code === 'VALIDATION_ERROR' && Array.isArray(json.error.details)) {
          const detailMsgs = json.error.details
            .map((d: any) => `${d.path}: ${d.message}`)
            .join(', ')
          throw new Error(`Validation failed: ${detailMsgs}`)
        }
        throw new Error(json.error?.message || json.message || 'Failed to create account')
      }

      const createdRole = json.data?.user?.role
      router.push(
        createdRole === 'admin'
          ? '/admin'
          : createdRole === 'trainer'
            ? '/trainer-portal'
            : '/dashboard'
      )
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
        {/* Left Side - Branding */}
        <div className="relative hidden md:flex bg-gradient-to-br from-primary-dark to-primary-darker text-white p-12 flex-col justify-center overflow-hidden">
          <CornerTriangle corner="tr" size={56} color="bg-accent" />
          <CornerTriangle corner="bl" size={40} color="bg-accent" />
          <DotPattern className="absolute bottom-10 right-10 w-44 h-44 text-accent/30" />
          <div className="relative max-w-md">
            <div className="inline-flex items-center gap-3 mb-6">
              <span aria-hidden="true" className="h-[2px] w-10 bg-accent" />
              <span className="text-accent text-xs font-bold tracking-[0.25em] uppercase">Join PhysiFit</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-condensed leading-[0.95] mb-8">
              "The journey of a thousand miles begins with a single step — and the <span className="text-accent">right support.</span>"
            </h2>
            <p className="text-gray-300 text-sm uppercase tracking-wider">— PhysiFit NG Philosophy</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={`p-6 sm:p-10 md:p-12 flex flex-col justify-center mx-auto w-full transition-all duration-300 ${step === 'health' || step === 'trainerOnboarding' ? 'max-w-2xl' : 'max-w-md'}`}>
          {step === 'role' && (
            <>
              <div className="mb-3 inline-flex items-center">
                <div className="w-3 h-[3px] bg-accent inline-block mr-3"></div>
                <span className="text-gray-600 text-xs uppercase tracking-[0.2em] font-semibold">Step {currentStepIndex} of {totalSteps} — Choose your account type</span>
              </div>

              <h1 className="font-display text-5xl uppercase tracking-condensed leading-none text-primary-darker mb-3">Join PhysiFit NG</h1>
              <p className="text-gray-600 mb-8">Tell us how you'll be using the platform.</p>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => pickRole('client')}
                  className="w-full text-left border-2 border-gray-300 hover:border-primary-darker hover:bg-accent/5 rounded-md p-6 transition group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-xl uppercase tracking-wide text-primary-darker">I'm a Client</h3>
                    <span className="text-accent opacity-0 group-hover:opacity-100 transition">→</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Book sessions, message trainers, and track your health progress.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => pickRole('trainer')}
                  className="w-full text-left border-2 border-gray-300 hover:border-primary-darker hover:bg-accent/5 rounded-md p-6 transition group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-xl uppercase tracking-wide text-primary-darker">I'm a Trainer</h3>
                    <span className="text-accent opacity-0 group-hover:opacity-100 transition">→</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Manage assigned clients, run sessions, and message clients from the trainer portal.
                  </p>
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-8">
                Already have an account?{' '}
                <Link href="/login" className="text-accent hover:text-accent-dark font-bold uppercase tracking-wider text-xs">
                  Sign in
                </Link>
              </p>
            </>
          )}

          {step === 'personal' && (
            <>
              <div className="mb-3 inline-flex items-center">
                <div className="w-3 h-[3px] bg-accent inline-block mr-3"></div>
                <span className="text-gray-600 text-sm">
                  Step {currentStepIndex} of {totalSteps} — Personal Information
                </span>
              </div>

              <h1 className="font-display text-5xl uppercase tracking-condensed leading-none text-primary-darker mb-3">Create your account</h1>
              <p className="text-gray-600 mb-8">
                Signing up as{' '}
                <span className="font-semibold text-primary-darker">
                  {isTrainer ? 'a Trainer' : 'a Client'}
                </span>
                .{' '}
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="text-accent hover:text-accent-dark font-semibold"
                >
                  Change
                </button>
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Amaka"
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Okonkwo"
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer Not to Say">Prefer Not to Say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="amaka@email.com"
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a strong password (min 8 characters)"
                        className="w-full border border-gray-300 rounded-md p-3 pr-12 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3-3.671-3.671m0-3.671a3 3 0 0 0-3.671 3.671m-.339.339 3.671-3.671" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formData.password && !isPasswordValid && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">Password must be at least 8 characters.</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-enter your password"
                        className="w-full border border-gray-300 rounded-md p-3 pr-12 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3-3.671-3.671m0-3.671a3 3 0 0 0-3.671 3.671m-.339.339 3.671-3.671" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I consent to PhysiFit NG contacting me about my sessions, health progress, and platform updates.
                  </label>
                </div>

                {!passwordsMatch && formData.confirmPassword ? (
                  <p className="text-sm text-red-600">Passwords do not match. Please confirm your password.</p>
                ) : null}

                <button
                  disabled={!canContinue}
                  onClick={() => setStep(isTrainer ? 'specialization' : 'health')}
                  className={`w-full py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition ${
                    canContinue
                      ? 'bg-primary-darker hover:bg-primary-dark text-white'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {step === 'health' && (
            <>
              <div className="mb-3 inline-flex items-center">
                <div className="w-3 h-[3px] bg-accent inline-block mr-3"></div>
                <span className="text-gray-600 text-xs uppercase tracking-[0.2em] font-semibold">
                  Step {currentStepIndex} of {totalSteps} — Physical Activity Readiness Questionnaire
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-condensed leading-none text-primary-darker mb-3">
                PAR-Q Health Screening
              </h1>
              <p className="text-gray-600 text-sm mb-6">
                A short medical readiness questionnaire to ensure your safety and allow our clinical directors to match you with the ideal certified trainer.
              </p>

              {/* Clinical Value Banner */}
              <div className="bg-blue-50/90 border-l-4 border-blue-600 p-4 sm:p-5 rounded-r-xl mb-6 shadow-xs">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">🩺</span>
                  <div>
                    <h4 className="font-bold text-blue-950 text-xs sm:text-sm uppercase tracking-wide">
                      Confidential Clinical Trainer Matching
                    </h4>
                    <p className="text-blue-900/90 text-xs mt-1 leading-relaxed">
                      Your answers are protected and strictly confidential. PhysiFit uses this data to assign a trainer specifically certified for your physical profile (e.g. Senior Fitness, Cardiac Wellness, or Postpartum Rehab).
                    </p>
                  </div>
                </div>
              </div>

              {/* All-Clear Shortcut */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-gray-100/70 border border-gray-200 p-4 rounded-xl mb-6">
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Healthy with no medical restrictions?</span>
                  <span className="text-xs text-gray-500">Quickly set all screeners to clear in one tap.</span>
                </div>
                <button
                  type="button"
                  onClick={setAllParqNo}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-xs shrink-0 self-start sm:self-auto"
                >
                  ⚡ All Clear (Set All to No)
                </button>
              </div>

              <div className="space-y-6">
                {/* Physical Measurements */}
                <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-accent mb-4 uppercase tracking-[0.2em] text-xs">
                    PHYSICAL MEASUREMENTS
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Weight (kg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="300"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g. 70"
                        className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Height (cm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="260"
                        value={formData.height || ''}
                        onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g. 175"
                        className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Dynamic BMI Indicator */}
                  {computedBmi && bmiCategory && (
                    <div className="mt-4 pt-4 border-t border-gray-200/80 flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-medium">
                        Calculated BMI: <strong className="text-gray-900 font-bold">{computedBmi}</strong>
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${bmiCategory.color}`}>
                        {bmiCategory.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* 7 PAR-Q Questionnaire Questions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-accent uppercase tracking-[0.2em] text-xs">
                      PAR-Q HEALTH READINESS QUESTIONS
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">All 7 required</span>
                  </div>

                  <div className="space-y-3.5">
                    {PARQ_QUESTIONS.map((q, idx) => {
                      const answer = parq[q.key]
                      return (
                        <div
                          key={q.key}
                          className={`border rounded-xl p-4 sm:p-5 transition bg-white shadow-xs ${
                            answer === 'yes'
                              ? 'border-amber-300 bg-amber-50/30'
                              : answer === 'no'
                              ? 'border-gray-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-xl shrink-0 select-none mt-0.5">{q.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                                  Q{idx + 1}
                                </span>
                                {q.subtext && (
                                  <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                                    • {q.subtext}
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-gray-900 text-sm leading-snug">
                                {q.label}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 sm:ml-9">
                            <button
                              type="button"
                              onClick={() => {
                                setParq({ ...parq, [q.key]: 'yes' })
                                if (q.key === 'dizzinessOrLossOfConsciousness') {
                                  setFormData((prev) => ({ ...prev, dizziness: 'Yes' }))
                                }
                              }}
                              className={`flex-1 sm:flex-none sm:min-w-[120px] py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider border-2 transition ${
                                answer === 'yes'
                                  ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setParq({ ...parq, [q.key]: 'no' })
                                if (q.key === 'dizzinessOrLossOfConsciousness') {
                                  setFormData((prev) => ({ ...prev, dizziness: 'No' }))
                                }
                              }}
                              className={`flex-1 sm:flex-none sm:min-w-[120px] py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider border-2 transition ${
                                answer === 'no'
                                  ? 'border-primary-darker bg-primary-darker text-white shadow-xs'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Details if other reasons was marked Yes */}
                {parq.otherReasonsNotToExercise === 'yes' && (
                  <div className="border border-amber-300 bg-amber-50/70 rounded-xl p-5 shadow-xs">
                    <label className="block font-bold text-amber-950 text-xs uppercase tracking-wider mb-2">
                      Please specify your medical conditions or health restrictions <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={parq.otherReasonsDetails}
                      onChange={(e) => setParq({ ...parq, otherReasonsDetails: e.target.value })}
                      placeholder="e.g. Mild asthma, lower back stiffness, controlled hypertension, recovering from knee arthroscopy..."
                      className="w-full border border-amber-300 rounded-lg p-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 h-24 resize-none"
                    />
                  </div>
                )}

                {/* Additional Trainer Notes */}
                <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-xs">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Additional notes for your assigned trainer (Optional)
                  </label>
                  <textarea
                    value={parq.additionalQuestions}
                    onChange={(e) => setParq({ ...parq, additionalQuestions: e.target.value })}
                    placeholder="Share specific wellness goals, injury history, or training preferences..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 h-20 resize-none"
                  />
                </div>

                {/* Safety & Ongoing Disclosure Acknowledgment */}
                <div className="border border-gray-200 bg-gray-50/80 rounded-xl p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="parq-health-ack"
                      checked={parq.healthChangeAcknowledged}
                      onChange={(e) => setParq({ ...parq, healthChangeAcknowledged: e.target.checked })}
                      className="w-5 h-5 mt-0.5 shrink-0 rounded accent-primary-darker cursor-pointer"
                    />
                    <label htmlFor="parq-health-ack" className="text-xs sm:text-sm text-gray-700 cursor-pointer font-medium leading-relaxed">
                      I confirm that the health information declared above is true and complete. If my health status or medical conditions change at any time during training with PhysiFit, I agree to inform my certified trainer immediately. <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>

                {/* Validation Status message */}
                {!isParqComplete && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900">
                    <span className="font-bold">Required to continue:</span> Please answer all 7 PAR-Q questions, provide valid height & weight measurements, and check the safety declaration above.
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setStep('personal')}
                    className="flex-1 border-2 border-gray-300 hover:border-primary-darker text-primary-darker py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition"
                  >
                    ← Back
                  </button>
                  <button
                    disabled={!isParqComplete}
                    onClick={() => setStep('specialization')}
                    className={`flex-1 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition ${
                      isParqComplete
                        ? 'bg-primary-darker hover:bg-primary-dark text-white shadow-md'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Continue to Specialization →
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'specialization' && (
            <>
              <div className="mb-3 inline-flex items-center">
                <div className="w-3 h-[3px] bg-accent inline-block mr-3"></div>
                <span className="text-gray-600 text-sm">
                  Step {currentStepIndex} of {totalSteps} — Your training focus
                </span>
              </div>

              <h1 className="font-display text-5xl uppercase tracking-condensed leading-none text-primary-darker mb-3">Specialization</h1>
              <p className="text-gray-600 mb-8">
                Pick the area you train in. Clients are matched to trainers by specialization.
              </p>

              <div className="space-y-3">
                {SPECIALIZATION_OPTIONS.map((opt) => {
                  const selected = formData.specialization === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, specialization: opt.value })}
                      className={`w-full text-left border-2 rounded-md p-4 transition ${
                        selected
                          ? 'border-primary-darker bg-accent/10'
                          : 'border-gray-300 hover:border-primary-darker'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-display text-lg uppercase tracking-wide text-primary-darker">{opt.label}</h3>
                        {selected && <span className="text-accent font-bold">✓</span>}
                      </div>
                      <p className="text-sm text-gray-600">{opt.description}</p>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(isTrainer ? 'personal' : 'health')}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-900 py-3 rounded-lg font-bold transition"
                >
                  ← Back
                </button>
                <button
                  disabled={!canPickSpecialization}
                  onClick={() => setStep(isTrainer ? 'trainerOnboarding' : 'confirm')}
                  className={`flex-1 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition ${
                    canPickSpecialization
                      ? 'bg-primary-darker hover:bg-primary-dark text-white'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {step === 'trainerOnboarding' && (
            <>
              <div className="mb-3 inline-flex items-center">
                <div className="w-3 h-[3px] bg-accent inline-block mr-3"></div>
                <span className="text-gray-600 text-sm">
                  Step {currentStepIndex} of {totalSteps} — Professional Details
                </span>
              </div>

              <h1 className="font-display text-5xl uppercase tracking-condensed leading-none text-primary-darker mb-6">Trainer Application</h1>
              <p className="text-gray-600 mb-8">
                Complete your profile and provide information to verify your background.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block font-bold mb-2">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Education / Degree</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    placeholder="e.g. B.Sc. in Kinesiology, University of Ibadan"
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Certifications</label>
                  <textarea
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    placeholder="e.g. NASM-CPT, First Aid & CPR"
                    className="w-full border border-gray-300 rounded-md p-3 h-24 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">
                    Describe your experience working with rehabilitation or senior wellness programs.
                  </label>
                  <textarea
                    value={formData.q1}
                    onChange={(e) => setFormData({ ...formData, q1: e.target.value })}
                    placeholder="Provide details of past experience..."
                    className="w-full border border-gray-300 rounded-md p-3 h-24 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">
                    Why do you wish to join the PhysiFit Specialist network?
                  </label>
                  <textarea
                    value={formData.q2}
                    onChange={(e) => setFormData({ ...formData, q2: e.target.value })}
                    placeholder="Tell us about your motivation..."
                    className="w-full border border-gray-300 rounded-md p-3 h-24 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Upload CV (PDF or document)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({
                            ...formData,
                            cvUrl: reader.result as string,
                            cvFileName: file.name
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker transition"
                  />
                  {formData.cvFileName && (
                    <p className="text-xs text-green-600 mt-1">
                      Selected file: <strong>{formData.cvFileName}</strong>
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('specialization')}
                    className="flex-1 border-2 border-gray-300 hover:border-primary-darker text-primary-darker py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={
                      !formData.yearsOfExperience ||
                      !formData.education ||
                      !formData.certifications ||
                      !formData.q1 ||
                      !formData.q2 ||
                      !formData.cvUrl
                    }
                    className={`flex-1 py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition ${
                      formData.yearsOfExperience &&
                      formData.education &&
                      formData.certifications &&
                      formData.q1 &&
                      formData.q2 &&
                      formData.cvUrl
                        ? 'bg-primary-darker hover:bg-primary-dark text-white'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="mb-3 inline-flex items-center">
                <div className="w-3 h-[3px] bg-accent inline-block mr-3"></div>
                <span className="text-gray-600 text-sm">
                  Step {currentStepIndex} of {totalSteps} — Review & Confirm
                </span>
              </div>

              <h1 className="font-display text-5xl uppercase tracking-condensed leading-none text-primary-darker mb-10">You're all set!</h1>

              <div className="bg-white border border-gray-200 rounded-md p-8 mb-8">
                <h3 className="font-display text-lg uppercase tracking-wide text-primary-darker mb-6">Account Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-bold capitalize">{formData.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-bold">
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender</span>
                    <span className="font-bold">{formData.gender || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth</span>
                    <span className="font-bold">{formData.dateOfBirth || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-bold">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-bold">{formData.phone}</span>
                  </div>
                  {!isTrainer && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Physical Biometrics</span>
                        <span className="font-bold text-gray-900">
                          {formData.weight} kg • {formData.height} cm
                          {computedBmi && <span className="text-gray-500 font-normal"> (BMI: {computedBmi})</span>}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                          PAR-Q Screener Declaration
                        </span>
                        {parqFlags.length > 0 ? (
                          <div className="border border-amber-200 bg-amber-50/80 rounded-lg p-3">
                            <span className="font-bold text-amber-900 text-xs block mb-1">
                              ⚠️ Completed — Flagged Conditions Noted
                            </span>
                            <span className="text-xs text-amber-800 font-medium block">
                              {parqFlags.join('; ')}
                            </span>
                            <span className="text-[11px] text-amber-700 block mt-1">
                              PhysiFit clinical directors will match you with a trainer certified in these specific conditions.
                            </span>
                          </div>
                        ) : (
                          <div className="border border-emerald-200 bg-emerald-50/80 rounded-lg p-3">
                            <span className="font-bold text-emerald-900 text-xs block">
                              ✓ Cleared for Physical Training (All No)
                            </span>
                            <span className="text-[11px] text-emerald-700 block mt-0.5">
                              No medical restrictions declared on the PAR-Q readiness questionnaire.
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Specialization</span>
                    <span className="font-bold">
                      {SPECIALIZATION_OPTIONS.find((o) => o.value === formData.specialization)?.label || '—'}
                    </span>
                  </div>
                  {isTrainer && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-bold">{formData.yearsOfExperience} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CV Uploaded</span>
                        <span className="font-bold text-green-600">✓ Yes ({formData.cvFileName})</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isTrainer && (
                <div className="bg-accent/10 border-l-4 border-accent rounded-md p-4 mb-6">
                  <p className="text-sm text-primary-darker">
                    <strong>Heads up:</strong> Trainer accounts are reviewed by an admin before being
                    matched with clients. You'll be signed in immediately and can explore the trainer
                    portal while you wait for approval.
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="border border-gray-200 rounded-md p-5 bg-gray-50">
                  <h3 className="font-display text-lg uppercase tracking-wide text-primary-darker mb-2">Terms & Conditions</h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Please review our official legal policies regarding health safety, session cancellation rules, and account terms before creating your account.
                  </p>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-5 h-5 mt-0.5 shrink-0 cursor-pointer accent-primary-darker"
                    />
                    <label htmlFor="agree-terms" className="text-sm text-gray-800 cursor-pointer font-medium">
                      I have read, understood, and agree to the{' '}
                      <Link href="/terms" target="_blank" className="text-primary-darker hover:text-accent font-bold underline">
                        Terms & Conditions
                      </Link>
                      , session policies, and assumption of risk.
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded text-left">
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              <button
                disabled={!canCreateAccount || loading}
                onClick={handleRegister}
                className={`w-full py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition mb-4 ${
                  canCreateAccount && !loading
                    ? 'bg-primary-darker hover:bg-primary-dark text-white shadow-md'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
              </button>

              <button
                onClick={() => setStep(isTrainer ? 'trainerOnboarding' : 'specialization')}
                className="w-full border-2 border-gray-300 hover:border-primary-darker text-primary-darker py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
