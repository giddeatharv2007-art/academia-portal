import React, { useState } from 'react'
import { Bell, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react'

const initialNotifs = [
  { id: 1, type: 'application', title: 'New Application Received',    body: 'Aarav Sharma applied for B.Tech CSE',       time: '10 min ago', read: false },
  { id: 2, type: 'document',    title: 'Document Pending Review',     body: 'Rohan Patil uploaded Aadhaar Card',          time: '1 hour ago',  read: false },
  { id: 3, type: 'session',     title: 'Session Reminder',            body: 'Counselling with Divya Joshi at 11:30 AM',  time: '2 hours ago', read: false },
  { id: 4, type: 'application', title: 'Application Status Updated',  body: 'Priya Mehta has been accepted',             time: 'Yesterday',   read: true  },
  { id: 5, type: 'document',    title: 'Document Verified',           body: 'Pooja Nair\'s Migration Certificate verified',time: 'Yesterday', read: true  },
]

const typeIcon = {
  application: AlertCircle,
  document:    CheckCircle2,
  session:     Clock,
}
const typeColor = {
  application: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  document:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  session:     'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export default function AdvisorNotifications() {
  const [notifs, setNotifs] = useState(initialNotifs)

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })))
  const remove = (id) => setNotifs(n => n.filter(x => x.id !== id))

  const unread = notifs.filter(n => !n.read).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-semibold">
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.length === 0 && (
          <div className="flex flex-col items-center py-16 bg-[#130810] border border-rose-900/30 rounded-2xl">
            <Bell size={36} className="text-rose-900 mb-3" />
            <p className="text-slate-500 text-sm">No notifications</p>
          </div>
        )}
        {notifs.map(n => {
          const Icon = typeIcon[n.type]
          return (
            <div key={n.id}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group
                ${n.read
                  ? 'bg-[#130810] border-rose-900/20'
                  : 'bg-rose-500/5 border-rose-500/20'}`}>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${typeColor[n.type]}`}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${n.read ? 'text-slate-400' : 'text-slate-200'}`}>
                    {n.title}
                    {!n.read && <span className="ml-2 w-2 h-2 rounded-full bg-rose-500 inline-block" />}
                  </p>
                  <span className="text-slate-600 text-xs flex-shrink-0">{n.time}</span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">{n.body}</p>
              </div>
              <button onClick={() => remove(n.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400
                  transition-all flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
