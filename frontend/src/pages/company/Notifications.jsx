import React, { useEffect, useState } from 'react'
import { notificationsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { Bell, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CompanyNotifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationsAPI.list()
      .then(res => setNotifs(res.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await notificationsAPI.markAllRead()
    setNotifs(notifs.map(n => ({ ...n, is_read: true })))
    toast.success('All marked as read')
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-1">
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      {loading ? <LoadingSpinner center /> : notifs.length === 0 ?
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" /> : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} className={`card p-4 ${!n.is_read ? 'border-l-4 border-l-emerald-500' : 'opacity-70'}`}>
              <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
