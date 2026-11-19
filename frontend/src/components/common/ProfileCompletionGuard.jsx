import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { studentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  User, GraduationCap, Target, ArrowRight, Zap,
  AlertTriangle, CheckCircle
} from 'lucide-react'

const REQUIRED_FIELDS = ['full_name', 'mobile', 'college_name', 'degree', 'branch', 'graduation_year', 'career_goal']
const CAREER_GOALS = [
  'Backend Developer','Frontend Developer','Full Stack Developer',
  'Data Scientist','AI/ML Engineer','Data Analyst',
  'DevOps Engineer','Mobile Developer','Cybersecurity Engineer','Web Developer','Other',
]

export default function ProfileCompletionGuard({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const [status, setStatus] = useState('checking') // checking | complete | incomplete
  const [form, setForm] = useState({})
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const steps = [
    { key: 'full_name',       label: 'Full Name',       icon: User,          type: 'text',   placeholder: 'e.g. Arjun Sharma' },
    { key: 'mobile',          label: 'Mobile Number',   icon: User,          type: 'tel',    placeholder: 'e.g. 9876543210'   },
    { key: 'college_name',    label: 'College Name',    icon: GraduationCap, type: 'text',   placeholder: 'e.g. SKN College'  },
    { key: 'degree',          label: 'Degree',          icon: GraduationCap, type: 'select', options: ['B.Tech','B.E.','B.Sc','BCA','M.Tech','MCA','MBA','Other'] },
    { key: 'branch',          label: 'Branch',          icon: GraduationCap, type: 'text',   placeholder: 'e.g. Computer Science' },
    { key: 'graduation_year', label: 'Graduation Year', icon: GraduationCap, type: 'select', options: ['2024','2025','2026','2027','2028'] },
    { key: 'career_goal',     label: 'Career Goal',     icon: Target,        type: 'career'  },
  ]

  useEffect(() => {
    // Only guard students, skip if on edit page or not a student
    if (user?.role !== 'student') { setStatus('complete'); return }
    if (location.pathname.includes('/edit') || location.pathname.includes('/verify')) {
      setStatus('complete'); return
    }

    studentAPI.getProfile()
      .then(res => {
        const p = res.data
        const incomplete = REQUIRED_FIELDS.some(f => !p[f] || String(p[f]).trim() === '')
        if (incomplete) {
          setForm({
            full_name: p.full_name || '',
            mobile: p.mobile || '',
            college_name: p.college_name || '',
            degree: p.degree || '',
            branch: p.branch || '',
            graduation_year: String(p.graduation_year || ''),
            career_goal: p.career_goal || '',
          })
          setStatus('incomplete')
        } else {
          setStatus('complete')
        }
      })
      .catch(() => {
        // If API fails (backend not running), just let them through
        setStatus('complete')
      })
  }, [user, location.pathname])

  const handleNext = async () => {
    const s = steps[step]
    if (!form[s.key] || String(form[s.key]).trim() === '') {
      setErrors({ [s.key]: `${s.label} is required` })
      return
    }
    setErrors({})

    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }

    // Last step — save profile
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, String(v)) })
      await studentAPI.updateProfile(fd)
      setStatus('complete')
    } catch {
      // Even if save fails, let them through to avoid blocking
      setStatus('complete')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => setStatus('complete')

  // Always render children if complete or checking (don't block on check)
  if (status === 'complete') return children
  if (status === 'checking') return children // don't block while checking

  const currentStep = steps[step]
  const StepIcon = currentStep.icon
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 leading-none">EduNexus</p>
            <p className="text-violet-500 text-xs">Complete Your Profile</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-violet-100 overflow-hidden">
          {/* Progress */}
          <div className="h-1.5 bg-violet-50">
            <div className="h-1.5 bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mx-auto mb-3">
                <StepIcon size={24} className="text-violet-600" />
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                <AlertTriangle size={13} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">Complete your profile to continue</span>
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">Welcome to EduNexus! 🎓</h1>
              <p className="text-gray-500 text-sm mt-1">Step {step + 1} of {steps.length}</p>
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {steps.map((_, i) => (
                <div key={i} className={`rounded-full transition-all ${i === step ? 'w-6 h-2 bg-violet-600' : i < step ? 'w-2 h-2 bg-violet-400' : 'w-2 h-2 bg-gray-200'}`} />
              ))}
            </div>

            {/* Field */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                {currentStep.label} <span className="text-red-500">*</span>
              </label>

              {currentStep.type === 'career' ? (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {CAREER_GOALS.map(g => (
                    <button key={g} type="button"
                      onClick={() => setForm({ ...form, career_goal: g })}
                      className={`text-left text-sm px-3 py-2.5 rounded-xl border-2 font-medium transition-all
                        ${form.career_goal === g ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-violet-200'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              ) : currentStep.type === 'select' ? (
                <select className="input text-base py-3"
                  value={form[currentStep.key] || ''}
                  onChange={e => setForm({ ...form, [currentStep.key]: e.target.value })}>
                  <option value="">Select {currentStep.label}</option>
                  {currentStep.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={currentStep.type}
                  className="input text-base py-3"
                  placeholder={currentStep.placeholder}
                  value={form[currentStep.key] || ''}
                  onChange={e => setForm({ ...form, [currentStep.key]: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
              )}

              {errors[currentStep.key] && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors[currentStep.key]}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {step > 0 && (
                <button onClick={() => { setStep(step - 1); setErrors({}) }}
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-violet-300 hover:text-violet-700 transition-all">
                  ← Back
                </button>
              )}
              <button onClick={handleNext} disabled={saving}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                  text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm
                  transition-all hover:-translate-y-0.5 disabled:opacity-50">
                {saving
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</>
                  : step < steps.length - 1
                    ? <>Next <ArrowRight size={15} /></>
                    : <><CheckCircle size={15} /> Save & Enter Dashboard</>
                }
              </button>
            </div>

            <button onClick={handleSkip}
              className="w-full text-center text-gray-400 text-xs mt-3 hover:text-gray-600 transition-colors py-1">
              Skip for now — I'll complete my profile later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
