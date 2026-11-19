import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { companiesAPI } from '../../services/api'
import { MapPin, Globe, Calendar, CheckCircle, Briefcase, GraduationCap, Zap, ExternalLink } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function CompanyPublicPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    companiesAPI.getPublicProfile(id)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500">Company not found.</div>

  const { company, recent_jobs, recent_internships, active_challenges } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-lg">
            {company.logo ? <img src={company.logo} alt="" className="w-full h-full object-contain rounded-2xl" />
              : <span className="text-2xl font-bold text-blue-600">{company.name?.[0]}</span>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{company.name}</h1>
              {company.is_verified && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle size={10} />Verified</span>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300 mt-2">
              {company.location && <span className="flex items-center gap-1"><MapPin size={13} />{company.location}</span>}
              {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white"><Globe size={13} />{company.website}</a>}
              {company.established_year && <span className="flex items-center gap-1"><Calendar size={13} />Est. {company.established_year}</span>}
              <span className="bg-blue-600/30 px-2 py-0.5 rounded capitalize">{company.domain}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* About */}
        {company.about && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">About {company.name}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{company.about}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link to={`/student/internships?company=${id}`} className="flex-1">
            <button className="w-full btn-primary flex items-center justify-center gap-2 py-3">
              <GraduationCap size={18} /> View Internships ({company.active_internships_count})
            </button>
          </Link>
          <Link to={`/student/jobs?company=${id}`} className="flex-1">
            <button className="w-full btn-secondary flex items-center justify-center gap-2 py-3">
              <Briefcase size={18} /> View Jobs ({company.active_jobs_count})
            </button>
          </Link>
        </div>

        {/* Required Skills */}
        {company.required_skills_detail?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {company.required_skills_detail.map(s => (
                <span key={s.skill_name} className={`skill-tag ${s.priority === 'required' ? '' : 'opacity-70'}`}>
                  {s.skill_name}
                  {s.priority === 'required' && <span className="text-red-500">*</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        {recent_jobs?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Briefcase size={16} /> Recent Jobs</h2>
            <div className="space-y-3">
              {recent_jobs.map(job => (
                <Link key={job.id} to={`/student/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.work_mode} • {job.location}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active Challenges */}
        {active_challenges?.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Industry Challenges</h2>
            <div className="space-y-3">
              {active_challenges.map(c => (
                <Link key={c.id} to={`/student/challenges/${c.id}`}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{c.title}</p>
                    <p className="text-xs text-gray-500">Deadline: {c.deadline}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
