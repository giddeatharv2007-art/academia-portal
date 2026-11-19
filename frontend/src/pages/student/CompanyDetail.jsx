import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { companiesAPI, jobsAPI, internshipsAPI } from '../../services/api'
import {
  ArrowLeft, MapPin, Globe, Building2, Briefcase, GraduationCap,
  Calendar, DollarSign, Users, CheckCircle, ExternalLink, Star,
  Clock, ChevronRight, Award, Info
} from 'lucide-react'
import toast from 'react-hot-toast'

const DOMAIN_LABELS = {
  it: 'IT', ai: 'AI/ML', finance: 'Finance', edtech: 'EdTech',
  healthcare: 'Healthcare', iot: 'IoT', cybersecurity: 'Cybersecurity',
  ecommerce: 'E-Commerce', cloud: 'Cloud', manufacturing: 'Manufacturing',
  consulting: 'Consulting', media: 'Media', other: 'Other',
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="card animate-fade-in-up">
      <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
        <Icon size={16} className="text-indigo-500 flex-shrink-0" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function OpportunityCard({ item, type }) {
  const isJob = type === 'job'
  const to    = `/student/${isJob ? 'jobs' : 'internships'}/${item.id}`

  return (
    <Link to={to} className="block p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">{item.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin size={10} /> {item.location || 'India'} · {item.work_mode}
          </p>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 mt-0.5 flex-shrink-0 transition-colors" />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {isJob
          ? item.salary_min && (
              <span className="badge-info text-[10px]">
                ₹{(item.salary_min / 100000).toFixed(1)}L – ₹{(item.salary_max / 100000).toFixed(1)}L / yr
              </span>
            )
          : item.stipend_min && (
              <span className="badge-info text-[10px]">
                ₹{item.stipend_min?.toLocaleString()} – ₹{item.stipend_max?.toLocaleString()} / mo
              </span>
            )
        }
        {item.openings && (
          <span className="badge-neutral text-[10px]">{item.openings} opening{item.openings > 1 ? 's' : ''}</span>
        )}
        {item.deadline && (
          <span className="badge-pending text-[10px] flex items-center gap-1">
            <Clock size={9} /> {new Date(item.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {isJob && item.job_type && (
          <span className="badge-neutral text-[10px] capitalize">{item.job_type.replace('_', ' ')}</span>
        )}
        {!isJob && item.duration_months && (
          <span className="badge-neutral text-[10px]">{item.duration_months} months</span>
        )}
      </div>
      {item.required_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.required_skills.slice(0, 4).map(s => (
            <span key={s.id || s.name} className="skill-tag">{s.name}</span>
          ))}
        </div>
      )}
      <Link
        to={to}
        onClick={e => e.stopPropagation()}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        Apply Now <ArrowLeft size={11} className="rotate-180" />
      </Link>
    </Link>
  )
}

export default function CompanyDetail() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const [company, setCompany]   = useState(null)
  const [jobs, setJobs]         = useState([])
  const [internships, setInternships] = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('about')

  useEffect(() => {
    window.scrollTo(0, 0)
    Promise.all([
      companiesAPI.getPublicProfile(id),
      jobsAPI.listJobs({ company: id }),
      internshipsAPI.listInternships({ company: id }),
    ])
      .then(([compRes, jobsRes, internsRes]) => {
        setCompany(compRes.data)
        setJobs(jobsRes.data?.results || jobsRes.data || [])
        setInternships(internsRes.data?.results || internsRes.data || [])
      })
      .catch(() => toast.error('Failed to load company details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-5 animate-pulse">
        <div className="h-10 skeleton rounded-xl w-32" />
        <div className="card">
          <div className="flex gap-5">
            <div className="w-20 h-20 skeleton rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 skeleton rounded-xl w-1/2" />
              <div className="h-4 skeleton rounded-xl w-1/3" />
              <div className="h-4 skeleton rounded-xl w-1/4" />
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-40 skeleton rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 size={48} className="text-gray-200 mb-4" />
        <h3 className="text-lg font-semibold text-gray-500 mb-2">Company not found</h3>
        <Link to="/student/companies" className="btn-primary text-sm py-2">← Back to Companies</Link>
      </div>
    )
  }

  const initials = company.name?.slice(0, 2).toUpperCase()
  const totalOpportunities = jobs.length + internships.length
  const tabs = [
    { id: 'about',        label: 'About' },
    { id: 'opportunities',label: `Opportunities (${totalOpportunities})` },
    { id: 'skills',       label: 'Required Skills' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* Back button */}
      <button
        onClick={() => navigate('/student/companies')}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Companies
      </button>

      {/* Hero card */}
      <div className="card overflow-hidden p-0 animate-fade-in-up">
        {/* Gradient banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-4">
            {company.logo
              ? <img src={company.logo} alt={company.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0" />
              : (
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-100 to-violet-100">
                  <span className="text-indigo-600 font-extrabold text-xl">{initials}</span>
                </div>
              )
            }
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-gray-900">{company.name}</h1>
                {company.is_verified && (
                  <span className="badge-verified text-xs flex items-center gap-1">
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                {company.location && (
                  <span className="flex items-center gap-1"><MapPin size={13} /> {company.location}</span>
                )}
                {company.domain && (
                  <span className="flex items-center gap-1"><Building2 size={13} /> {DOMAIN_LABELS[company.domain]}</span>
                )}
                {company.established_year && (
                  <span className="flex items-center gap-1"><Calendar size={13} /> Est. {company.established_year}</span>
                )}
                {company.employee_count && (
                  <span className="flex items-center gap-1"><Users size={13} /> {company.employee_count} employees</span>
                )}
              </div>
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 btn-secondary text-sm py-2 px-4 flex-shrink-0">
                <Globe size={14} /> Website <ExternalLink size={11} />
              </a>
            )}
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Briefcase,      label: 'Jobs',         value: jobs.length },
              { icon: GraduationCap,  label: 'Internships',  value: internships.length },
              { icon: Award,          label: 'Skills Sought', value: company.required_skills?.length || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <Icon size={18} className="text-indigo-500 mx-auto mb-1" />
                <p className="text-xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100 px-2 pt-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-all border-b-2 mr-1
                ${activeTab === tab.id
                  ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── About tab ── */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fade-in">
              {company.about && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info size={15} className="text-indigo-400" /> About {company.name}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{company.about}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Industry',         value: DOMAIN_LABELS[company.domain] },
                  { label: 'Target Hiring',    value: company.target_hiring === 'both' ? 'Jobs & Internships' : company.target_hiring === 'job' ? 'Jobs' : 'Internships' },
                  { label: 'Location',         value: company.location },
                  { label: 'Established Year', value: company.established_year },
                  { label: 'Employee Count',   value: company.employee_count },
                  { label: 'Registration No.', value: company.registration_number || '—' },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="flex flex-col bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
                    <span className="text-sm text-gray-800 font-semibold mt-0.5">{value}</span>
                  </div>
                ))}
              </div>

              {/* Contact Person */}
              {company.contact_person_name && (
                <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
                  <h4 className="font-semibold text-indigo-900 mb-3 text-sm">Contact Person</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 font-bold text-sm">
                        {company.contact_person_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{company.contact_person_name}</p>
                      {company.contact_person_designation && (
                        <p className="text-xs text-gray-500">{company.contact_person_designation}</p>
                      )}
                      {company.contact_person_email && (
                        <p className="text-xs text-indigo-600">{company.contact_person_email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Opportunities tab ── */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6 animate-fade-in">
              {jobs.length === 0 && internships.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No active openings at the moment.</p>
                  <p className="text-gray-400 text-xs mt-1">Check back later or browse other companies.</p>
                </div>
              ) : (
                <>
                  {jobs.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Briefcase size={15} className="text-indigo-500" /> Jobs ({jobs.length})
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {jobs.map(job => <OpportunityCard key={job.id} item={job} type="job" />)}
                      </div>
                    </div>
                  )}
                  {internships.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap size={15} className="text-violet-500" /> Internships ({internships.length})
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {internships.map(intern => <OpportunityCard key={intern.id} item={intern} type="internship" />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Skills tab ── */}
          {activeTab === 'skills' && (
            <div className="animate-fade-in">
              {company.required_skills?.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    {company.name} is actively looking for candidates with the following skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {company.required_skills.map(skill => (
                      <span key={skill.id || skill.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Star size={11} className="text-indigo-400" />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                      <Award size={15} className="text-amber-600" />
                      Check your Skill Gap for this company
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      See which skills you already have and what you need to develop.
                    </p>
                    <Link to="/student/skill-gap" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors">
                      Open Skill Gap Analysis <ArrowLeft size={10} className="rotate-180" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No required skills listed for this company.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky apply bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-100 shadow-2xl px-4 md:px-6 py-3 flex items-center justify-between gap-3 z-40 animate-fade-in">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 font-bold text-xs">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{company.name}</p>
            <p className="text-xs text-gray-500">{totalOpportunities} open position{totalOpportunities !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setActiveTab('opportunities')}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
            <Briefcase size={14} /> View Openings
          </button>
        </div>
      </div>
      {/* bottom padding for sticky bar */}
      <div className="h-16" />
    </div>
  )
}
