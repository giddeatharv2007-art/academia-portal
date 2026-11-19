import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { challengesAPI, skillsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { X, Send } from 'lucide-react'

export default function CreateChallenge() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', problem_statement: '', deadline: '',
    team_size_min: 1, team_size_max: 3, submission_requirements: 'GitHub repository, README, demo video',
    possible_outcome: '', prize_description: '',
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
      await challengesAPI.create({ ...form, required_skill_ids: selectedSkills.map(s => s.id) })
      toast.success('Challenge created!')
      navigate('/company/challenges')
    } catch { toast.error('Failed to create challenge') }
    finally { setLoading(false) }
  }

  const f = (field) => form[field]
  const set = (field, val) => setForm({ ...form, [field]: val })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Industry Challenge</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Challenge Details</h2>
          <div>
            <label className="label">Challenge Title *</label>
            <input className="input" placeholder="e.g. Build an AI-Powered Attendance System"
              value={f('title')} onChange={e => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={3} value={f('description')} onChange={e => set('description', e.target.value)} required />
          </div>
          <div>
            <label className="label">Problem Statement *</label>
            <textarea className="input resize-none" rows={4} placeholder="Detailed problem statement..."
              value={f('problem_statement')} onChange={e => set('problem_statement', e.target.value)} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Deadline *</label>
              <input type="date" className="input" value={f('deadline')} onChange={e => set('deadline', e.target.value)} required />
            </div>
            <div>
              <label className="label">Team Size (min - max)</label>
              <div className="flex gap-2">
                <input type="number" className="input" min={1} max={10} value={f('team_size_min')} onChange={e => set('team_size_min', e.target.value)} />
                <span className="self-center text-gray-400">to</span>
                <input type="number" className="input" min={1} max={10} value={f('team_size_max')} onChange={e => set('team_size_max', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Possible Outcome</label>
              <input className="input" placeholder="e.g. Internship offer for top team"
                value={f('possible_outcome')} onChange={e => set('possible_outcome', e.target.value)} />
            </div>
            <div>
              <label className="label">Prize Description</label>
              <input className="input" placeholder="e.g. Certificate + internship"
                value={f('prize_description')} onChange={e => set('prize_description', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Submission Requirements</label>
            <textarea className="input resize-none" rows={2} value={f('submission_requirements')} onChange={e => set('submission_requirements', e.target.value)} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Required Skills</h2>
          <div className="relative">
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
                <button type="button" onClick={() => setSelectedSkills(selectedSkills.filter(ss => ss.id !== s.id))}><X size={13} /></button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send size={16} />}
          {loading ? 'Creating...' : 'Create Challenge'}
        </button>
      </form>
    </div>
  )
}
