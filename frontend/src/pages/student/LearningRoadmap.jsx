import React, { useEffect, useState } from 'react'
import { matchingAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { CheckCircle, Clock, ExternalLink, Map, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

function RoadmapItem({ item, index }) {
  const [done, setDone] = useState(item.status === 'completed')
  const [expanded, setExpanded] = useState(false)

  const diffColor = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  }

  return (
    <div className={`card border-l-4 transition-all ${done ? 'border-l-green-500 opacity-75' : 'border-l-blue-500'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
          ${done ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-700'}`}>
          {done ? <CheckCircle size={16} /> : index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{item.skill}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${diffColor[item.difficulty]}`}>
                  {item.difficulty}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={11} /> ~{item.estimated_hours}h
                </span>
              </div>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 mt-0.5">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {expanded && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm">
                <BookOpen size={14} className="text-blue-600 flex-shrink-0" />
                <span className="text-blue-700 font-medium">{item.recommended_resource}</span>
                <a href={item.resource_url} target="_blank" rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-auto flex-shrink-0">
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}
        </div>
        <button onClick={() => setDone(!done)}
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 transition-colors
            ${done ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {done ? 'Done ✓' : 'Mark Done'}
        </button>
      </div>
    </div>
  )
}

export default function LearningRoadmap() {
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('')

  const roles = ['Backend Developer', 'Frontend Developer', 'Data Scientist', 'Full Stack Developer', 'AI/ML Engineer']

  const fetchRoadmap = (r) => {
    setLoading(true)
    matchingAPI.roadmap(r)
      .then(res => setRoadmap(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRoadmap('Backend Developer')
    setRole('Backend Developer')
  }, [])

  const completedCount = roadmap?.roadmap?.filter((_, i) => false).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Personalized Learning Roadmap</h1>
        <p className="text-gray-500 text-sm mt-1">Your step-by-step path to job readiness</p>
      </div>

      {/* Role picker */}
      <div className="card">
        <label className="label">Target Role</label>
        <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <button key={r} onClick={() => { setRole(r); fetchRoadmap(r) }}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                ${role === r ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner center /> : roadmap && (
        <>
          {/* Summary */}
          <div className="card bg-gradient-to-r from-blue-600 to-violet-700 text-white">
            <div className="flex items-center gap-4">
              <Map size={32} className="opacity-80" />
              <div>
                <h2 className="font-bold text-lg">{roadmap.target_role} Roadmap</h2>
                <p className="text-blue-200 text-sm">{roadmap.roadmap?.length} skills to learn</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-blue-200">Current</p>
                <p className="text-xl font-bold">{roadmap.current_readiness}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Potential</p>
                <p className="text-xl font-bold text-green-300">{roadmap.potential_readiness}%</p>
              </div>
            </div>
          </div>

          {/* Roadmap items */}
          <div className="space-y-3">
            {roadmap.roadmap?.map((item, i) => (
              <RoadmapItem key={i} item={item} index={i} />
            ))}
          </div>

          {roadmap.roadmap?.length === 0 && (
            <div className="card text-center py-12">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700">You're already on track!</h3>
              <p className="text-sm text-gray-500">No missing required skills for this role.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
