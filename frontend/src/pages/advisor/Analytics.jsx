import React from 'react'
import { BarChart3, TrendingUp, Users, ClipboardList, FileCheck } from 'lucide-react'

const monthlyData = [
  { month: 'Apr', enquiries: 38, applied: 22, enrolled: 10 },
  { month: 'May', enquiries: 45, applied: 28, enrolled: 14 },
  { month: 'Jun', enquiries: 52, applied: 31, enrolled: 16 },
  { month: 'Jul', enquiries: 41, applied: 24, enrolled: 11 },
  { month: 'Aug', enquiries: 60, applied: 38, enrolled: 19 },
  { month: 'Sep', enquiries: 55, applied: 35, enrolled: 18 },
]
const maxVal = 60

const programs = [
  { name: 'B.Tech CSE',       apps: 34, enrolled: 18, rate: '53%' },
  { name: 'MBA Marketing',    apps: 28, enrolled: 12, rate: '43%' },
  { name: 'BCA Data Science', apps: 22, enrolled: 9,  rate: '41%' },
  { name: 'M.Tech AI/ML',     apps: 19, enrolled: 8,  rate: '42%' },
  { name: 'B.Com Finance',    apps: 15, enrolled: 7,  rate: '47%' },
]

export default function AdvisorAnalytics() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Admission Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Conversion rates, yield data and admission trends</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Enquiries',  value: '291', icon: Users,        color: 'rose'    },
          { label: 'Applications',     value: '178', icon: ClipboardList, color: 'pink'    },
          { label: 'Enrolled',         value: '88',  icon: TrendingUp,   color: 'emerald' },
          { label: 'Docs Verified',    value: '61',  icon: FileCheck,    color: 'blue'    },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-2xl bg-${color}-500/10 border border-${color}-500/20 p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs">{label}</span>
              <Icon size={15} className={`text-${color}-400`} />
            </div>
            <p className={`text-2xl font-extrabold text-${color}-400`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-[#130810] border border-rose-900/30 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold">Monthly Trend</h2>
            <p className="text-slate-600 text-xs mt-0.5">Enquiries · Applied · Enrolled</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />Enquiries</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />Applied</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />Enrolled</span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-32">
                {[
                  { val: d.enquiries, color: 'bg-rose-500'   },
                  { val: d.applied,   color: 'bg-pink-500'   },
                  { val: d.enrolled,  color: 'bg-purple-500' },
                ].map(({ val, color }, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div className={`w-full ${color} rounded-t opacity-80 transition-all`}
                      style={{ height: `${(val / maxVal) * 100}%` }} />
                  </div>
                ))}
              </div>
              <span className="text-slate-600 text-xs">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Program breakdown */}
      <div className="bg-[#130810] border border-rose-900/30 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-rose-900/30">
          <h2 className="text-white font-bold">Program Breakdown</h2>
          <p className="text-slate-600 text-xs mt-0.5">Applications and enrolment by program</p>
        </div>
        <div className="divide-y divide-rose-900/20">
          {programs.map(p => (
            <div key={p.name} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-semibold">{p.name}</p>
                <div className="mt-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                    style={{ width: p.rate }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-slate-400 text-xs">{p.apps} applied · {p.enrolled} enrolled</p>
                <p className="text-rose-400 font-bold text-sm">{p.rate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
