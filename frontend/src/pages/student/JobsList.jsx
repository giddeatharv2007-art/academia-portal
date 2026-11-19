import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { matchingAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import MatchScore from '../../components/common/MatchScore'
import { Briefcase, MapPin, Building2, Clock, Search, Filter } from 'lucide-react'

export default function JobsList() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    matchingAPI.matchJobs()
      .then(res => setJobs(res.data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Matches</h1>
          <p className="text-sm text-gray-500">Sorted by your match score</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input className="input pl-9" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <LoadingSpinner center /> : filtered.length === 0 ?
        <EmptyState icon={Briefcase} title="No jobs found" description="Add more skills to improve your job matches." /> : (
        <div className="space-y-4">
          {filtered.map(job => (
            <Link key={job.job_id} to={`/student/jobs/${job.job_id}`} className="block">
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Building2 size={13} />{job.company_name}</span>
                      {job.location && <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>}
                      <span className="capitalize">{job.work_mode}</span>
                    </div>
                    {job.salary_min && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()} / year
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.required_skills?.slice(0, 4).map(s => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <MatchScore score={job.match_score} compact />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
