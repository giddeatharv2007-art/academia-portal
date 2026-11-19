import React, { useEffect, useState } from 'react'
import { collegeAPI, skillsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'
import { GraduationCap, PlusCircle, Users, X } from 'lucide-react'

export default function AdminTraining() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [allSkills, setAllSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillSearch, setSkillSearch] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', target_year: '', reason: '',
    start_date: '', end_date: '', max_participants: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([collegeAPI.listTraining(), skillsAPI.listSkills()])
      .then(([pRes, sRes]) => {
        setPrograms(pRes.data.results || pRes.data || [])
        setAllSkills(sRes.data.results || sRes.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredSkills = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.find(ss => ss.id === s.id)
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await collegeAPI.createTraining({ ...form, target_skill_ids: selectedSkills.map(s => s.id) })
      setPrograms([res.data, ...programs])
      setShowForm(false)
      toast.success('Training program created!')
    } catch { toast.error('Failed to create training program') }
    finally { setSaving(false) }
  }

  const f = (field) => form[field]
  const set = (field, val) => setForm({ ...form, [field]: val })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Programs</h1>
          <p className="text-sm text-gray-500">Create targeted training based on industry skill gaps</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> Create Program
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">New Training Program</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Program Title *</label>
                <input className="input" placeholder="e.g. AWS Fundamentals Training" value={f('title')} onChange={e => set('title', e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description *</label>
                <textarea className="input resize-none" rows={3} value={f('description')} onChange={e => set('description', e.target.value)} required />
              </div>
              <div>
                <label className="label">Target Students (e.g. 2nd/3rd year CSE)</label>
                <input className="input" value={f('target_year')} onChange={e => set('target_year', e.target.value)} />
              </div>
              <div>
                <label className="label">Max Participants</label>
                <input type="number" className="input" value={f('max_participants')} onChange={e => set('max_participants', e.target.value)} />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input" value={f('start_date')} onChange={e => set('start_date', e.target.value)} />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" className="input" value={f('end_date')} onChange={e => set('end_date', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Reason (based on skill gap analysis)</label>
                <input className="input" placeholder="e.g. High AWS demand (52%) vs low availability (15%)" value={f('reason')} onChange={e => set('reason', e.target.value)} />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="label">Target Skills</label>
              <div className="relative mb-2">
                <input className="input" placeholder="Search skills..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} />
                {skillSearch && filteredSkills.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {filteredSkills.slice(0, 8).map(s => (
                      <button key={s.id} type="button"
                        onClick={() => { setSelectedSkills([...selectedSkills, s]); setSkillSearch('') }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50">{s.name}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(s => (
                  <span key={s.id} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                    {s.name}
                    <button type="button" onClick={() => setSelectedSkills(selectedSkills.filter(ss => ss.id !== s.id))}><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <PlusCircle size={15} />}
                {saving ? 'Creating...' : 'Create Program'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <LoadingSpinner center /> : programs.length === 0 ?
        <EmptyState icon={GraduationCap} title="No training programs" description="Create training programs based on industry skill gap analysis." /> : (
        <div className="space-y-3">
          {programs.map(p => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize
                      ${p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{p.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                    {p.target_year && <span>Target: {p.target_year}</span>}
                    {p.start_date && <span>{p.start_date} → {p.end_date}</span>}
                    <span className="flex items-center gap-1"><Users size={10} />{p.enrolled_count} enrolled</span>
                  </div>
                  {p.target_skills_detail?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.target_skills_detail.map(s => (
                        <span key={s.id} className="skill-tag">{s.name}</span>
                      ))}
                    </div>
                  )}
                  {p.reason && <p className="text-xs text-blue-600 mt-1">Reason: {p.reason}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
