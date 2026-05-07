'use client'

import Header from '@/components/Header'
 import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'messages' | 'plan'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState([
    {
      name: 'Amaka Okonkwo',
      preview: 'Thank you Tolu!',
      unread: true,
      role: 'Active Client · Senior Fitness',
      messages: [
        {
          from: 'trainer',
          text: "Hello Amaka! I've reviewed your assessment and created your fitness plan. Check it out!",
          time: 'Feb 12, 2:00 PM',
        },
        {
          from: 'client',
          text: "That's wonderful, thank you so much Tolu! I can see it. The exercises look manageable 😊",
          time: 'Feb 12, 2:15 PM',
        },
        {
          from: 'trainer',
          text: 'Great! Remember to stay hydrated before our sessions. See you on the 14th at 3 PM 💪',
          time: 'Feb 12, 2:17 PM',
        },
      ],
    },
    {
      name: 'Ngozi Eze',
      preview: 'Looking forward to it!',
      unread: false,
      role: 'Postpartum Client · Recovery Plan',
      messages: [
        {
          from: 'client',
          text: 'Looking forward to our next session and next week’s adjustments.',
          time: 'Feb 8, 11:20 AM',
        },
        {
          from: 'trainer',
          text: 'That sounds great, Ngozi. I’ll update your plan with the new core work.',
          time: 'Feb 8, 11:25 AM',
        },
      ],
    },
    {
      name: 'Biodun Kujore',
      preview: 'See you tomorrow!',
      unread: false,
      role: 'Corporate Wellness · Team Lead',
      messages: [
        {
          from: 'client',
          text: 'See you tomorrow! We are excited for the team session.',
          time: 'Feb 10, 4:00 PM',
        },
        {
          from: 'trainer',
          text: 'Perfect. I’ll bring the group warm-up and the team challenge.',
          time: 'Feb 10, 4:05 PM',
        },
      ],
    },
  ])
  const [selectedConversation, setSelectedConversation] = useState(conversations[0].name)
  const [messageText, setMessageText] = useState('')

  const activeConversation =
    conversations.find((conv) => conv.name === selectedConversation) ?? conversations[0]

  const handleSelectConversation = (name: string) => {
    setSelectedConversation(name)
    setConversations((prev) =>
      prev.map((conv) =>
        conv.name === name ? { ...conv, unread: false } : conv
      )
    )
  }

  const handleSendMessage = () => {
    const trimmed = messageText.trim()
    if (!trimmed) return

    setConversations((prev) =>
      prev.map((conv) =>
        conv.name === selectedConversation
          ? {
              ...conv,
              preview: trimmed,
              messages: [
                ...conv.messages,
                { from: 'trainer', text: trimmed, time: 'Now' },
              ],
            }
          : conv
      )
    )
    setMessageText('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen ? (
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 transition-all duration-300">
            <div className="mb-8">
              <h2 className="text-lg font-bold">Physi Fit NG</h2>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase text-gray-500 font-bold mb-4">MENU</p>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏠 Overview
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'sessions'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📅 My Sessions
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition relative ${
                    activeTab === 'messages'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💬 Messages
                  <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button
                  onClick={() => setActiveTab('plan')}
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
                <Link href="/book-session" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                  ➕ Book Sessions
                </Link>
                <button
                  onClick={() => router.push('/')}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  🚪 Sign Out
                </button>
              </nav>
            </div>
          </div>
        ) : (
          <div className="w-16 bg-white border-r border-gray-200 min-h-screen flex items-center justify-center transition-all duration-300">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-full bg-blue-600 p-3 text-white shadow-lg"
            >
              ☰
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              {sidebarOpen ? '←' : '☰'}
            </button>
          </div>
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">Good morning, Amaka 👋</h1>
              <p className="text-gray-600 mb-8">Here's your fitness overview for this week.</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-blue-600 text-white rounded-xl p-8">
                  <p className="text-gray-200 text-sm uppercase mb-2">TOTAL SESSIONS</p>
                  <p className="text-4xl font-bold mb-2">8</p>
                  <p className="text-sm">Booked · Senior Fitness</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <p className="text-gray-600 text-sm uppercase mb-2">COMPLETED</p>
                  <p className="text-4xl font-bold mb-2">3</p>
                  <p className="text-sm text-gray-600">37.5% of plan done</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <p className="text-gray-600 text-sm uppercase mb-2">UPCOMING</p>
                  <p className="text-4xl font-bold mb-2">5</p>
                  <p className="text-sm text-gray-600">Next: Feb 14, 3:00 PM</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <p className="text-gray-600 text-sm uppercase mb-2">MISSED</p>
                  <p className="text-4xl font-bold mb-2">0</p>
                  <p className="text-sm text-gray-600">Great attendance!</p>
                </div>
              </div>

              {/* Trainer Card */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 mb-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-15 h-15 bg-blue-200 rounded-full">
                        <Image
                        src="/images/trainer.jpg"
                        alt="Trainer avatar"
                        width={350}
                        height={350}
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Tolu at PhysiFit</h3>
                      <p className="text-gray-600 mb-2">Your assigned trainer · Senior Fitness Specialist</p>
                      <p className="text-green-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Online now
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      💬 Message
                    </button>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                      📞 Call
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
                  <button onClick={() => setActiveTab('sessions')} className="text-blue-600 font-semibold hover:text-blue-700">
                    View all →
                  </button>
                </div>

                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">SESSION</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">DATE & TIME</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">TYPE</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { num: 1, date: 'Feb 14, 3:00 PM', type: 'Senior Fitness · 1-on-1', status: 'Upcoming' },
                        { num: 2, date: 'Feb 17, 3:00 PM', type: 'Senior Fitness · 1-on-1', status: 'Upcoming' },
                        { num: 3, date: 'Feb 21, 3:00 PM', type: 'Senior Fitness · 1-on-1', status: 'Upcoming' },
                      ].map((session) => (
                        <tr key={session.num} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold">Session {session.num}</td>
                          <td className="px-6 py-4">{session.date}</td>
                          <td className="px-6 py-4">{session.type}</td>
                          <td className="px-6 py-4">
                            <span className="text-blue-600 font-semibold">{session.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <h2 className="text-2xl font-bold">All Sessions</h2>
                  <Link href="/book-session" className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition">
                    + Book More
                  </Link>
                </div>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">SESSION</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">DATE & TIME</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">TYPE</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { num: 1, date: 'Jan 28, 3:00 PM', type: 'Physical Assessment', status: 'Assessment' },
                        { num: 2, date: 'Jan 31, 3:00 PM', type: 'Senior Fitness · 1-on-1', status: 'Completed' },
                        { num: 3, date: 'Feb 3, 3:00 PM', type: 'Senior Fitness · 1-on-1', status: 'Completed' },
                        { num: 4, date: 'Feb 14, 3:00 PM', type: 'Senior Fitness · 1-on-1', status: 'Upcoming' },
                      ].map((session) => (
                        <tr key={session.num} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold">Session {session.num}</td>
                          <td className="px-6 py-4">{session.date}</td>
                          <td className="px-6 py-4">{session.type}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                session.status === 'Completed'
                                  ? 'bg-green-100 text-green-700'
                                  : session.status === 'Assessment'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'text-blue-600'
                              }`}
                            >
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">Messages</h1>
              <p className="text-gray-600 mb-8">All client communications in one place.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Conversation List */}
                <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-bold mb-4">Conversations</h3>
                  <div className="space-y-3">
                    {conversations.map((conv) => (
                      <div
                        key={conv.name}
                        onClick={() => handleSelectConversation(conv.name)}
                        className={`p-3 rounded-lg cursor-pointer transition hover:bg-gray-50 ${
                          conv.name === selectedConversation
                            ? 'bg-blue-50 border border-blue-200'
                            : conv.unread
                            ? 'bg-gray-50 border border-gray-100'
                            : ''
                        }`}
                      >
                        <p className="font-bold text-sm">{conv.name}</p>
                        <p className="text-xs text-gray-600">{conv.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat */}
                <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col">
                  <div className="border-b border-gray-200 p-6">
                    <h3 className="font-bold">{activeConversation.name}</h3>
                    <p className="text-sm text-gray-600">{activeConversation.role}</p>
                  </div>

                  <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-96">
                    {activeConversation.messages.map((message, index) => (
                      <div key={`${message.time}-${index}`}>
                        <div className={`flex ${message.from === 'trainer' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`rounded-lg p-4 max-w-xs ${
                              message.from === 'trainer'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                        <div
                          className={`text-xs text-gray-400 ${
                            message.from === 'trainer' ? 'text-right' : ''
                          }`}
                        >
                          {message.time}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 p-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={`Reply to ${activeConversation.name}...`}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        ↑
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">My Fitness Plan</h1>
              <p className="text-gray-600 mb-8">Your personalized training plan — built after your assessment.</p>

              <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-10 shadow-sm">
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                  <div className="rounded-3xl border border-gray-100 p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Weight</p>
                    <p className="text-4xl font-bold">72</p>
                    <p className="text-gray-500">kg</p>
                  </div>
                  <div className="rounded-3xl border border-gray-100 p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">BMI</p>
                    <p className="text-4xl font-bold">26.4</p>
                    <p className="text-gray-500">normal range</p>
                  </div>
                  <div className="rounded-3xl border border-gray-100 p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">Fitness Level</p>
                    <p className="text-4xl font-bold">Moderate</p>
                    <p className="text-gray-500">baseline</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-gray-50 border border-gray-100 p-6">
                  <p className="text-sm text-gray-500 mb-2">Trainer Notes:</p>
                  <p className="text-gray-700">
                    Good mobility in upper body. Slight stiffness in right knee — will avoid high-impact exercises. Focus: balance, core strength, and gentle cardio. Client is motivated and consistent.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">Exercise Plan — Sessions 2-8</h2>
                    <p className="text-gray-500">Active Plan</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-blue-600 text-sm font-semibold">Active Plan</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-sm text-gray-500 uppercase">
                        <th className="px-4 py-4">Exercise</th>
                        <th className="px-4 py-4">Sets</th>
                        <th className="px-4 py-4">Reps</th>
                        <th className="px-4 py-4">Focus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { exercise: 'Chair Squats', sets: '3', reps: '12', focus: 'Strength', color: 'bg-blue-100 text-blue-700' },
                        { exercise: 'Standing Balance Hold', sets: '2', reps: '30s', focus: 'Balance', color: 'bg-yellow-100 text-yellow-700' },
                        { exercise: 'Resistance Band Rows', sets: '3', reps: '15', focus: 'Strength', color: 'bg-blue-100 text-blue-700' },
                        { exercise: 'Gentle Torso Rotations', sets: '2', reps: '20', focus: 'Core', color: 'bg-emerald-100 text-emerald-700' },
                        { exercise: 'Heel Toe Walking', sets: '3', reps: '20m', focus: 'Balance', color: 'bg-yellow-100 text-yellow-700' },
                        { exercise: 'Seated Leg Extensions', sets: '3', reps: '15', focus: 'Mobility', color: 'bg-sky-100 text-sky-700' },
                        { exercise: 'Light Stationary Walk', sets: '1', reps: '10min', focus: 'Cardio', color: 'bg-emerald-100 text-emerald-700' },
                      ].map((row) => (
                        <tr key={row.exercise} className="bg-gray-50">
                          <td className="px-4 py-4 font-semibold">{row.exercise}</td>
                          <td className="px-4 py-4 text-gray-600">{row.sets}</td>
                          <td className="px-4 py-4 text-gray-600">{row.reps}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${row.color}`}>
                              {row.focus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
