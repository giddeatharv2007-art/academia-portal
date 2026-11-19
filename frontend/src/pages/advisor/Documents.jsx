import React, { useState } from 'react'
import { FileCheck, CheckCircle2, Clock, XCircle, Eye, Download } from 'lucide-react'

const docs = [
  { id: 1, student: 'Aarav Sharma',   type: '10th Marksheet',       status: 'pending',  size: '1.2 MB', date: '23 Sep 2026' },
  { id: 2, student: 'Priya Mehta',    type: 'Graduation Certificate',status: 'verified', size: '2.1 MB', date: '22 Sep 2026' },
  { id: 3, student: 'Rohan Patil',    type: 'Aadhaar Card',          status: 'pending',  size: '0.8 MB', date: '21 Sep 2026' },
  { id: 4, student: 'Ananya Joshi',   type: '12th Marksheet',        status: 'rejected', size: '1.5 MB', date: '20 Sep 2026' },
  { id: 5, student: 'Pooja Nair',     type: 'Migration Certificate', status: 'verified', size: '0.9 MB', date: '19 Sep 2026' },
  { id: 6, student: 'Karan Desai',    type: 'Income Certificate',    status: 'pending',  size: '0.7 MB', date: '18 Sep 2026' },
]

const statusCfg = {
  pending:  { label: 'Pending',  Icon: Clock,        cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20'   },
  verified: { label: 'Verified', Icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  rejected: { label: 'Rejected', Icon: XCircle,      cls: 'text-red-400 bg-red-500/10 border-red-500/20'         },
}

export default function AdvisorDocuments() {
  const [filter, setFilter] = useState('all')

  const shown = docs.filter(d => filter === 'all' || d.status === filter)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and verify student admission documents</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'verified', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all
                ${filter === f
                  ? 'bg-rose-600/20 text-rose-400 border-rose-500/30'
                  : 'bg-slate-800/40 text-slate-500 border-slate-700/40 hover:text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {shown.map(d => {
          const s = statusCfg[d.status]
          return (
            <div key={d.id} className="bg-[#130810] border border-rose-900/30 rounded-2xl p-4
              flex items-center gap-4 hover:border-rose-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <FileCheck size={18} className="text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-semibold text-sm">{d.type}</p>
                <p className="text-slate-500 text-xs">{d.student} · {d.size} · {d.date}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls} flex-shrink-0`}>
                <s.Icon size={11} />{s.label}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-all">
                  <Eye size={13} />
                </button>
                {d.status === 'pending' && (
                  <>
                    <button className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all">
                      <CheckCircle2 size={13} />
                    </button>
                    <button className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">
                      <XCircle size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
