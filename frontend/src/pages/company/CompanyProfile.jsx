import React, { useEffect, useState } from 'react'
import { companiesAPI, skillsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Save, Building2, CheckCircle } from 'lucide-react'

const DOMAINS = ['it','healthcare','iot','finance','edtech','ai','manufacturing','cybersecurity','ecommerce','consulting','media','other']

export default function CompanyProfile() {
  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    companiesAPI.getProfile()
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const f = (field) => profile[field] || ''
  const set = (field, val) => setProfile({ ...profile, [field]: val })

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(profile).forEach(([k, v]) => {
        if (v !== null && v !== undefined && typeof v !== 'object') fd.append(k, v)
      })
      await companiesAPI.updateProfile(fd)
      toast.success('Company profile saved!')
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner center />

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <div className="flex items-center gap-3">
          {profile.is_verified && (
            <span className="badge-verified"><CheckCircle size={12} /> Verified</span>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Company Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Company Name *</label>
            <input className="input" value={f('name')} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">About Company</label>
            <textarea className="input resize-none" rows={3} value={f('about')} onChange={e => set('about', e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={f('location')} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Website URL</label>
            <input type="url" className="input" value={f('website')} placeholder="https://" onChange={e => set('website', e.target.value)} />
          </div>
          <div>
            <label className="label">Established Year</label>
            <input type="number" className="input" value={f('established_year')} onChange={e => set('established_year', e.target.value)} />
          </div>
          <div>
            <label className="label">Domain</label>
            <select className="input" value={f('domain')} onChange={e => set('domain', e.target.value)}>
              {DOMAINS.map(d => <option key={d} value={d} className="capitalize">{d.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Target Hiring</label>
            <select className="input" value={f('target_hiring')} onChange={e => set('target_hiring', e.target.value)}>
              <option value="internship">Internship Only</option>
              <option value="job">Job Only</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="label">Registration Number / GSTIN</label>
            <input className="input" value={f('gstin')} onChange={e => set('gstin', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Authorized Contact Person</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={f('contact_person_name')} onChange={e => set('contact_person_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Designation</label>
            <input className="input" value={f('contact_person_designation')} onChange={e => set('contact_person_designation', e.target.value)} />
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input type="email" className="input" value={f('contact_person_email')} onChange={e => set('contact_person_email', e.target.value)} />
          </div>
          <div>
            <label className="label">Contact Phone</label>
            <input type="tel" className="input" value={f('contact_person_phone')} onChange={e => set('contact_person_phone', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
