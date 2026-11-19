import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { internshipsAPI, skillsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { X, Send } from 'lucide-react'

export default function PostInternship() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', duration_months: 3, location: '', work_mode: 'hybrid',
    stipend_min: '', stipend_max: '', qualification: '', deadline: '', openings: 3,
  })
  const [allSkills, setAllSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillSearch, setSkillSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    skillsAPI.listSkills().then(res => setAllSkills(res.data.results || res.data || []))
  }, [])

  const filteredSkills = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.find(ss => ss.id === s.id)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await internshipsAPI.createInternship({
        ...form,
        required_skill_ids: selectedSkills.map(s => s.id),
      })
      toast.success('Internship posted!')
      navigate('/company/internships')
    } catch (err) {
      toast.error('Failed to post internship')
    } finally {
      setLoading(false)
    }
  }

  const f = (field) => form[field]
  const set = (field, val) => setForm({ ...form, [field]: val })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post an Internship</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Internship Details</h2>
          <div>
            <label className="label">Internship Title *</label>
            <input className="input" placeholder="e.g. Python Developer Internship" value={f('title')} onChange={e => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={4} placeholder="Describe the internship role and responsibilities..."
              value={f('description')} onChange={e => set('description', e.target.value)} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Duration (months)</label>
              <input type="number" className="input" min={1} max={24} value={f('duration_months')} onChange={e => set('duration_months', e.target.value)} />
            </div>
            <div>
              <label className="label">Work Mode</label>
              <select className="input" value={f('work_mode')} onChange={e => set('work_mode', e.target.value)}>
                {['remote','hybrid','onsite'].map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={f('location')} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Qualification</label>
              <input className="input" placeholder="e.g. 2nd/3rd year CS" value={f('qualification')} onChange={e => set('qualification', e.target.value)} />
            </div>
            <div>
              <label className="label">Min Stipend (₹/month)</label>
              <input type="number" className="input" value={f('stipend_min')} onChange={e => set('stipend_min', e.target.value)} />
            </div>
            <div>
              <label className="label">Max Stipend (₹/month)</label>
              <input type="number" className="input" value={f('stipend_max')} onChange={e => set('stipend_max', e.target.value)} />
            </div>
            <div>
              <label className="label">Number of Openings</label>
              <input type="number" className="input" min={1} value={f('openings')} onChange={e => set('openings', e.target.value)} />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={f('deadline')} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Required Skills</h2>
          <div className="relative">
            <input className="input" placeholder="Search skills..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} />
            {skillSearch && filteredSkills.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filteredSkills.slice(0, 10).map(s => (
                  <button key={s.id} type="button"
                    onClick={() => { setSelectedSkills([...selectedSkills, s]); setSkillSearch('') }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50">
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(s => (
              <span key={s.id} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                {s.name}
                <button type="button" onClick={() => setSelectedSkills(selectedSkills.filter(ss => ss.id !== s.id))}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send size={16} />}
          {loading ? 'Posting...' : 'Post Internship'}
        </button>
      </form>
    </div>
  )
}
