import React from 'react'
import { CheckCircle, Clock } from 'lucide-react'

export default function SkillBar({ name, proficiency, isVerified, evidenceTypes = [], showDetails = true }) {
  const color = proficiency >= 80 ? 'bg-green-500' : proficiency >= 60 ? 'bg-blue-500' : proficiency >= 40 ? 'bg-yellow-500' : 'bg-red-400'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{name}</span>
          {isVerified ? (
            <span className="badge-verified"><CheckCircle size={10} /> Verified</span>
          ) : (
            showDetails && <span className="badge-pending"><Clock size={10} /> Unverified</span>
          )}
        </div>
        <span className="text-sm font-semibold text-gray-600">{proficiency}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full progress-bar`} style={{ width: `${proficiency}%` }} />
      </div>
      {showDetails && evidenceTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {evidenceTypes.map(e => (
            <span key={e} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">{e}</span>
          ))}
        </div>
      )}
    </div>
  )
}
