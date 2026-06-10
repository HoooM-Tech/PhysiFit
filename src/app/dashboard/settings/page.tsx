"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ClientSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!confirm('Delete your account? This action is irreversible.')) return
    setLoading(true)
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete account')
      // redirect home
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <p className="text-gray-600 mb-6">Manage your account and privacy settings.</p>

      <div className="border rounded-lg p-6">
        <h2 className="font-semibold mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">Delete your account and all associated data.</p>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <button
          disabled={loading}
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete my account'}
        </button>
      </div>
    </div>
  )
}
