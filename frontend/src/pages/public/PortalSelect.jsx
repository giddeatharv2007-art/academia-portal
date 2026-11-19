import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, GraduationCap, Building2, ArrowRight } from 'lucide-react'
import EduNexusLogo from '../../components/common/EduNexusLogo'

const portals = [
  {
    key: 'student',
    icon: GraduationCap,
    emoji: '🎓',
    title: 'Student Portal',
    subtitle: 'Career & Growth',
    description: 'Discover opportunities, build your career and connect with top companies.',
    features: ['Job & Internship Search', 'Verified Skill Passport', 'AI Interview Prep', 'Career Roadmap'],
    gradient: 'from-violet-900 via-purple-900 to-indigo-900',
    border: 'border-violet-500/40',
    hover: 'hover:border-violet-400',
    glow: 'hover:shadow-violet-500/25',
    btn: 'from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-300',
    tag: 'Students & Candidates',
    tagColor: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    path: '/login/student',
  },
  {
    key: 'company',
    icon: Building2,
    emoji: '🏢',
    title: 'Company Portal',
    subtitle: 'Recruit & Hire',
    description: 'Find talented students, post opportunities and manage your entire recruitment pipeline.',
    features: ['Post Jobs & Internships', 'AI Candidate Matching', 'Applicant Tracking', 'Recruitment Analytics'],
    gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    border: 'border-emerald-500/40',
    hover: 'hover:border-emerald-400',
    glow: 'hover:shadow-emerald-500/25',
    btn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-300',
    tag: 'Recruiters & Companies',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    path: '/login/company',
  },
  {
    key: 'college',
    icon: ShieldCheck,
    emoji: '🏛️',
    title: 'College Portal',
    subtitle: 'Admin & Analytics',
    description: 'Manage students, track placements, analyse industry skill gaps and create training programs.',
    features: ['Student Management', 'Placement Analytics', 'Industry Skill Demand', 'Training Programs'],
    gradient: 'from-blue-900 via-indigo-900 to-slate-900',
    border: 'border-blue-500/40',
    hover: 'hover:border-blue-400',
    glow: 'hover:shadow-blue-500/25',
    btn: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-300',
    tag: 'College Administrators',
    tagColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    path: '/login/college',
  },
  // TEMPORARILY REMOVED — Acadmissions Portal card
  // {
  //   key: 'advisor',
  //   icon: BookOpen,
  //   emoji: '🎯',
  //   title: 'Acadmissions Portal',
  //   subtitle: 'Admissions & Counselling',
  //   description: 'Guide students through admissions, manage counselling pipelines and track application outcomes.',
  //   features: ['Application Tracking', 'Counselling Pipeline', 'Admission Analytics', 'Document Verification'],
  //   gradient: 'from-rose-900 via-pink-900 to-fuchsia-900',
  //   border: 'border-rose-500/40',
  //   hover: 'hover:border-rose-400',
  //   glow: 'hover:shadow-rose-500/25',
  //   btn: 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500',
  //   iconBg: 'bg-rose-500/20',
  //   iconColor: 'text-rose-300',
  //   tag: 'Admissions Advisors',
  //   tagColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  //   path: '/login/advisor',
  // },
]

export default function PortalSelect() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex justify-center mb-3">
        <Link to="/">
          <EduNexusLogo size={52} showTagline={true} className="justify-center" />
        </Link>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Choose Your Portal</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Select your role to access your personalised experience on EduNexus
        </p>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">
        {portals.map((portal) => {
          const Icon = portal.icon
          return (
            <div
              key={portal.key}
              onMouseEnter={() => setHovered(portal.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(portal.path)}
              className={`relative rounded-2xl border bg-gradient-to-br ${portal.gradient} ${portal.border}
                ${portal.hover} cursor-pointer transition-all duration-300 overflow-hidden
                hover:shadow-2xl ${portal.glow} hover:-translate-y-1.5 group`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] transition-all duration-300 rounded-2xl" />

              <div className="p-7 flex flex-col h-full relative z-10">
                <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full mb-4 ${portal.tagColor}`}>
                  {portal.tag}
                </span>

                <div className={`w-14 h-14 rounded-2xl ${portal.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 border border-white/10`}>
                  <Icon size={26} className={portal.iconColor} />
                </div>

                <div className="mb-1">
                  <span className="text-2xl mr-1">{portal.emoji}</span>
                  <h2 className="text-xl font-bold text-white inline">{portal.title}</h2>
                </div>
                <p className={`text-xs font-semibold mb-3 ${portal.iconColor}`}>{portal.subtitle}</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">{portal.description}</p>

                <ul className="space-y-1.5 mb-6 flex-1">
                  {portal.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className={`w-1.5 h-1.5 rounded-full bg-current ${portal.iconColor}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button className={`w-full bg-gradient-to-r ${portal.btn} text-white font-semibold py-2.5 rounded-xl
                  flex items-center justify-center gap-2 text-sm transition-all duration-200 group-hover:gap-3 shadow-lg`}>
                  Continue <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-gray-600 text-xs mt-10">© 2024 EduNexus · Bridging Students, Colleges and Industry</p>
    </div>
  )
}
