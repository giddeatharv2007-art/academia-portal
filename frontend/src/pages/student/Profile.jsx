import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentAPI, skillsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import SkillBar from '../../components/common/SkillBar'
import {
  User, Mail, Phone, MapPin, GraduationCap, Github, Linkedin,
  Globe, Edit, CheckCircle, Briefcase, Award, ExternalLink,
  Flag, Eye, Trophy, Lock, Star
} from 'lucide-react'

/* ─── Certificate card (read-only, shown in profile) ────────────────────── */
function CertProfileCard({ cert }) {
  const scoreColor = cert.score >= 80 ? 'text-green-600'
    : cert.score >= 60 ? 'text-yellow-600' : 'text-red-500'
  const barColor   = cert.score >= 80 ? 'bg-green-500'
    : cert.score >= 60 ? 'bg-yellow-500' : 'bg-red-400'
  const passBadge  = cert.score >= 60
    ? 'bg-green-50 border-green-200 text-green-700'
    : 'bg-red-50 border-red-200 text-red-600'

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm
                    hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                      flex items-center justify-center flex-shrink-0 shadow-sm">
        <Award size={20} className="text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm truncate">{cert.name}</span>
          {cert.verified && (
            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700
                             px-2 py-0.5 rounded-full font-semibold flex-shrink-0 border border-green-200">
              <CheckCircle size={9} /> AI Verified
            </span>
          )}
          {cert.flagged && (
            <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600
                             px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
              <Flag size={9} /> Flagged
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-0.5">
          <span className="font-medium">{cert.issuer}</span>
          {cert.topic && (
            <span className="ml-1.5 text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
              {cert.topic}
            </span>
          )}
        </p>

        {cert.uploadedAt && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            Added {new Date(cert.uploadedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
          </p>
        )}

        {/* Score row */}
        {cert.score !== null && cert.score !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all ${barColor}`}
                style={{ width: `${cert.score}%` }} />
            </div>
            <span className={`text-xs font-bold flex-shrink-0 ${scoreColor}`}>{cert.score}%</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${passBadge}`}>
              {cert.score >= 60 ? 'Passed' : 'Failed'}
            </span>
          </div>
        )}

        {/* Violations micro-text */}
        {cert.violations?.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <Eye size={9} /> {cert.violations.length} proctoring violation(s)
          </p>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PROFILE PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function StudentProfile() {
  const [profile,      setProfile]      = useState(null)
  const [skills,       setSkills]       = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([
      studentAPI.getProfile(),
      skillsAPI.getMySkills(),
      studentAPI.getCertifications().catch(() => ({ data: [] })),
    ])
      .then(([pRes, sRes, cRes]) => {
        setProfile(pRes.data)
        setSkills(sRes.data.results || sRes.data || [])

        const raw = cRes.data.results || cRes.data || []
        setCertificates(raw.map(c => ({
          id:         c.id,
          name:       c.title        || c.name   || 'Certificate',
          issuer:     c.issuing_organisation || c.issuer || 'Unknown',
          topic:      c.certificate_type     || c.topic  || 'General',
          score:      c.test_score   ?? c.score   ?? null,
          verified:   c.is_verified  ?? c.verified ?? false,
          flagged:    c.is_flagged   ?? c.flagged  ?? false,
          violations: c.violations   || [],
          uploadedAt: c.created_at   || c.uploadedAt || null,
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner center />
  if (!profile) return <div className="text-center text-gray-500 py-12">Profile not found.</div>

  const completionPct   = profile.profile_completion || 0
  const verifiedCerts   = certificates.filter(c => c.verified)
  const passedCerts     = certificates.filter(c => c.score >= 60)

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Header card ──────────────────────────────────────────── */}
      <div className="card bg-gradient-to-r from-blue-600 to-violet-700 text-white">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center
                          flex-shrink-0 overflow-hidden">
            {profile.profile_photo
              ? <img src={profile.profile_photo} alt="" className="w-full h-full object-cover" />
              : <span className="text-3xl font-bold">{profile.full_name?.[0] || 'S'}</span>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{profile.full_name || 'Student'}</h1>
              {profile.is_education_verified && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full
                                 flex items-center gap-1">
                  <CheckCircle size={10} /> College Verified
                </span>
              )}
              {verifiedCerts.length > 0 && (
                <span className="text-xs bg-blue-500/80 text-white px-2 py-0.5 rounded-full
                                 flex items-center gap-1">
                  <Award size={10} /> {verifiedCerts.length} Certificate{verifiedCerts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-blue-200 text-sm mt-0.5">{profile.career_goal || 'Student'}</p>
            <p className="text-blue-200 text-sm">{profile.college_name}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
              <span className="flex items-center gap-1">
                <GraduationCap size={13} /> {profile.degree} — {profile.branch}
              </span>
              {profile.city && (
                <span className="flex items-center gap-1"><MapPin size={13} />{profile.city}</span>
              )}
            </div>
          </div>
          <Link to="/student/profile/edit"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-sm
                       px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
            <Edit size={14} /> Edit
          </Link>
        </div>

        {/* Profile completion */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-blue-200">Profile Completion</span>
            <span className="font-semibold">{completionPct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      </div>

      {/* ── Personal info ─────────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={16} /> Personal Information
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { icon: Mail,          label: 'Email',           value: profile.email },
            { icon: Phone,         label: 'Mobile',          value: profile.mobile },
            { icon: MapPin,        label: 'Location',        value: [profile.city, profile.state, profile.pin_code].filter(Boolean).join(', ') },
            { icon: User,          label: 'Status',          value: profile.current_status },
            { icon: GraduationCap, label: 'CGPA',            value: profile.cgpa ? `${profile.cgpa} / 10` : null },
            { icon: GraduationCap, label: 'Graduation Year', value: profile.graduation_year },
          ].map(({ icon: Icon, label, value }) => value ? (
            <div key={label} className="flex items-start gap-2 text-gray-600">
              <Icon size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
              <span className="text-gray-400 min-w-[80px]">{label}:</span>
              <span className="text-gray-700">{value}</span>
            </div>
          ) : null)}
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3 mt-4">
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
              <Github size={15} /> GitHub <ExternalLink size={11} />
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
              <Linkedin size={15} /> LinkedIn <ExternalLink size={11} />
            </a>
          )}
          {profile.portfolio_url && (
            <a href={profile.portfolio_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
              <Globe size={15} /> Portfolio <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* ── Skills ────────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Award size={16} /> Skills ({skills.length})
            </h2>
            <Link to="/student/skill-passport" className="text-sm text-blue-600 hover:text-blue-700">
              View Passport →
            </Link>
          </div>
          <div className="space-y-3">
            {skills.slice(0, 8).map(s => (
              <SkillBar key={s.id} name={s.skill_name} proficiency={s.proficiency}
                isVerified={s.is_verified} evidenceTypes={s.evidence_types} />
            ))}
          </div>
          {skills.length > 8 && (
            <p className="text-sm text-gray-400 text-center mt-3">
              +{skills.length - 8} more skills in Skill Passport
            </p>
          )}
        </div>
      )}

      {/* ── Certificates ──────────────────────────────────────────── */}
      {certificates.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Award size={16} /> Certificates ({certificates.length})
              </h2>
              {passedCerts.length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {passedCerts.length} passed · {verifiedCerts.length} AI-verified
                </p>
              )}
            </div>
            <Link to="/student/profile/edit"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Edit size={13} /> Manage
            </Link>
          </div>

          {/* Summary stats */}
          {certificates.length >= 2 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-blue-50 rounded-xl p-3">
                <p className="text-xl font-extrabold text-blue-600">{certificates.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center bg-green-50 rounded-xl p-3">
                <p className="text-xl font-extrabold text-green-600">{passedCerts.length}</p>
                <p className="text-xs text-gray-500">Passed</p>
              </div>
              <div className="text-center bg-indigo-50 rounded-xl p-3">
                <p className="text-xl font-extrabold text-indigo-600">
                  {certificates.length > 0
                    ? Math.round(certificates.reduce((sum, c) => sum + (c.score || 0), 0) / certificates.length)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {certificates.map(cert => (
              <CertProfileCard key={cert.id} cert={cert} />
            ))}
          </div>

          {certificates.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <Award size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No certificates yet.</p>
              <Link to="/student/profile/edit"
                className="text-xs text-blue-500 hover:text-blue-700 mt-1 inline-block">
                Add your first certificate →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── No certs CTA (when none yet) ─────────────────────────── */}
      {certificates.length === 0 && (
        <div className="card border-dashed border-2 border-gray-200 text-center py-6">
          <Award size={28} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">No certificates added yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-3">
            Upload a certificate, get it AI-verified and take a proctored test
          </p>
          <Link to="/student/profile/edit"
            className="inline-flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700
                       text-white font-semibold px-4 py-2 rounded-xl transition-colors">
            <Award size={14} /> Add Certificate
          </Link>
        </div>
      )}

      {/* ── Career preferences ────────────────────────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Briefcase size={16} /> Career Preferences
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
          {profile.career_goal && (
            <div>
              <span className="text-gray-400">Target Role:</span>{' '}
              <span className="font-medium text-gray-800">{profile.career_goal}</span>
            </div>
          )}
          {profile.preferred_work_mode && (
            <div>
              <span className="text-gray-400">Work Mode:</span>{' '}
              <span className="capitalize">{profile.preferred_work_mode}</span>
            </div>
          )}
          {profile.expected_stipend_min && (
            <div>
              <span className="text-gray-400">Min Stipend:</span>{' '}
              ₹{profile.expected_stipend_min?.toLocaleString()}/month
            </div>
          )}
          {profile.preferred_cities?.length > 0 && (
            <div>
              <span className="text-gray-400">Preferred Cities:</span>{' '}
              {profile.preferred_cities.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
