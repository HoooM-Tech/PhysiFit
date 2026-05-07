'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrainerPortal() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'clients' | 'today' | 'messages'>('clients')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState([
    {
      name: 'Amaka Okonkwo',
      preview: 'Thank you Tolu!',
      unread: true,
      role: 'Senior Fitness Client',
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
      role: 'Postpartum Client',
      messages: [
        {
          from: 'client',
          text: 'Looking forward to our next session and next week\'s adjustments.',
          time: 'Feb 8, 11:20 AM',
        },
        {
          from: 'trainer',
          text: 'That sounds great, Ngozi. I\'ll update your plan with the new core work.',
          time: 'Feb 8, 11:25 AM',
        },
      ],
    },
    {
      name: 'Biodun Kujore',
      preview: 'See you tomorrow!',
      unread: false,
      role: 'Corporate Wellness Lead',
      messages: [
        {
          from: 'client',
          text: 'See you tomorrow! We are excited for the team session.',
          time: 'Feb 10, 4:00 PM',
        },
        {
          from: 'trainer',
          text: 'Perfect. I\'ll bring the group warm-up and the team challenge.',
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

  const handleMessageClick = (clientName: string) => {
    handleSelectConversation(clientName)
    setActiveTab('messages')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen ? (
          <div className="w-64 bg-gray-900 text-white min-h-screen p-6 transition-all duration-300">
            <div className="mb-12">
              <h2 className="text-lg font-bold">Physi Fit NG</h2>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase text-gray-400 font-bold mb-4">TRAINER PORTAL</p>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'clients'
                      ? 'bg-blue-600'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  👥 My Clients
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'today'
                      ? 'bg-blue-600'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  📅 Today's Sessions
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition relative ${
                    activeTab === 'messages'
                      ? 'bg-blue-600'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  💬 Messages
                  <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </nav>
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase text-gray-400 font-bold mb-4">ACCOUNT</p>
              <nav className="space-y-2">
                <div className="px-4 py-3">
                  <p className="text-sm">Tolu at PhysiFit</p>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg transition"
                >
                  🚪 Sign Out
                </button>
              </nav>
            </div>
          </div>
        ) : (
          <div className="w-16 bg-gray-900 min-h-screen flex items-center justify-center transition-all duration-300">
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
          {activeTab === 'clients' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">My Clients</h1>
              <p className="text-gray-600 mb-8">Manage all your assigned clients and their progress.</p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-blue-600 text-white rounded-xl p-8">
                  <p className="text-gray-200 text-sm uppercase mb-2">ACTIVE CLIENTS</p>
                  <p className="text-4xl font-bold mb-2">6</p>
                  <p className="text-sm">All programs running</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <p className="text-gray-600 text-sm uppercase mb-2">SESSIONS TODAY</p>
                  <p className="text-4xl font-bold mb-2">3</p>
                  <p className="text-sm text-gray-600">Next at 10:00 AM</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <p className="text-gray-600 text-sm uppercase mb-2">THIS MONTH</p>
                  <p className="text-4xl font-bold mb-2">24</p>
                  <p className="text-sm text-gray-600">Sessions completed</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <p className="text-gray-600 text-sm uppercase mb-2">ATTENDANCE</p>
                  <p className="text-4xl font-bold mb-2">96%</p>
                  <p className="text-sm text-gray-600">Excellent client rate</p>
                </div>
              </div>

              {/* Client List */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">CLIENT</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">SERVICE</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">PROGRESS</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">NEXT SESSION</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Amaka Okonkwo', service: 'Senior Fitness', progress: '3/8 sessions', next: 'Feb 14, 3:00 PM' },
                      { name: 'Biodun Kujore', service: 'Corporate Wellness', progress: '6/12 sessions', next: 'Feb 14, 10:00 AM' },
                      { name: 'Ngozi Eze', service: 'Postpartum', progress: '1/8 sessions', next: 'Feb 15, 11:00 AM' },
                    ].map((client) => (
                      <tr key={client.name} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                            <span className="font-bold">{client.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {client.service}
                          </span>
                        </td>
                        <td className="px-6 py-4">{client.progress}</td>
                        <td className="px-6 py-4 text-gray-600">{client.next}</td>
                        <td className="px-6 py-4">
                          <Link href="#" className="text-blue-600 font-semibold hover:text-blue-700">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'today' && (
            <div>
              <h1 className="text-4xl font-bold mb-2">Today's Sessions</h1>
              <p className="text-gray-600 mb-8">
                Monday, February 14, 2025
              </p>

              <div className="space-y-6">
                {[
                  { time: '10:00 AM', client: 'Biodun Kujore', type: 'Corporate Wellness · Group · Session 7/12', color: 'border-l-blue-600' },
                  { time: '1:00 PM', client: 'Remi Adeyemi', type: 'Senior Fitness · 1-on-1 · Session 2/8', color: 'border-l-green-600' },
                  { time: '3:00 PM', client: 'Amaka Okonkwo', type: 'Senior Fitness · 1-on-1 · Session 4/8', color: 'border-l-blue-600' },
                ].map((session) => (
                  <div key={session.time} className={`border-l-4 ${session.color} bg-white rounded-lg p-6 border border-gray-200 border-l-4`}>
                    <p className="text-lg font-bold mb-1">{session.time}</p>
                    <p className="text-2xl font-bold mb-2">{session.client}</p>
                    <p className="text-gray-600 mb-4">{session.type}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleMessageClick(session.client)}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition"
                      >
                        💬 Message
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                        ✓ I'm Here
                      </button>
                    </div>
                  </div>
                ))}
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
                        <div className={`flex ${message.from === 'trainer' ? 'justify-start' : 'justify-end'}`}>
                          <div
                            className={`rounded-lg p-4 max-w-xs ${
                              message.from === 'trainer'
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                        <div
                          className={`text-xs text-gray-400 ${
                            message.from === 'trainer' ? '' : 'text-right'
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
        </div>
      </div>
    </div>
  )
}
