import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { matchingAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import MatchScore from '../../components/common/MatchScore'
import { GraduationCap, MapPin, Building2, Search } from 'lucide-react'

export default function InternshipsList() {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    matchingAPI.matchInternships()
      .then(res => setInternships(res.data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = internships.filter(i =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Internship Matches</h1>
        <p className="text-sm text-gray-500">Sorted by your match score</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input className="input pl-9" placeholder="Search internships..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <LoadingSpinner center /> : filtered.length === 0 ?
        <EmptyState icon={GraduationCap} title="No internships found" description="Add more skills to see better matches." /> : (
        <div className="space-y-4">
          {filtered.map(i => (
            <Link key={i.internship_id} to={`/student/internships/${i.internship_id}`} className="block">
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{i.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Building2 size={13} />{i.company_name}</span>
                      {i.location && <span className="flex items-center gap-1"><MapPin size={13} />{i.location}</span>}
                      <span>{i.duration_months} months</span>
                      <span className="capitalize">{i.work_mode}</span>
                    </div>
                    {i.stipend_min && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        ₹{i.stipend_min?.toLocaleString()} - ₹{i.stipend_max?.toLocaleString()} / month
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {i.required_skills?.slice(0, 4).map(s => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <MatchScore score={i.match_score} compact />
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
