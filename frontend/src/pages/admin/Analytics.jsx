import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AdminAnalytics() {
  const [demand, setDemand] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.industryDemand()
      .then(res => setDemand(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner center />

  const chartData = demand?.skill_analysis?.slice(0, 10).map(s => ({
    skill: s.skill,
    'Industry Demand': s.demand_percentage,
    'Student Availability': s.student_availability_percentage,
    'Gap': s.gap_percentage,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Industry Skill Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">{demand?.summary}</p>
      </div>

      {/* Summary stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{demand?.total_postings_analyzed}</p>
          <p className="text-sm text-gray-500">Job/Internship Postings Analyzed</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{demand?.total_students}</p>
          <p className="text-sm text-gray-500">Students in Database</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-500">{demand?.top_gap_skills?.length}</p>
          <p className="text-sm text-gray-500">Skills with High Gap (&gt;20%)</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Industry Demand vs Student Availability (%)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="skill" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Industry Demand" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="Student Availability" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Skill gap table */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Skill Gap Analysis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Skill', 'Industry Demand', 'Student Availability', 'Gap', 'Severity', 'Recommendation'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {demand?.skill_analysis?.map(s => (
                <tr key={s.skill} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.skill}</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">{s.demand_percentage}%</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{s.student_availability_percentage}%</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${s.gap_percentage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {s.gap_percentage > 0 ? '+' : ''}{s.gap_percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                      ${s.gap_severity === 'high' ? 'bg-red-100 text-red-700' : s.gap_severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {s.gap_severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.recommendation || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High gap skills alert */}
      {demand?.top_gap_skills?.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 mb-2">High-Gap Skills — Action Required</p>
              <div className="flex flex-wrap gap-2">
                {demand.top_gap_skills.map(s => (
                  <span key={s} className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
              <p className="text-sm text-red-600 mt-2">
                These skills have &gt;20% gap between industry demand and student availability.
                Consider creating training programs for these skills.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
