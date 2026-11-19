import React, { useEffect, useState } from 'react'
import { notificationsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const typeColors = {
  match: 'bg-blue-100 text-blue-700',
  application: 'bg-purple-100 text-purple-700',
  shortlist: 'bg-green-100 text-green-700',
  interview: 'bg-indigo-100 text-indigo-700',
  badge: 'bg-yellow-100 text-yellow-700',
  challenge: 'bg-orange-100 text-orange-700',
  general: 'bg-gray-100 text-gray-600',
  rejection: 'bg-red-100 text-red-600',
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = () => {
    notificationsAPI.list()
      .then(res => setNotifs(res.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const markAllRead = async () => {
    await notificationsAPI.markAllRead()
    setNotifs(notifs.map(n => ({ ...n, is_read: true })))
    toast.success('All marked as read')
  }

  const clearRead = async () => {
    await notificationsAPI.clear()
    setNotifs(notifs.filter(n => !n.is_read))
    toast.success('Cleared read notifications')
  }

  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-blue-600">{unreadCount} unread</p>}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-1">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <button onClick={clearRead} className="btn-secondary text-sm flex items-center gap-1 text-red-600">
            <Trash2 size={14} /> Clear read
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner center /> : notifs.length === 0 ?
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" /> : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id}
              className={`card p-4 transition-all ${!n.is_read ? 'border-l-4 border-l-blue-500' : 'opacity-70'}`}>
              <div className="flex items-start gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${typeColors[n.notif_type] || typeColors.general}`}>
                  {n.notif_type?.replace('_', ' ')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
