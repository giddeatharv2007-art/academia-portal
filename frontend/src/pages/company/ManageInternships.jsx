import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { internshipsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'
import { GraduationCap, PlusCircle, Users, Trash2 } from 'lucide-react'

export default function ManageInternships() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    internshipsAPI.listInternships().then(res => setItems(res.data.results || res.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this internship?')) return
    try {
      await internshipsAPI.deleteInternship(id)
      setItems(items.filter(i => i.id !== id))
      toast.success('Internship deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Internships</h1>
        <Link to="/company/post-internship" className="btn-primary flex items-center gap-2"><PlusCircle size={16} /> Post Internship</Link>
      </div>

      {loading ? <LoadingSpinner center /> : items.length === 0 ?
        <EmptyState icon={GraduationCap} title="No internships posted" action={<Link to="/company/post-internship" className="btn-primary">Post your first internship</Link>} /> : (
        <div className="space-y-3">
          {items.map(i => (
            <div key={i.id} className="card flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{i.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${i.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {i.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>{i.duration_months} months</span>
                  <span>{i.location}</span>
                  <span className="capitalize">{i.work_mode}</span>
                  {i.deadline && <span>Deadline: {i.deadline}</span>}
                </div>
                {i.stipend_min && <p className="text-xs text-green-600 font-medium mt-1">₹{i.stipend_min?.toLocaleString()} - ₹{i.stipend_max?.toLocaleString()}/month</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/company/applications?internship=${i.id}`} className="btn-secondary text-xs flex items-center gap-1 py-1.5 px-3">
                  <Users size={12} /> Applications
                </Link>
                <button onClick={() => handleDelete(i.id)} className="text-red-400 hover:text-red-600 p-1.5">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
