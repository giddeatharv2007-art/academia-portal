import React, { useState } from 'react'
import {
  ClipboardList, Search, Filter, CheckCircle2, XCircle,
  AlertCircle, Clock, Eye, ChevronDown,
} from 'lucide-react'

const allApplications = [
  { id: 1,  name: 'Aarav Sharma',    email: 'aarav@gmail.com',    program: 'B.Tech CSE',         status: 'under_review', date: '23 Sep 2026' },
  { id: 2,  name: 'Priya Mehta',     email: 'priya@gmail.com',    program: 'MBA Marketing',      status: 'accepted',     date: '22 Sep 2026' },
  { id: 3,  name: 'Rohan Patil',     email: 'rohan@gmail.com',    program: 'BCA Data Science',   status: 'pending_docs', date: '21 Sep 2026' },
  { id: 4,  name: 'Sneha Kulkarni',  email: 'sneha@gmail.com',    program: 'B.Sc Biotech',       status: 'rejected',     date: '20 Sep 2026' },
  { id: 5,  name: 'Karan Desai',     email: 'karan@gmail.com',    program: 'B.Com Finance',      status: 'accepted',     date: '19 Sep 2026' },
  { id: 6,  name: 'Ananya Joshi',    email: 'ananya@gmail.com',   program: 'M.Tech AI/ML',       status: 'under_review', date: '18 Sep 2026' },
  { id: 7,  name: 'Rahul Verma',     email: 'rahul@gmail.com',    program: 'B.Pharm',            status: 'pending_docs', date: '17 Sep 2026' },
  { id: 8,  name: 'Pooja Nair',      email: 'pooja@gmail.com',    program: 'BBA',                status: 'accepted',     date: '16 Sep 2026' },
]

const statusCfg = {
  under_review: { label: 'Under Review', Icon: AlertCircle,  cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20'   },
  accepted:     { label: 'Accepted',     Icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  pending_docs: { label: 'Pending Docs', Icon: Clock,        cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20'       },
  rejected:     { label: 'Rejected',     Icon: XCircle,      cls: 'text-red-400 bg-red-500/10 border-red-500/20'          },
}

const filters = ['All', 'Under Review', 'Accepted', 'Pending Docs', 'Rejected']

export default function AdvisorApplications() {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState('All')

  const statusKey = { 'Under Review': 'under_review', 'Accepted': 'accepted', 'Pending Docs': 'pending_docs', 'Rejected': 'rejected' }

  const shown = allApplications.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.program.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = active === 'All' || a.status === statusKey[active]
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all student admission applications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white
          rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-900/30">
          <ClipboardList size={15} /> New Application
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setActive(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
              ${active === f
                ? 'bg-rose-600/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/40 hover:text-slate-300'}`}>
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-600" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-slate-900/60 border border-slate-700/50 text-slate-300 text-xs rounded-lg
                pl-8 pr-3 py-2 focus:outline-none focus:border-rose-500/50 w-40 placeholder-slate-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#130810] border border-rose-900/30 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rose-900/30">
                {['Applicant', 'Program', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-900/20">
              {shown.length === 0
                ? <tr><td colSpan={5} className="text-center py-12 text-slate-600">No applications found.</td></tr>
                : shown.map(a => {
                    const s = statusCfg[a.status]
                    return (
                      <tr key={a.id} className="hover:bg-rose-500/5 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-rose-400 font-bold text-xs">{a.name[0]}</span>
                            </div>
                            <div>
                              <p className="text-slate-200 font-semibold">{a.name}</p>
                              <p className="text-slate-600 text-xs">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{a.program}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
                            <s.Icon size={11} />{s.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{a.date}</td>
                        <td className="px-5 py-3.5">
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 bg-rose-500/10 border border-rose-500/20
                            text-rose-400 rounded-lg transition-all hover:bg-rose-500/20">
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
