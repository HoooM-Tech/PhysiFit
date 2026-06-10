'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import DotPattern from '@/components/DotPattern'
import CornerTriangle from '@/components/CornerTriangle'

type Role = 'client' | 'trainer'
type Specialization = 'senior_fitness' | 'postpartum' | 'corporate_wellness'
type Step = 'role' | 'personal' | 'health' | 'specialization' | 'trainerOnboarding' | 'confirm'

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
            dizzinessHistory: formData.dizziness === 'Yes',
            medicalNotes: formData.medicalConditions || undefined,
            specialization: formData.specialization || undefined,
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
        <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-center max-w-md mx-auto w-full">
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
                <span className="text-gray-600 text-sm">
                  Step {currentStepIndex} of {totalSteps} — Required for safe training
                </span>
              </div>

              <h1 className="font-display text-5xl uppercase tracking-condensed leading-none text-primary-darker mb-10">Health Information</h1>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-accent mb-4 uppercase tracking-[0.2em] text-xs">PHYSICAL MEASUREMENTS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-2">BMI</label>
                      <input
                        type="number"
                        value={formData.bmi}
                        onChange={(e) => setFormData({ ...formData, bmi: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block font-bold mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-accent mb-4 uppercase tracking-[0.2em] text-xs">HEALTH CONDITIONS</h3>
                  <div>
                    <label className="block font-bold mb-2">Do you experience dizziness or light-headedness?</label>
                    <select
                      value={formData.dizziness}
                      onChange={(e) => setFormData({ ...formData, dizziness: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                    >
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block font-bold mb-2">Any existing medical conditions?</label>
                    <textarea
                      value={formData.medicalConditions}
                      onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                      placeholder="e.g. hypertension, diabetes, joint issues — or 'None'"
                      className="w-full border border-gray-300 rounded-md p-3 h-24 focus:outline-none focus:border-primary-darker focus:ring-2 focus:ring-accent/40 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('personal')}
                    className="flex-1 border-2 border-gray-300 hover:border-primary-darker text-primary-darker py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep('specialization')}
                    className="flex-1 bg-primary-darker hover:bg-primary-dark text-white py-3.5 rounded-md font-bold uppercase tracking-wider text-sm transition"
                  >
                    Continue →
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Health data</span>
                      <span className="font-bold text-green-600">✓ Completed</span>
                    </div>
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
                  <h3 className="font-display text-lg uppercase tracking-wide text-primary-darker mb-3">Terms & Conditions</h3>
                  <div className="max-h-64 overflow-y-auto text-sm text-gray-700 mb-4 space-y-3">
                    <p><strong>Session Cancellation & Rescheduling:</strong> Sessions must be cancelled or rescheduled at least 24 hours in advance. Cancellations made within 24 hours will be charged as a full session fee.</p>
                    <p><strong>Health & Safety:</strong> You agree to provide accurate health information. PhysiFit NG is not responsible for injuries resulting from undisclosed medical conditions or failure to follow trainer guidance.</p>
                    <p><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your password and account information. All activities under your account are your responsibility.</p>
                    <p><strong>Payment & Billing:</strong> You authorize PhysiFit NG to charge your payment method for all sessions and services as agreed.</p>
                    <p><strong>Liability Waiver:</strong> By creating this account, you acknowledge the physical risks associated with fitness training and assume full responsibility for your health and safety.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree-terms"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-4 h-4 mt-1"
                    />
                    <label htmlFor="agree-terms" className="text-sm text-gray-700">
                      I have read and agree to the Terms & Conditions, session policies, and rescheduling rules above.
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
                    ? 'bg-primary-darker hover:bg-primary-dark text-white'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
              </button>

              <button
                onClick={() => setStep(isTrainer ? 'trainerOnboarding' : 'health')}
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
