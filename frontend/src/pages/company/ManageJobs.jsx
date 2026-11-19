import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'
import { Briefcase, PlusCircle, Users, Eye, Trash2 } from 'lucide-react'

export default function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobsAPI.listJobs().then(res => setJobs(res.data.results || res.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return
    try {
      await jobsAPI.deleteJob(id)
      setJobs(jobs.filter(j => j.id !== id))
      toast.success('Job deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
        <Link to="/company/post-job" className="btn-primary flex items-center gap-2"><PlusCircle size={16} /> Post Job</Link>
      </div>

      {loading ? <LoadingSpinner center /> : jobs.length === 0 ?
        <EmptyState icon={Briefcase} title="No jobs posted" action={<Link to="/company/post-job" className="btn-primary">Post your first job</Link>} /> : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="card flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {job.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="capitalize">{job.job_type?.replace('_',' ')}</span>
                  <span>{job.location}</span>
                  <span className="capitalize">{job.work_mode}</span>
                  {job.deadline && <span>Deadline: {job.deadline}</span>}
                  <span>{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                </div>
                {job.salary_min && <p className="text-xs text-green-600 font-medium mt-1">₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}/year</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/company/applications?job=${job.id}`} className="btn-secondary text-xs flex items-center gap-1 py-1.5 px-3">
                  <Users size={12} /> Applications
                </Link>
                <button onClick={() => handleDelete(job.id)} className="text-red-400 hover:text-red-600 p-1.5">
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
