import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentAPI, skillsAPI, assessmentsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ProctoredTestModal from '../../components/common/ProctoredTestModal'
import CertificateTestModal from '../../components/common/CertificateTestModal'
import {
  Save, Plus, Trash2, Lock, ShieldCheck, AlertTriangle,
  CheckCircle, Star, Play, X, Trophy, Award, FileText,
  Upload, Eye, Flag, RefreshCw, Camera
} from 'lucide-react'

const CAREER_GOALS = [
  'Backend Developer','Frontend Developer','Full Stack Developer',
  'Data Scientist','AI/ML Engineer','Data Analyst',
  'DevOps Engineer','Mobile Developer','Cybersecurity Engineer','Web Developer','Other',
]

/* ─── helpers ───────────────────────────────────────────────────────────── */
function generateFallbackQuestions(skillName) {
  const banks = {
    python: [
      { id:'fb-py-1', question_text:'What keyword defines a function in Python?',       options:['func','def','function','define'],               correct_answer:'def' },
      { id:'fb-py-2', question_text:'What is the output of len([1,2,3])?',              options:['2','3','4','Error'],                            correct_answer:'3' },
      { id:'fb-py-3', question_text:'Which is used for a list comprehension?',          options:['{}','()','[]','<>'],                            correct_answer:'[]' },
      { id:'fb-py-4', question_text:'What does "pass" do?',                             options:['Returns None','Does nothing','Breaks loop','Raises error'], correct_answer:'Does nothing' },
      { id:'fb-py-5', question_text:'How do you handle exceptions in Python?',          options:['try/except','error/catch','handle/catch','try/catch'], correct_answer:'try/except' },
    ],
    javascript: [
      { id:'fb-js-1', question_text:'Which keyword declares a block-scoped variable?',  options:['var','let','const','both let and const'],       correct_answer:'both let and const' },
      { id:'fb-js-2', question_text:'What does === check?',                             options:['Value only','Type only','Value and type','Reference'], correct_answer:'Value and type' },
      { id:'fb-js-3', question_text:'Which method adds to end of array?',               options:['push()','pop()','shift()','append()'],          correct_answer:'push()' },
      { id:'fb-js-4', question_text:'What is a Promise?',                               options:['A loop','An async operation placeholder','A variable','A function'], correct_answer:'An async operation placeholder' },
      { id:'fb-js-5', question_text:'How do you create an arrow function?',             options:['function(){}','() => {}','fn(){}','lambda(){}'], correct_answer:'() => {}' },
    ],
    sql: [
      { id:'fb-sql-1', question_text:'Which SQL command retrieves data?',                options:['GET','SELECT','FETCH','READ'],                  correct_answer:'SELECT' },
      { id:'fb-sql-2', question_text:'What does WHERE clause do?',                       options:['Sorts data','Filters rows','Groups rows','Joins tables'], correct_answer:'Filters rows' },
      { id:'fb-sql-3', question_text:'Which JOIN returns all rows from left table?',     options:['INNER JOIN','RIGHT JOIN','LEFT JOIN','FULL JOIN'], correct_answer:'LEFT JOIN' },
      { id:'fb-sql-4', question_text:'What is PRIMARY KEY?',                             options:['Any column','Unique row identifier','Foreign key','Index'], correct_answer:'Unique row identifier' },
      { id:'fb-sql-5', question_text:'Which aggregate counts rows?',                     options:['SUM','AVG','COUNT','MAX'],                      correct_answer:'COUNT' },
    ],
    react: [
      { id:'fb-react-1', question_text:'What hook manages local state?',                   options:['useEffect','useState','useRef','useContext'],   correct_answer:'useState' },
      { id:'fb-react-2', question_text:'What are props?',                                  options:['State variables','Data passed to components','Global variables','CSS classes'], correct_answer:'Data passed to components' },
      { id:'fb-react-3', question_text:'Which hook runs after render?',                    options:['useState','useRef','useEffect','useMemo'],      correct_answer:'useEffect' },
      { id:'fb-react-4', question_text:'What is JSX?',                                     options:['A database','HTML-like syntax for React','A CSS framework','A testing tool'], correct_answer:'HTML-like syntax for React' },
      { id:'fb-react-5', question_text:'How do you conditionally render?',                 options:['if(){}','switch()','Ternary or &&','Only useState'], correct_answer:'Ternary or &&' },
    ],
  }
  const key   = skillName.toLowerCase()
  const found = Object.entries(banks).find(([k]) => key.includes(k))
  if (found) return found[1]
  const slug = key.replace(/\s+/g, '-')
  return [
    { id:`fb-${slug}-1`, question_text:`What is ${skillName} primarily used for?`,          options:['Web development','Data analysis','Both','None'], correct_answer:'Both' },
    { id:`fb-${slug}-2`, question_text:`Is ${skillName} an open-source technology?`,        options:['Yes','No','Partially','Unknown'],               correct_answer:'Yes' },
    { id:`fb-${slug}-3`, question_text:`Which best describes ${skillName}?`,                options:['Frontend','Backend','Full-stack','Tool/Library'], correct_answer:'Tool/Library' },
    { id:`fb-${slug}-4`, question_text:'Which skill complements this the most?',            options:['Git','Docker','AWS','All of above'],            correct_answer:'All of above' },
    { id:`fb-${slug}-5`, question_text:`Have you built a project using ${skillName}?`,      options:['Yes, multiple','Yes, one','In progress','Not yet'], correct_answer:'Yes, multiple' },
  ]
}

