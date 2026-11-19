import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { matchingAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Search, Users, Star, CheckCircle, GraduationCap, Trophy } from 'lucide-react'

export default function CandidateSearch() {
  const [requiredSkills, setRequiredSkills] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await matchingAPI.findStudents({ required_skills: requiredSkills })
      setResults(res.data)
    } catch { }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Candidates</h1>
        <p className="text-sm text-gray-500 mt-1">Reverse Mapping: Enter required skills to find matching students</p>
      </div>

      <form onSubmit={handleSearch} className="card space-y-4">
        <div>
          <label className="label">Required Skills (comma-separated)</label>
          <input className="input" placeholder="e.g. Python, Django, SQL, REST API"
            value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} required />
          <p className="text-xs text-gray-400 mt-1">Enter the skills you need and we'll rank students by match score</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Search size={16} />}
          {loading ? 'Searching...' : 'Find Matching Candidates'}
        </button>
      </form>

      {loading && <LoadingSpinner center />}

      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold">{results.total_candidates}</span> candidates for skills:{' '}
              <span className="font-medium text-blue-600">{results.required_skills?.join(', ')}</span>
            </p>
          </div>

          {results.candidates?.map((c, i) => (
            <div key={c.student_id} className="card border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm
                  ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                  #{c.rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{c.student_name}</h3>
                        {c.is_education_verified && <span className="badge-verified"><CheckCircle size={10} /> Verified</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><GraduationCap size={11} />{c.college}</span>
                        <span>{c.degree} — {c.branch}</span>
                        {c.cgpa && <span>CGPA: {c.cgpa}</span>}
                      </div>
                    </div>

                    {/* Match score */}
                    <div className={`text-2xl font-extrabold flex-shrink-0
                      ${c.skill_match_score >= 80 ? 'text-green-600' : c.skill_match_score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {c.skill_match_score?.toFixed(0)}%
                      <span className="text-xs font-normal text-gray-400 block text-center">match</span>
                    </div>
                  </div>

                  {/* Composite score breakdown */}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {c.assessment_score > 0 && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Assessment: {c.assessment_score?.toFixed(0)}%</span>}
                    {c.has_relevant_project && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">Has Projects</span>}
                    {c.internship_experience_count > 0 && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{c.internship_experience_count} Internship(s)</span>}
                    {c.verified_certification_count > 0 && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded">{c.verified_certification_count} Cert(s)</span>}
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Score: {c.composite_score}/100</span>
                  </div>

                  {/* Rank explanation */}
                  {c.rank_explanation && (
                    <p className="text-xs text-gray-400 mt-1.5 italic">{c.rank_explanation}</p>
                  )}

                  {/* Matched / Missing skills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.matched_skills?.slice(0, 4).map(s => (
                      <span key={s.name} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle size={9} />{s.name}
                      </span>
                    ))}
                    {c.missing_skills?.slice(0, 2).map(s => (
                      <span key={s.name} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">✗ {s.name}</span>
                    ))}
                  </div>
                </div>

                <Link to={`/students/${c.student_id}`}
                  className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0">
                  View Profile
                </Link>
              </div>
            </div>
          ))}

          {results.candidates?.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              <Users size={40} className="mx-auto mb-2 text-gray-300" />
              <p>No students found with these skills yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
