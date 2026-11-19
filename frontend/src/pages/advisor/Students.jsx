import React, { useState } from 'react'
import { Users, Search, MessageSquare, FileText, Calendar } from 'lucide-react'

const students = [
  { id: 1, name: 'Aarav Sharma',    email: 'aarav@gmail.com',   program: 'B.Tech CSE',       sessions: 3, status: 'Active',    avatar: 'A' },
  { id: 2, name: 'Priya Mehta',     email: 'priya@gmail.com',   program: 'MBA Marketing',    sessions: 5, status: 'Enrolled',  avatar: 'P' },
  { id: 3, name: 'Rohan Patil',     email: 'rohan@gmail.com',   program: 'BCA Data Science', sessions: 2, status: 'Active',    avatar: 'R' },
  { id: 4, name: 'Ananya Joshi',    email: 'ananya@gmail.com',  program: 'M.Tech AI/ML',     sessions: 4, status: 'Active',    avatar: 'A' },
  { id: 5, name: 'Pooja Nair',      email: 'pooja@gmail.com',   program: 'BBA',              sessions: 1, status: 'Enrolled',  avatar: 'P' },
]

const statusCls = {
  Active:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Enrolled: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export default function AdvisorStudents() {
  const [search, setSearch] = useState('')
  const shown = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.program.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Students</h1>
          <p className="text-slate-500 text-sm mt-0.5">Students assigned to your counselling pipeline</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-3 text-slate-600" />
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-slate-900/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl
              pl-9 pr-4 py-2.5 focus:outline-none focus:border-rose-500/50 w-52 placeholder-slate-600" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {shown.map(s => (
          <div key={s.id} className="bg-[#130810] border border-rose-900/30 rounded-2xl p-5 hover:border-rose-500/40 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-base">{s.avatar}</span>
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-sm">{s.name}</p>
                  <p className="text-slate-600 text-xs">{s.email}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCls[s.status]}`}>
                {s.status}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Program</span>
                <span className="text-slate-300 font-medium">{s.program}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Sessions</span>
                <span className="text-slate-300 font-medium">{s.sessions} completed</span>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-rose-900/30">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500/10
                hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-medium transition-all">
                <MessageSquare size={12} /> Message
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800/60
                hover:bg-slate-700/60 border border-slate-700/40 text-slate-400 rounded-xl text-xs font-medium transition-all">
                <Calendar size={12} /> Schedule
              </button>
              <button className="p-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40
                text-slate-400 rounded-xl transition-all">
                <FileText size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
