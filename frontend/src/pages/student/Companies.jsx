import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { companiesAPI } from '../../services/api'
import {
  Search, Filter, Building2, MapPin, Briefcase, GraduationCap,
  ArrowRight, X, SlidersHorizontal, ChevronDown
} from 'lucide-react'

/* ── Domain badge colours ── */
const DOMAIN_COLORS = {
  it:            'bg-blue-50 text-blue-700 border-blue-100',
  ai:            'bg-violet-50 text-violet-700 border-violet-100',
  finance:       'bg-emerald-50 text-emerald-700 border-emerald-100',
  edtech:        'bg-amber-50 text-amber-700 border-amber-100',
  healthcare:    'bg-rose-50 text-rose-700 border-rose-100',
  iot:           'bg-cyan-50 text-cyan-700 border-cyan-100',
  cybersecurity: 'bg-red-50 text-red-700 border-red-100',
  ecommerce:     'bg-orange-50 text-orange-700 border-orange-100',
  cloud:         'bg-sky-50 text-sky-700 border-sky-100',
  manufacturing: 'bg-stone-50 text-stone-700 border-stone-100',
  consulting:    'bg-teal-50 text-teal-700 border-teal-100',
  media:         'bg-pink-50 text-pink-700 border-pink-100',
  other:         'bg-gray-50 text-gray-600 border-gray-200',
}

const DOMAIN_LABELS = {
  it: 'IT', ai: 'AI/ML', finance: 'Finance', edtech: 'EdTech',
  healthcare: 'Healthcare', iot: 'IoT', cybersecurity: 'Cybersecurity',
  ecommerce: 'E-Commerce', cloud: 'Cloud', manufacturing: 'Manufacturing',
  consulting: 'Consulting', media: 'Media', other: 'Other',
}

const HIRING_ICONS = {
  both:        { icon: '💼🎓', label: 'Jobs & Internships' },
  job:         { icon: '💼',   label: 'Jobs Only' },
  internship:  { icon: '🎓',   label: 'Internships Only' },
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 skeleton-shimmer rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton-shimmer rounded-lg w-3/4" />
          <div className="h-3 skeleton-shimmer rounded-lg w-1/2" />
        </div>
      </div>
      <div className="h-3 skeleton-shimmer rounded-lg w-full" />
      <div className="h-3 skeleton-shimmer rounded-lg w-5/6" />
      <div className="flex gap-2">
        <div className="h-6 skeleton-shimmer rounded-full w-20" />
        <div className="h-6 skeleton-shimmer rounded-full w-24" />
      </div>
      <div className="h-9 skeleton-shimmer rounded-xl w-full" />
    </div>
  )
}

/* ── Company card ── */
function CompanyCard({ company, index }) {
  const domainClass = DOMAIN_COLORS[company.domain] || DOMAIN_COLORS.other
  const domainLabel = DOMAIN_LABELS[company.domain] || 'Other'
  const hiring      = HIRING_ICONS[company.target_hiring] || HIRING_ICONS.both
  const initials    = company.name?.slice(0, 2).toUpperCase() || 'CO'

  return (
    <div
      className="company-card flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {company.logo
          ? <img src={company.logo} alt={company.name}
              className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0 shadow-sm" />
          : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0 border border-indigo-100">
              <span className="text-indigo-600 font-bold text-base">{initials}</span>
            </div>
          )
        }
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{company.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin size={11} /> {company.location || 'India'}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${domainClass}`}>
          {domainLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
        {company.about || `${company.name} is looking for talented students to join their team.`}
      </p>

      {/* Skills */}
      {company.required_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {company.required_skills.slice(0, 4).map(skill => (
            <span key={skill.id || skill.name} className="skill-tag">{skill.name}</span>
          ))}
          {company.required_skills.length > 4 && (
            <span className="skill-tag">+{company.required_skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          {hiring.icon === '💼🎓'
            ? <><Briefcase size={11} /><GraduationCap size={11} /></>
            : hiring.icon === '💼' ? <Briefcase size={11} /> : <GraduationCap size={11} />
          }
          {hiring.label}
        </span>
        {company.employee_count && (
          <span className="flex items-center gap-1">
            <Building2 size={11} /> {company.employee_count} employees
          </span>
        )}
      </div>

      {/* CTA */}
      <Link
        to={`/student/companies/${company.id}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl
          bg-indigo-50 text-indigo-700 font-semibold text-sm border border-indigo-100
          hover:bg-indigo-600 hover:text-white hover:border-indigo-600
          transition-all duration-200"
      >
        View Details <ArrowRight size={14} />
      </Link>
    </div>
  )
}

