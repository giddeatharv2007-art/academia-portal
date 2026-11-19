import React, { useEffect, useState } from 'react'
import { matchingAPI, studentAPI } from '../../services/api'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { CheckCircle, XCircle, Target, TrendingUp, ArrowRight, Map } from 'lucide-react'

export default function SkillGap() {
  const [gap, setGap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('')
  const [inputRole, setInputRole] = useState('')

  const roles = [
    'Backend Developer', 'Frontend Developer', 'Full Stack Developer',
    'Data Scientist', 'AI/ML Engineer', 'Data Analyst', 'DevOps Engineer',
    'Mobile Developer', 'Cybersecurity',
  ]

  const fetchGap = (r) => {
    setLoading(true)
    matchingAPI.skillGap(r)
      .then(res => setGap(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Get career goal from profile
    studentAPI.getProfile()
      .then(res => {
        const r = res.data.career_goal || 'Backend Developer'
        setRole(r)
        setInputRole(r)
        fetchGap(r)
      })
      .catch(() => {
        setRole('Backend Developer')
        fetchGap('Backend Developer')
      })
  }, [])

  const handleRoleChange = (r) => {
    setRole(r)
    setInputRole(r)
    fetchGap(r)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h1>
        <p className="text-gray-500 text-sm mt-1">Understand what skills you need for your target role</p>
      </div>

      {/* Role selector */}
      <div className="card">
        <label className="label">Target Role</label>
        <div className="flex gap-2 mb-3">
          <input className="input flex-1" placeholder="e.g. Backend Developer"
            value={inputRole} onChange={e => setInputRole(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRoleChange(inputRole)} />
          <button onClick={() => handleRoleChange(inputRole)} className="btn-primary px-4">Analyze</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <button key={r} onClick={() => handleRoleChange(r)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                ${role === r ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner center /> : gap && (
        <>
          {/* Readiness bars */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-1">Target Role: <span className="text-blue-600">{gap.target_role}</span></h2>
            <p className="text-sm text-gray-500 mb-4">
              You have {gap.covered_count} of {gap.total_role_skills} skills required for this role.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Current Job Readiness</span>
                  <span className="font-bold text-orange-600">{gap.current_readiness}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full progress-bar" style={{ width: `${gap.current_readiness}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Potential Readiness (after learning missing skills)</span>
                  <span className="font-bold text-green-600">{gap.potential_readiness}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full progress-bar" style={{ width: `${gap.potential_readiness}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center gap-2">
              <TrendingUp size={16} />
              Learning {gap.missing_required?.length} required skills could boost your readiness by{' '}
              <strong>{(gap.potential_readiness - gap.current_readiness).toFixed(1)}%</strong>
            </div>
          </div>

          {/* Skills breakdown */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Have skills */}
            {gap.has_skills?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} /> Skills You Have ({gap.has_skills.length})
                </h3>
                <div className="space-y-1.5">
                  {gap.has_skills.map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle size={13} className="flex-shrink-0" /> {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing required */}
            {gap.missing_required?.length > 0 && (
              <div className="card border-red-100">
                <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <XCircle size={16} /> Required — Missing ({gap.missing_required.length})
                </h3>
                <div className="space-y-1.5">
                  {gap.missing_required.map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle size={13} className="flex-shrink-0" /> {s}
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 rounded ml-auto">Critical</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing intermediate */}
            {gap.missing_intermediate?.length > 0 && (
              <div className="card border-yellow-100">
                <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                  <Target size={16} /> Intermediate — Missing ({gap.missing_intermediate.length})
                </h3>
                <div className="space-y-1.5">
                  {gap.missing_intermediate.map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm text-yellow-700">
                      <XCircle size={13} className="flex-shrink-0" /> {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="card bg-gradient-to-r from-blue-50 to-violet-50 border-blue-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Ready to close the gap?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your personalized learning roadmap is ready with {gap.missing_required?.length + gap.missing_intermediate?.length} skills to master.
                </p>
              </div>
              <Link to="/student/roadmap" className="btn-primary flex items-center gap-2 flex-shrink-0">
                <Map size={16} /> View Learning Roadmap <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
