import React from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

export default function MatchScore({ score, explanation, matchedSkills = [], missingSkills = [], compact = false }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
  const bg = score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
  const ring = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-sm font-bold ${color}`}>
        <span>{score}%</span>
        <span className="text-xs font-normal text-gray-500">match</span>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-center gap-4 mb-3">
        {/* Circular score */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="5"
              strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - score / 100)}`}
              className={ring} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-base font-bold ${ring}`}>{score}%</span>
          </div>
        </div>
        <div>
          <p className={`text-xl font-bold ${color}`}>{score}% Match</p>
          {explanation && (
            <p className="text-xs text-gray-600 mt-1 flex items-start gap-1">
              <Info size={12} className="mt-0.5 flex-shrink-0" />{explanation}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {matchedSkills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-700 mb-1.5">✓ Matched Skills</p>
            <div className="space-y-1">
              {matchedSkills.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-green-700">
                  <CheckCircle size={12} className="flex-shrink-0" />
                  <span>{s.name}</span>
                  {s.proficiency && <span className="text-gray-400">({s.proficiency}%)</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {missingSkills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-700 mb-1.5">✗ Missing Skills</p>
            <div className="space-y-1">
              {missingSkills.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-red-600">
                  <XCircle size={12} className="flex-shrink-0" />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
