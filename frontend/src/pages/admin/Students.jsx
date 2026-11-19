import React, { useEffect, useState, useCallback } from 'react'
import { studentAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import {
  Users, Search, CheckCircle, GraduationCap,
  MapPin, Mail, BookOpen, Star
} from 'lucide-react'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [total, setTotal] = useState(0)

  // Debounce search input by 400 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    studentAPI.adminListStudents(debouncedSearch)
      .then(res => {
        setStudents(res.data.students || [])
        setTotal(res.data.count || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [debouncedSearch])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} student{total !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          className="input pl-9 w-full"
          placeholder="Search by name, email, college, branch, city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner center />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title={debouncedSearch ? 'No students match your search' : 'No students yet'}
          description={debouncedSearch ? 'Try a different name, email, or college.' : 'Students will appear here once they register.'}
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Student', 'College / Branch', 'Location', 'Profile', 'Verified', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">

                  {/* Student */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {s.profile_photo
                        ? <img src={s.profile_photo} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        : (
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 text-violet-600 font-semibold text-xs">
                            {(s.full_name || s.email || '?')[0].toUpperCase()}
                          </div>
                        )
                      }
                      <div>
                        <p className="font-medium text-gray-900 leading-tight">
                          {s.full_name || <span className="text-gray-400 italic">No name</span>}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {s.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* College / Branch */}
                  <td className="px-4 py-3">
                    <p className="text-gray-700 leading-tight">{s.college_name || <span className="text-gray-300">—</span>}</p>
                    {(s.branch || s.degree) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <BookOpen size={10} />
                        {[s.degree, s.branch].filter(Boolean).join(' · ')}
                        {s.graduation_year && <span>· {s.graduation_year}</span>}
                      </p>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400" />
                      {[s.city, s.state].filter(Boolean).join(', ') || '—'}
                    </span>
                  </td>

                  {/* Profile completion */}
                  <td className="px-4 py-3 min-w-[110px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            s.profile_completion >= 70 ? 'bg-green-500' :
                            s.profile_completion >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${s.profile_completion || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round(s.profile_completion || 0)}%</span>
                    </div>
                    {s.skill_count > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Star size={9} /> {s.skill_count} skill{s.skill_count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </td>

                  {/* Education verified */}
                  <td className="px-4 py-3">
                    {s.is_education_verified
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><CheckCircle size={11} /> Verified</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">Unverified</span>
                    }
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
