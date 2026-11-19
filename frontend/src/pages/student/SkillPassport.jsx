import React, { useEffect, useState } from 'react'
import { skillsAPI } from '../../services/api'
import SkillBar from '../../components/common/SkillBar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Award, CheckCircle, Clock, Shield, Star, Trophy } from 'lucide-react'

export default function SkillPassport() {
  const [passport, setPassport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    skillsAPI.getPassport()
      .then(res => setPassport(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner center />
  if (!passport) return <div className="text-center text-gray-500 py-12">No skill passport found.</div>

  const byCategory = passport.skills.reduce((acc, s) => {
    const cat = s.skill_category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  const categoryLabels = {
    language: '💻 Programming Languages',
    framework: '🔧 Frameworks & Libraries',
    database: '🗄️ Databases',
    cloud: '☁️ Cloud',
    ai_ml: '🤖 AI / ML',
    tool: '🛠️ Tools',
    soft: '🤝 Soft Skills',
    technical: '⚙️ Technical',
    other: '📦 Other',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-blue-600 to-violet-700 text-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Shield size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{passport.student_name}</h1>
              {passport.is_education_verified && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={10} /> College Verified
                </span>
              )}
            </div>
            <p className="text-blue-200 text-sm">{passport.college}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{passport.total_skills_count}</p>
                <p className="text-xs text-blue-200">Total Skills</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-300">{passport.verified_skills_count}</p>
                <p className="text-xs text-blue-200">Verified</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-300">{passport.passport_score?.toFixed(0)}%</p>
                <p className="text-xs text-blue-200">Passport Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{passport.badges?.length || 0}</p>
                <p className="text-xs text-blue-200">Badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence types legend */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Skill Evidence Types</p>
        <div className="flex flex-wrap gap-2">
          {['self', 'assessment', 'project', 'certification', 'internship', 'college'].map(e => (
            <span key={e} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">{e}</span>
          ))}
        </div>
      </div>

      {/* Skills by category */}
      {Object.entries(byCategory).map(([cat, skills]) => (
        <div key={cat} className="card">
          <h2 className="font-semibold text-gray-900 mb-4">{categoryLabels[cat] || cat}</h2>
          <div className="space-y-4">
            {skills.sort((a, b) => b.proficiency - a.proficiency).map(skill => (
              <SkillBar
                key={skill.id}
                name={skill.skill_name}
                proficiency={skill.proficiency}
                isVerified={skill.is_verified}
                evidenceTypes={skill.evidence_types || []}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Badges */}
      {passport.badges?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> Earned Badges</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {passport.badges.map(badge => (
              <div key={badge.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <span className="text-2xl">{badge.badge_icon}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{badge.badge_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{badge.badge_category}</p>
                </div>
                <CheckCircle size={14} className="text-green-500 ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {passport.skills.length === 0 && (
        <div className="card text-center py-12">
          <Award size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700">Your Skill Passport is empty</h3>
          <p className="text-sm text-gray-500 mt-1">Add skills from your profile to build your passport.</p>
        </div>
      )}
    </div>
  )
}
