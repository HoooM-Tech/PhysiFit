'use client'

import React, { useState, useEffect } from 'react'
import { TrophyIcon, CloseIcon } from '@/components/Icons'

interface Exercise {
  name: string
  sets: number
  reps: number
  focus: 'strength' | 'balance' | 'mobility' | 'core' | 'cardio'
}

interface WorkoutPlayerProps {
  exercises: Exercise[]
  onClose: () => void
  onComplete: () => void
}

export default function WorkoutPlayer({ exercises, onClose, onComplete }: WorkoutPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completedSets, setCompletedSets] = useState<number>(0)
  const [timerVal, setTimerVal] = useState(30)
  const [timerRunning, setTimerRunning] = useState(false)

  const currentExercise = exercises[currentIdx]

  useEffect(() => {
    let interval: any
    if (timerRunning && timerVal > 0) {
      interval = setInterval(() => {
        setTimerVal((t) => t - 1)
      }, 1000)
    } else if (timerVal === 0) {
      setTimerRunning(false)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerVal])

  const handleNext = () => {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((i) => i + 1)
      setCompletedSets(0)
      setTimerVal(30)
      setTimerRunning(false)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1)
      setCompletedSets(0)
      setTimerVal(30)
      setTimerRunning(false)
    }
  }

  const progressPercentage = Math.round((currentIdx / exercises.length) * 100)

  return (
    <div className="fixed inset-0 bg-primary-darker/95 z-[100] flex flex-col justify-between p-4 sm:py-6 sm:px-12 text-white animate-fade-in overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <span className="text-accent text-xs font-bold uppercase tracking-[0.2em]">Active Session</span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase font-display">PhysiFit Workout Tracker</h2>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center font-bold text-xl border border-white/10 transition"
          aria-label="Close Workout Tracker"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {/* Main workout arena */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full my-4 sm:my-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 font-bold uppercase mb-2">
            <span>Exercise {currentIdx + 1} of {exercises.length}</span>
            <span>{progressPercentage}% Complete</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Active Exercise Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-6">
            <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {currentExercise.focus}
            </span>
            <span className="text-sm text-gray-300 font-bold">
              {currentExercise.sets} Sets x {currentExercise.reps} Reps
            </span>
          </div>

          <h3 className="font-display text-4xl sm:text-5xl uppercase tracking-condensed mb-4 text-white leading-none">
            {currentExercise.name}
          </h3>

          <p className="text-gray-300 text-sm leading-relaxed mb-4 sm:mb-6 italic">
            Focus on steady breathing and correct alignment. Press sets when finished!
          </p>

          {/* Set Checker */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[...Array(currentExercise.sets)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCompletedSets((c) => (i < c ? i : i + 1))}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-bold flex items-center justify-center border-2 transition ${
                  i < completedSets
                    ? 'bg-accent border-accent text-primary-darker'
                    : 'bg-white/5 border-white/20 text-white hover:border-white/40'
                }`}
              >
                {i < completedSets ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Timer Arena */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Rest Interval Timer</p>
            <div className="font-display text-4xl font-bold text-accent">
              00:{timerVal.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTimerRunning((r) => !r)}
              className="px-6 py-2.5 rounded-xl bg-accent text-primary-darker font-bold uppercase tracking-wider text-xs hover:bg-accent-dark transition"
            >
              {timerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false)
                setTimerVal(30)
              }}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs border border-white/20 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Footer Controllers */}
      <div className="flex justify-between items-center border-t border-white/10 pt-6">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold uppercase tracking-wider text-sm transition flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Previous
        </button>

        <button
          onClick={handleNext}
          className="px-8 py-3 bg-accent text-primary-darker hover:bg-accent-dark rounded-xl font-bold uppercase tracking-wider text-sm transition shadow-lg hover:shadow-accent/20 flex items-center gap-2"
        >
          {currentIdx === exercises.length - 1 ? (
            <>
              Finish Workout <TrophyIcon size={16} />
            </>
          ) : (
            <>
              Next Exercise
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
