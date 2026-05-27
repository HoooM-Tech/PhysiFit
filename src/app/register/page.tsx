'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type Step = 'contact' | 'parq' | 'goals' | 'success'

type YesNo = 'yes' | 'no' | null

type ParqAnswers = {
  heartCondition: YesNo
  chestPain: YesNo
  dizzinessOrLossOfConsciousness: YesNo
  boneOrJointProblems: YesNo
  bpOrHeartMedication: YesNo
  informationCorrect: YesNo
  otherReasonsNotToExercise: YesNo
  otherReasonsDetails: string
  healthChangeAcknowledged: YesNo
  additionalQuestions: string
}

const PARQ_QUESTIONS: {
  key: Exclude<keyof ParqAnswers, 'otherReasonsDetails' | 'additionalQuestions'>
  label: string
}[] = [
  {
    key: 'heartCondition',
    label:
      'Has your doctor ever said you have a heart condition and that you should only do physical activities recommended by a doctor?',
  },
  {
    key: 'chestPain',
    label: 'Do you feel pain in your chest during physical activities?',
  },
  {
    key: 'dizzinessOrLossOfConsciousness',
    label:
      'Do you lose balance because of dizziness, or do you ever lose consciousness?',
  },
  {
    key: 'boneOrJointProblems',
    label:
      'Do you have bone or joint problems that could be made worse by a change in your physical activities?',
  },
  {
    key: 'bpOrHeartMedication',
    label:
      'Is your doctor currently prescribing drugs for your blood pressure or heart condition?',
  },
  {
    key: 'informationCorrect',
    label:
      'We believe this information is correct at the time of completion of this questionnaire. Is that correct?',
  },
  {
    key: 'otherReasonsNotToExercise',
    label:
      'Do you have any other reasons you should not undergo any physical activity? This could include asthma, diabetes, recent sport injury or serious illness.',
  },
]

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('contact')

  const [contact, setContact] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Nigeria',
    address: '',
    dateOfBirth: '',
  })

  const [parq, setParq] = useState<ParqAnswers>({
    heartCondition: null,
    chestPain: null,
    dizzinessOrLossOfConsciousness: null,
    boneOrJointProblems: null,
    bpOrHeartMedication: null,
    informationCorrect: null,
    otherReasonsNotToExercise: null,
    otherReasonsDetails: '',
    healthChangeAcknowledged: null,
    additionalQuestions: '',
  })

  const [goals, setGoals] = useState({
    goals: '',
    plannedStartDate: '',
    seriousnessScore: 7,
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const contactComplete = useMemo(
    () =>
      contact.fullName.trim().length >= 2 &&
      /\S+@\S+\.\S+/.test(contact.email) &&
      contact.phone.trim().length >= 5 &&
      contact.country.trim().length >= 2 &&
      contact.address.trim().length >= 3 &&
      !!contact.dateOfBirth,
    [contact]
  )

  const parqComplete = useMemo(() => {
    const allAnswered = PARQ_QUESTIONS.every((q) => parq[q.key] !== null)
    const ackAnswered = parq.healthChangeAcknowledged !== null
    return allAnswered && ackAnswered
  }, [parq])

  const goalsComplete = useMemo(
    () =>
      goals.goals.trim().length > 0 &&
      !!goals.plannedStartDate &&
      goals.seriousnessScore >= 1 &&
      goals.seriousnessScore <= 10,
    [goals]
  )

  const submit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const body = {
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        country: contact.country,
        address: contact.address,
        dateOfBirth: contact.dateOfBirth,
        heartCondition: parq.heartCondition === 'yes',
        chestPain: parq.chestPain === 'yes',
        dizzinessOrLossOfConsciousness: parq.dizzinessOrLossOfConsciousness === 'yes',
        boneOrJointProblems: parq.boneOrJointProblems === 'yes',
        bpOrHeartMedication: parq.bpOrHeartMedication === 'yes',
        informationCorrect: parq.informationCorrect === 'yes',
        otherReasonsNotToExercise: parq.otherReasonsNotToExercise === 'yes',
        otherReasonsDetails: parq.otherReasonsDetails.trim() || undefined,
        healthChangeAcknowledged: parq.healthChangeAcknowledged === 'yes',
        additionalQuestions: parq.additionalQuestions.trim() || undefined,
        goals: goals.goals,
        plannedStartDate: goals.plannedStartDate,
        seriousnessScore: Number(goals.seriousnessScore),
      }

      const res = await fetch('/api/events/parq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(
          json.error?.message || json.message || 'Could not submit the form. Please try again.'
        )
      }

      setStep('success')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const stepNumber = step === 'contact' ? 1 : step === 'parq' ? 2 : 3

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {step !== 'success' && (
          <>
            <div className="mb-2 text-sm font-semibold text-accent uppercase tracking-wider">
              Senior's Fitness Registration
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-dark mb-3">
              PAR-Q & Goals Form
            </h1>
            <p className="text-gray-600 mb-10 max-w-2xl">
              A short health screening so we can run a safe, personalized program for you.
              Takes about 3 minutes.
            </p>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-10">
              {[
                { n: 1, label: 'Contact' },
                { n: 2, label: 'Health screen' },
                { n: 3, label: 'Your goals' },
              ].map((s, i) => {
                const active = stepNumber === s.n
                const done = stepNumber > s.n
                return (
                  <div key={s.n} className="flex items-center flex-1">
                    <div
                      className={`flex items-center justify-center h-9 w-9 rounded-full font-bold text-sm transition ${
                        done
                          ? 'bg-accent text-primary-dark'
                          : active
                            ? 'bg-primary-dark text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {done ? '✓' : s.n}
                    </div>
                    <span
                      className={`ml-3 text-sm hidden sm:inline font-medium ${
                        active ? 'text-primary-dark' : 'text-gray-500'
                      }`}
                    >
                      {s.label}
                    </span>
                    {i < 2 && (
                      <div
                        className={`flex-1 mx-3 h-0.5 transition ${
                          done ? 'bg-accent' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {step === 'contact' && (
          <Card>
            <h2 className="text-2xl font-bold text-primary-dark mb-1">Your contact details</h2>
            <p className="text-gray-600 mb-8">We'll use this to send you event details and reminders.</p>

            <div className="space-y-5">
              <Field label="Full name (surname first)" required>
                <input
                  type="text"
                  value={contact.fullName}
                  onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                  placeholder="Okonkwo Amaka"
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Email address" required>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="you@email.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Mobile number" required>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Country" required>
                  <input
                    type="text"
                    value={contact.country}
                    onChange={(e) => setContact({ ...contact, country: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Date of birth" required>
                  <input
                    type="date"
                    value={contact.dateOfBirth}
                    onChange={(e) => setContact({ ...contact, dateOfBirth: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Residential address" required>
                <textarea
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  placeholder="Street, city, state"
                  className={`${inputCls} h-24 resize-none`}
                />
              </Field>
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={() => setStep('parq')}
                disabled={!contactComplete}
                className={primaryBtn(contactComplete)}
              >
                Continue →
              </button>
            </div>
          </Card>
        )}

        {step === 'parq' && (
          <Card>
            <h2 className="text-2xl font-bold text-primary-dark mb-1">PAR-Q health screen</h2>
            <p className="text-gray-600 mb-8">
              These questions help us flag any conditions that need a doctor's clearance before training.
              Answer honestly — your responses are confidential.
            </p>

            <div className="space-y-5">
              {PARQ_QUESTIONS.map((q, idx) => (
                <YesNoQuestion
                  key={q.key}
                  index={idx + 1}
                  label={q.label}
                  value={parq[q.key]}
                  onChange={(v) => setParq({ ...parq, [q.key]: v })}
                />
              ))}

              {parq.otherReasonsNotToExercise === 'yes' && (
                <Field label="Please share the details (Other)">
                  <textarea
                    value={parq.otherReasonsDetails}
                    onChange={(e) => setParq({ ...parq, otherReasonsDetails: e.target.value })}
                    placeholder="Tell us a little about the condition or reason"
                    className={`${inputCls} h-24 resize-none`}
                  />
                </Field>
              )}

              <div className="border-t border-gray-200 pt-6 mt-6">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Note:</strong> If your health changes so that you can answer "yes" to any of
                  the above questions, please let us know by email.
                </p>
                <YesNoQuestion
                  index={null}
                  label="Will you let us know if your health changes?"
                  yesLabel="Of course, thanks"
                  noLabel="I'm not sure if I will"
                  value={parq.healthChangeAcknowledged}
                  onChange={(v) => setParq({ ...parq, healthChangeAcknowledged: v })}
                />
              </div>

              <Field label="Any questions for us? (Optional)">
                <textarea
                  value={parq.additionalQuestions}
                  onChange={(e) => setParq({ ...parq, additionalQuestions: e.target.value })}
                  placeholder="We'll get back to you by email"
                  className={`${inputCls} h-24 resize-none`}
                />
              </Field>
            </div>

            <div className="flex justify-between items-center mt-10">
              <button
                onClick={() => setStep('contact')}
                className="text-gray-600 hover:text-primary-dark font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('goals')}
                disabled={!parqComplete}
                className={primaryBtn(parqComplete)}
              >
                Continue →
              </button>
            </div>
          </Card>
        )}

        {step === 'goals' && (
          <Card>
            <h2 className="text-2xl font-bold text-primary-dark mb-1">Your goals</h2>
            <p className="text-gray-600 mb-8">Tell us what you're aiming for and how committed you are.</p>

            <div className="space-y-6">
              <Field label="What are your goals?" required>
                <textarea
                  value={goals.goals}
                  onChange={(e) => setGoals({ ...goals, goals: e.target.value })}
                  placeholder="e.g. Improve balance and reduce joint pain"
                  className={`${inputCls} h-28 resize-none`}
                />
              </Field>

              <Field label="When do you plan to start training with us?" required>
                <input
                  type="date"
                  value={goals.plannedStartDate}
                  onChange={(e) => setGoals({ ...goals, plannedStartDate: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <div>
                <label className="block font-semibold text-primary-dark mb-3">
                  On a scale of 1–10, how serious are you about reaching your fitness goals?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={goals.seriousnessScore}
                    onChange={(e) =>
                      setGoals({ ...goals, seriousnessScore: parseInt(e.target.value, 10) })
                    }
                    className="flex-1 accent-blue-600"
                  />
                  <div className="w-14 text-center bg-primary-dark text-white font-bold py-2 rounded-lg">
                    {goals.seriousnessScore}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1 · Just exploring</span>
                  <span>10 · Fully committed</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-6 rounded">
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-10">
              <button
                onClick={() => setStep('parq')}
                className="text-gray-600 hover:text-primary-dark font-semibold"
                disabled={submitting}
              >
                ← Back
              </button>
              <button
                onClick={submit}
                disabled={!goalsComplete || submitting}
                className={primaryBtn(goalsComplete && !submitting)}
              >
                {submitting ? 'Submitting…' : 'Submit registration'}
              </button>
            </div>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 text-3xl mb-6">
                ✓
              </div>
              <h2 className="text-3xl font-bold text-primary-dark mb-3">You're registered!</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Thanks {contact.fullName.split(' ').slice(-1)[0] || 'there'} — we've received your
                PAR-Q and goals. Next step: complete payment to secure your spot. We'll send venue
                details and your access pass to <strong>{contact.email}</strong>.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/payment"
                  className="bg-accent hover:bg-accent-dark text-primary-dark px-8 py-3 rounded-lg font-semibold transition shadow-md"
                >
                  Continue to Payment →
                </Link>
                <Link
                  href="/event"
                  className="border-2 border-gray-300 hover:border-gray-400 text-primary-dark px-8 py-3 rounded-lg font-semibold transition"
                >
                  Back to event
                </Link>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}

// ─────────────────────────── UI primitives ───────────────────────────

const inputCls =
  'w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition placeholder:text-gray-400'

function primaryBtn(enabled: boolean) {
  return `px-8 py-3 rounded-lg font-semibold transition ${
    enabled
      ? 'bg-primary-dark hover:bg-primary-darker text-white shadow-md'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10">
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block font-semibold text-primary-dark mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function YesNoQuestion({
  index,
  label,
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}: {
  index: number | null
  label: string
  value: YesNo
  onChange: (v: YesNo) => void
  yesLabel?: string
  noLabel?: string
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/40">
      <p className="font-semibold text-primary-dark mb-3">
        {index !== null && <span className="text-accent mr-2">Q{index}.</span>}
        {label}
        <span className="text-red-500 ml-1">*</span>
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange('yes')}
          className={`flex-1 sm:flex-none sm:min-w-[120px] py-2.5 px-5 rounded-lg font-semibold border-2 transition ${
            value === 'yes'
              ? 'border-primary-dark bg-primary-dark text-white'
              : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
          }`}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange('no')}
          className={`flex-1 sm:flex-none sm:min-w-[120px] py-2.5 px-5 rounded-lg font-semibold border-2 transition ${
            value === 'no'
              ? 'border-primary-dark bg-primary-dark text-white'
              : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
          }`}
        >
          {noLabel}
        </button>
      </div>
    </div>
  )
}