/* ── Filter pill ── */
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 whitespace-nowrap
        ${active
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
        }`}
    >
      {label}
    </button>
  )
}

export default function CompaniesPage() {
  const [companies, setCompanies]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [domainFilter, setDomain]     = useState('all')
  const [hiringFilter, setHiring]     = useState('all')
  const [sortBy, setSortBy]           = useState('name')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    companiesAPI.listCompanies()
      .then(res => setCompanies(res.data?.results || res.data || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false))
  }, [])

  /* ── unique domains from data ── */
  const domains = useMemo(() => {
    const set = new Set(companies.map(c => c.domain).filter(Boolean))
    return ['all', ...set]
  }, [companies])

  /* ── filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = companies.filter(c => c.is_verified !== false)   // only verified

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.about?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.required_skills?.some(s => s.name?.toLowerCase().includes(q))
      )
    }
    if (domainFilter !== 'all') list = list.filter(c => c.domain === domainFilter)
    if (hiringFilter !== 'all') list = list.filter(c => c.target_hiring === hiringFilter)

    return [...list].sort((a, b) => {
      if (sortBy === 'name')     return a.name.localeCompare(b.name)
      if (sortBy === 'newest')   return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'skills')   return (b.required_skills?.length || 0) - (a.required_skills?.length || 0)
      return 0
    })
  }, [companies, search, domainFilter, hiringFilter, sortBy])

  const clearFilters = () => {
    setSearch(''); setDomain('all'); setHiring('all'); setSortBy('name')
  }
  const hasActiveFilters = search || domainFilter !== 'all' || hiringFilter !== 'all' || sortBy !== 'name'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Building2 size={22} className="text-indigo-600" /> Companies
        </h1>
        <p className="page-subtitle">
          Explore {companies.length}+ verified companies hiring students like you.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search companies, skills, locations…"
              className="input pl-10 h-10"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 h-10 rounded-xl border text-sm font-medium transition-all
              ${showFilters || hasActiveFilters
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">
                {[domainFilter !== 'all', hiringFilter !== 'all', sortBy !== 'name'].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative hidden md:block">
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="name">A → Z</option>
              <option value="newest">Newest First</option>
              <option value="skills">Most Skills</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="space-y-3 pt-1 border-t border-gray-100 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Domain</p>
              <div className="flex flex-wrap gap-2">
                <FilterPill label="All Domains" active={domainFilter === 'all'} onClick={() => setDomain('all')} />
                {domains.filter(d => d !== 'all').map(d => (
                  <FilterPill key={d} label={DOMAIN_LABELS[d] || d} active={domainFilter === d} onClick={() => setDomain(d)} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Opportunity Type</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { val: 'all',        label: 'All Types' },
                  { val: 'both',       label: '💼🎓 Jobs & Internships' },
                  { val: 'job',        label: '💼 Jobs Only' },
                  { val: 'internship', label: '🎓 Internships Only' },
                ].map(({ val, label }) => (
                  <FilterPill key={val} label={label} active={hiringFilter === val} onClick={() => setHiring(val)} />
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Result count */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filtered.length === 0
              ? 'No companies found'
              : `Showing ${filtered.length} ${filtered.length === 1 ? 'company' : 'companies'}`
            }
            {hasActiveFilters && <span className="text-indigo-600 font-medium"> (filtered)</span>}
          </p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5">
            <Building2 size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No companies found</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 btn-secondary text-sm py-2">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((company, i) => (
            <CompanyCard key={company.id} company={company} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
