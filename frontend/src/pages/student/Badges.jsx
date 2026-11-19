import React, { useEffect, useState } from 'react'
import { skillsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Trophy, Lock, CheckCircle } from 'lucide-react'

export default function BadgesPage() {
  const [data, setData] = useState({ earned: [], available: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    skillsAPI.getMyBadges()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner center />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Badges & Achievements</h1>
        <p className="text-sm text-gray-500 mt-1">
          {data.earned.length} earned · {data.available.length} available
        </p>
      </div>

      {/* Earned badges */}
      {data.earned.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Earned Badges ({data.earned.length})
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.earned.map(sb => (
              <div key={sb.id}
                className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                <span className="text-3xl flex-shrink-0">{sb.badge_icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{sb.badge_name}</p>
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{sb.badge_category}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sb.badge_description}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Earned {new Date(sb.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available badges */}
      {data.available.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock size={18} className="text-gray-400" /> Available Badges ({data.available.length})
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.available.map(badge => (
              <div key={badge.id}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-75">
                <span className="text-3xl flex-shrink-0 grayscale">{badge.icon}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-700 text-sm truncate">{badge.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{badge.category}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">How to earn:</p>
                    <p className="text-xs text-gray-400">{badge.description}</p>
                    {badge.requirements?.slice(0, 2).map((req, i) => (
                      <div key={i} className="flex items-start gap-1 mt-0.5 text-xs text-gray-400">
                        <span className="text-gray-300 flex-shrink-0">◦</span>{req}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-500 font-medium mt-2">+{badge.points} points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.earned.length === 0 && data.available.length === 0 && (
        <div className="card text-center py-12">
          <Trophy size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No badges yet. Complete your profile and assessments to earn badges!</p>
        </div>
      )}
    </div>
  )
}