/* ─── Certificate card ──────────────────────────────────────────────────── */
function CertCard({ cert, onDelete }) {
  const scoreColor = cert.score >= 80 ? 'text-green-600' : cert.score >= 60 ? 'text-yellow-600' : 'text-red-500'
  const scoreBg    = cert.score >= 80 ? 'bg-green-50 border-green-200' : cert.score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Award size={20} className="text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm truncate">{cert.name}</span>
          {cert.verified && (
            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
              <CheckCircle size={9} /> AI Verified
            </span>
          )}
          {cert.flagged && (
            <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
              <Flag size={9} /> Flagged
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {cert.issuer} · <span className="text-indigo-600 font-medium">{cert.topic}</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Added {cert.uploadedAt ? new Date(cert.uploadedAt).toLocaleDateString('en-IN') : 'recently'}
        </p>

        {/* Score bar */}
        {cert.score !== null && cert.score !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${cert.score>=80?'bg-green-500':cert.score>=60?'bg-yellow-500':'bg-red-400'}`}
                style={{ width:`${cert.score}%` }} />
            </div>
            <span className={`text-xs font-bold ${scoreColor} flex-shrink-0`}>{cert.score}%</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${scoreBg}`}>
              {cert.score >= 60 ? 'Passed' : 'Failed'}
            </span>
          </div>
        )}

        {/* Violation count */}
        {cert.violations?.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <Eye size={9} /> {cert.violations.length} violation(s) during test
          </p>
        )}
      </div>

      {/* Delete */}
      <button onClick={() => onDelete(cert.id)}
        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function EditProfile() {
  const navigate = useNavigate()
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [activeTab,      setActiveTab]      = useState('personal')
  const [profile,        setProfile]        = useState({})
  const [skills,         setSkills]         = useState([])
  const [allSkills,      setAllSkills]      = useState([])
  const [newSkillName,   setNewSkillName]   = useState('')
  const [assessingSkill, setAssessingSkill] = useState(null)   // skill object → open proctored modal
  const [pendingSkill,   setPendingSkill]   = useState(null)   // same
  const [skillQuestions, setSkillQuestions] = useState([])
  const [showCertModal,  setShowCertModal]  = useState(false)
  const [certificates,   setCertificates]   = useState([])     // local list

  useEffect(() => {
    Promise.all([
      studentAPI.getProfile(),
      skillsAPI.getMySkills(),
      skillsAPI.listSkills(),
      studentAPI.getCertifications().catch(() => ({ data: [] })),
    ]).then(([pRes, sRes, allRes, cRes]) => {
      setProfile(pRes.data)
      setSkills(sRes.data.results   || sRes.data   || [])
      setAllSkills(allRes.data.results || allRes.data || [])
      // normalise cert data from API
      const apiCerts = cRes.data.results || cRes.data || []
      setCertificates(apiCerts.map(c => ({
        id:         c.id,
        name:       c.title || c.name || 'Certificate',
        issuer:     c.issuing_organisation || c.issuer || 'Unknown',
        topic:      c.certificate_type || c.topic || 'General',
        score:      c.test_score ?? c.score ?? null,
        verified:   c.is_verified ?? c.verified ?? false,
        flagged:    c.is_flagged  ?? c.flagged  ?? false,
        violations: c.violations || [],
        uploadedAt: c.created_at || c.uploadedAt || null,
      })))
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  /* ── save profile ────────────────────────────────────────────── */
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(profile).forEach(([k, v]) => {
        if (v !== null && v !== undefined && typeof v !== 'object') fd.append(k, v)
        else if (Array.isArray(v)) fd.append(k, JSON.stringify(v))
      })
      await studentAPI.updateProfile(fd)
      toast.success('Profile saved!')
      navigate('/student/profile')
    } catch { toast.error('Failed to save profile') }
    finally  { setSaving(false) }
  }

  /* ── skill: open proctored modal ─────────────────────────────── */
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return toast.error('Please enter a skill name')
    const already = skills.find(s => s.skill_name?.toLowerCase() === newSkillName.trim().toLowerCase())
    if (already) return toast.error('Skill already added. Use Retake to update score.')
    const qs = await loadSkillQuestions(newSkillName.trim())
    setPendingSkill({ skill_name: newSkillName.trim() })
    setSkillQuestions(qs)
    setAssessingSkill({ skill_name: newSkillName.trim() })
  }

  const handleRetakeAssessment = async (skill) => {
    const qs = await loadSkillQuestions(skill.skill_name)
    setPendingSkill(skill)
    setSkillQuestions(qs)
    setAssessingSkill(skill)
  }

  const loadSkillQuestions = async (skillName) => {
    try {
      const res = await assessmentsAPI.list()
      const list = res.data.results || res.data || []
      const found = list.find(a => a.skill_name?.toLowerCase() === skillName.toLowerCase())
      if (found) {
        const qRes = await assessmentsAPI.getQuestions(found.id)
        const qs = qRes.data.questions?.slice(0, 5) || []
        if (qs.length > 0) return qs
      }
    } catch {}
    return generateFallbackQuestions(skillName)
  }

  /* ── proctored test complete (skill) ─────────────────────────── */
  const handleProctoredComplete = async (score, violations) => {
    setAssessingSkill(null)
    if (!pendingSkill) return
    try {
      if (pendingSkill.id) {
        // retake
        await skillsAPI.updateSkill(pendingSkill.id, { proficiency: score, evidence_types: ['assessment'] })
        setSkills(prev => prev.map(s => s.id === pendingSkill.id ? { ...s, proficiency: score } : s))
        toast.success(`Score updated to ${score}%!`)
      } else {
        // new skill
        const res = await skillsAPI.addSkill({ skill_name: pendingSkill.skill_name, proficiency: score, evidence_types: ['assessment'] })
        setSkills(prev => [...prev, { ...res.data, proficiency: score, skill_name: pendingSkill.skill_name }])
        toast.success(`${pendingSkill.skill_name} added — Score: ${score}%!`)
      }
    } catch {
      toast.success(`Assessment done! Score: ${score}%`)
    }
    setNewSkillName('')
    setPendingSkill(null)
  }

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Remove this skill?')) return
    try {
      await skillsAPI.deleteSkill(id)
      setSkills(skills.filter(s => s.id !== id))
      toast.success('Skill removed')
    } catch { toast.error('Failed to remove skill') }
  }

  /* ── certificate saved from modal ────────────────────────────── */
  const handleCertSave = async (certData) => {
    try {
      const fd = new FormData()
      fd.append('title',                  certData.name)
      fd.append('issuing_organisation',   certData.issuer)
      fd.append('certificate_type',       certData.topic)
      fd.append('test_score',             certData.score ?? 0)
      fd.append('is_verified',            certData.verified ? 'true' : 'false')
      fd.append('is_flagged',             certData.flagged  ? 'true' : 'false')
      fd.append('violations',             JSON.stringify(certData.violations || []))
      if (certData.file) fd.append('certificate_file', certData.file)

      const res = await studentAPI.createCertification(fd)
      const saved = res.data

      setCertificates(prev => [...prev, {
        id:         saved.id,
        name:       certData.name,
        issuer:     certData.issuer,
        topic:      certData.topic,
        score:      certData.score,
        verified:   certData.verified,
        flagged:    certData.flagged,
        violations: certData.violations,
        uploadedAt: certData.uploadedAt,
      }])
      toast.success('Certificate added to your profile!')
    } catch {
      // fallback: save locally so UI still updates
      setCertificates(prev => [...prev, {
        id:         Date.now(),
        name:       certData.name,
        issuer:     certData.issuer,
        topic:      certData.topic,
        score:      certData.score,
        verified:   certData.verified,
        flagged:    certData.flagged,
        violations: certData.violations,
        uploadedAt: certData.uploadedAt,
      }])
      toast.success('Certificate saved locally.')
    }
    setShowCertModal(false)
  }

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Remove this certificate?')) return
    try {
      await studentAPI.deleteCertification(id)
    } catch {}
    setCertificates(prev => prev.filter(c => c.id !== id))
    toast.success('Certificate removed')
  }

  const f   = (field) => profile[field] || ''
  const set = (field, val) => setProfile({ ...profile, [field]: val })
  const tabs = ['personal', 'academic', 'skills', 'certificates', 'preferences']

  if (loading) return <LoadingSpinner center />

  return (
    <div className="max-w-2xl space-y-4">

      {/* ── Proctored Skill Test Modal ──────────────────────────── */}
      {assessingSkill && skillQuestions.length > 0 && (
        <ProctoredTestModal
          skill={assessingSkill}
          questions={skillQuestions}
          onClose={() => { setAssessingSkill(null); setPendingSkill(null) }}
          onComplete={handleProctoredComplete}
        />
      )}

      {/* ── Certificate Test Modal ──────────────────────────────── */}
      {showCertModal && (
        <CertificateTestModal
          onClose={() => setShowCertModal(false)}
          onSave={handleCertSave}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <button onClick={handleSaveProfile} disabled={saving}
          className="btn-student flex items-center gap-2">
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-violet-50 p-1 rounded-2xl border border-violet-100 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all whitespace-nowrap px-2
              ${activeTab === t ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
            {t === 'certificates'
              ? <>📜 Certs {certificates.length > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{certificates.length}</span>}</>
              : t}
          </button>
        ))}
      </div>

      {/* ── PERSONAL TAB ───────────────────────────────────────── */}
      {activeTab === 'personal' && (
        <div className="card-student space-y-4">
          <h2 className="font-semibold text-gray-900">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label:'Full Name *',     field:'full_name',    type:'text' },
              { label:'Mobile Number *', field:'mobile',       type:'tel'  },
              { label:'Date of Birth',   field:'date_of_birth',type:'date' },
              { label:'City',            field:'city',         type:'text' },
              { label:'State',           field:'state',        type:'text' },
              { label:'PIN Code',        field:'pin_code',     type:'text' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input type={type} className="input" value={f(field)} onChange={e => set(field, e.target.value)} />
              </div>
            ))}
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input resize-none" rows={2} value={f('address')} onChange={e => set('address', e.target.value)} />
          </div>
          <div>
            <label className="label">Current Status</label>
            <select className="input" value={f('current_status')} onChange={e => set('current_status', e.target.value)}>
              {['student','employee','intern','other'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label:'GitHub URL',    field:'github_url'    },
              { label:'LinkedIn URL',  field:'linkedin_url'  },
              { label:'Portfolio URL', field:'portfolio_url' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input type="url" className="input" value={f(field)} placeholder="https://" onChange={e => set(field, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ACADEMIC TAB ───────────────────────────────────────── */}
      {activeTab === 'academic' && (
        <div className="card-student space-y-4">
          <h2 className="font-semibold text-gray-900">Academic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label:'College Name *', field:'college_name' },
              { label:'University',     field:'university'   },
              { label:'Degree *',       field:'degree'       },
              { label:'Branch *',       field:'branch'       },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input type="text" className="input" value={f(field)} onChange={e => set(field, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="label">Current Year</label>
              <select className="input" value={f('current_year')} onChange={e => set('current_year', e.target.value)}>
                <option value="">Select year</option>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>{y}{['st','nd','rd','th','th'][y-1]} Year</option>)}
              </select>
            </div>
            <div>
              <label className="label">Graduation Year *</label>
              <input type="number" className="input" value={f('graduation_year')} min={2024} max={2030} onChange={e => set('graduation_year', e.target.value)} />
            </div>
            <div>
              <label className="label">CGPA / Percentage</label>
              <input type="number" className="input" step="0.01" min="0" max="10" value={f('cgpa')} onChange={e => set('cgpa', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ── SKILLS TAB ─────────────────────────────────────────── */}
      {activeTab === 'skills' && (
        <div className="card-student space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Skills</h2>
            <p className="text-xs text-gray-500 mt-0.5">Skill scores are determined by assessment — not manual input.</p>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <ShieldCheck size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Scores are locked after assessment</p>
              <p className="text-xs text-amber-600 mt-0.5">
                When you add a skill, you'll take a quick AI-proctored 5-question test.
                Camera &amp; mic access required. Your score is set automatically.
              </p>
            </div>
          </div>

          {/* Proctoring notice */}
          <div className="flex items-start gap-2 p-3 bg-violet-50 border border-violet-100 rounded-xl">
            <Camera size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-violet-700">
              <strong>AI Proctored:</strong> Camera must stay on · Only one face allowed ·
              Copy/paste disabled · Tab switching is monitored
            </p>
          </div>

          {/* Add new skill */}
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
            <p className="text-sm font-semibold text-violet-700 mb-2">Add a Skill via Proctored Assessment</p>
            <div className="flex gap-2">
              <input
                list="skill-options"
                className="input flex-1"
                placeholder="e.g. Python, React, SQL…"
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
              />
              <datalist id="skill-options">
                {allSkills.map(s => <option key={s.id} value={s.name} />)}
              </datalist>
              <button onClick={handleAddSkill} disabled={!newSkillName.trim()}
                className="btn-student flex items-center gap-1.5 px-4 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
                <Play size={14} /> Take Test
              </button>
            </div>
            <p className="text-xs text-violet-500 mt-1.5">
              {newSkillName.trim()
                ? `Ready to test "${newSkillName.trim()}" — click Take Test to begin.`
                : 'Type a skill name above, then click Take Test to begin the proctored assessment.'}
            </p>
          </div>

          {/* Existing skills */}
          <div className="space-y-2">
            {skills.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Star size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No skills added yet. Add a skill to take the assessment!</p>
              </div>
            )}
            {skills.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{s.skill_name}</span>
                    {s.is_verified && (
                      <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        <CheckCircle size={9} /> Verified
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      <Lock size={9} /> Assessment Score
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${s.proficiency >= 80 ? 'bg-green-500' : s.proficiency >= 60 ? 'bg-blue-500' : s.proficiency >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`}
                        style={{ width:`${s.proficiency}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-10 text-right">{s.proficiency}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleRetakeAssessment(s)} title="Retake proctored assessment"
                    className="flex items-center gap-1 text-xs text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
                    <Play size={11} /> Retake
                  </button>
                  <button onClick={() => handleDeleteSkill(s.id)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CERTIFICATES TAB ───────────────────────────────────── */}
      {activeTab === 'certificates' && (
        <div className="card-student space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">Certificates</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload a certificate, get it AI-verified, then take a proctored knowledge test.
              </p>
            </div>
            <button onClick={() => setShowCertModal(true)}
              className="btn-student flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <Plus size={15} /> Add Certificate
            </button>
          </div>

          {/* How it works */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">How it works</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { step:'1', icon:'📤', label:'Upload',     desc:'Any cert image or PDF' },
                { step:'2', icon:'🤖', label:'AI Verify',  desc:'Authenticity check'    },
                { step:'3', icon:'🎯', label:'Take Test',  desc:'5 proctored questions' },
                { step:'4', icon:'🏆', label:'Get Score',  desc:'Added to your profile' },
              ].map(({ step, icon, label, desc }) => (
                <div key={step} className="text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs font-semibold text-blue-800">{label}</p>
                  <p className="text-[10px] text-blue-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proctoring notice */}
          <div className="flex items-start gap-2 p-3 bg-violet-50 border border-violet-100 rounded-xl">
            <Camera size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-violet-700">
              <strong>AI Proctored test:</strong> Camera · One face only · Copy/paste disabled · Tab switch monitored
            </p>
          </div>

          {/* Certificate list */}
          {certificates.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Award size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No certificates yet</p>
              <p className="text-xs text-gray-400 mt-1">Upload your first certificate to get started</p>
              <button onClick={() => setShowCertModal(true)}
                className="mt-4 btn-student flex items-center gap-2 mx-auto">
                <Upload size={14} /> Upload Certificate
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map(cert => (
                <CertCard key={cert.id} cert={cert} onDelete={handleDeleteCert} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PREFERENCES TAB ────────────────────────────────────── */}
      {activeTab === 'preferences' && (
        <div className="card-student space-y-4">
          <h2 className="font-semibold text-gray-900">Career Preferences</h2>
          <div>
            <label className="label">Target Career Role *</label>
            <div className="grid grid-cols-2 gap-2">
              {CAREER_GOALS.map(g => (
                <button key={g} type="button" onClick={() => set('career_goal', g)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all
                    ${f('career_goal') === g ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-violet-200'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Preferred Work Mode</label>
            <div className="grid grid-cols-4 gap-2">
              {['remote','hybrid','onsite','any'].map(m => (
                <button key={m} type="button" onClick={() => set('preferred_work_mode', m)}
                  className={`p-2 rounded-xl border text-xs font-semibold capitalize transition-all
                    ${f('preferred_work_mode') === m ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-violet-200'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Min Stipend (₹/month)</label>
              <input type="number" className="input" value={f('expected_stipend_min')} onChange={e => set('expected_stipend_min', e.target.value)} />
            </div>
            <div>
              <label className="label">Max Stipend (₹/month)</label>
              <input type="number" className="input" value={f('expected_stipend_max')} onChange={e => set('expected_stipend_max', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex gap-3 pb-6">
        <button onClick={handleSaveProfile} disabled={saving}
          className="btn-student flex items-center gap-2">
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button onClick={() => navigate('/student/profile')} className="btn-secondary">Cancel</button>
      </div>
    </div>
  )
}
