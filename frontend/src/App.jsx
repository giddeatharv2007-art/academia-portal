import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// ── Public pages ─────────────────────────────────────────────────────────────
import Home             from './pages/public/Home'
import PortalSelect     from './pages/public/PortalSelect'
import AdminLogin       from './pages/public/AdminLogin'
import StudentLogin     from './pages/public/StudentLogin'
import CompanyLogin     from './pages/public/CompanyLogin'
import CollegeLogin     from './pages/public/CollegeLogin'
import AdvisorLogin     from './pages/public/AdvisorLogin'
import Register         from './pages/public/Register'
import VerifyEmail      from './pages/public/VerifyEmail'
import CompanyPublicPage from './pages/public/CompanyPublicPage'

// ── Student pages ─────────────────────────────────────────────────────────────
import StudentDashboard    from './pages/student/Dashboard'
import StudentProfile      from './pages/student/Profile'
import EditProfile         from './pages/student/EditProfile'
import SkillPassport       from './pages/student/SkillPassport'
import SkillGap            from './pages/student/SkillGap'
import LearningRoadmap     from './pages/student/LearningRoadmap'
import JobsList            from './pages/student/JobsList'
import JobDetail           from './pages/student/JobDetail'
import InternshipsList     from './pages/student/InternshipsList'
import InternshipDetail    from './pages/student/InternshipDetail'
import StudentApplications from './pages/student/Applications'
import AIInterviewPage     from './pages/student/AIInterview'
import InterviewResult     from './pages/student/InterviewResult'
import ChallengesList      from './pages/student/ChallengesList'
import ChallengeDetail     from './pages/student/ChallengeDetail'
import BadgesPage          from './pages/student/Badges'
import StudentNotifications from './pages/student/Notifications'

// ── Company pages ─────────────────────────────────────────────────────────────
import CompanyDashboard     from './pages/company/Dashboard'
import CompanyProfile       from './pages/company/CompanyProfile'
import PostJob              from './pages/company/PostJob'
import PostInternship       from './pages/company/PostInternship'
import ManageJobs           from './pages/company/ManageJobs'
import ManageInternships    from './pages/company/ManageInternships'
import CandidateSearch      from './pages/company/CandidateSearch'
import CompanyApplications  from './pages/company/Applications'
import CreateChallenge      from './pages/company/CreateChallenge'
import CompanyChallenges    from './pages/company/Challenges'
import CompanyNotifications from './pages/company/Notifications'

// ── Admin / College pages ─────────────────────────────────────────────────────
import AdminDashboard      from './pages/admin/Dashboard'
import AdminStudents       from './pages/admin/Students'
import AdminCompanies      from './pages/admin/Companies'
import CompanyVerification from './pages/admin/CompanyVerification'
import AdminAnalytics      from './pages/admin/Analytics'
import AdminTraining       from './pages/admin/Training'

// ── Advisor / Acadmissions pages ──────────────────────────────────────────────
import AdvisorDashboard     from './pages/advisor/Dashboard'
import AdvisorApplications  from './pages/advisor/Applications'
import AdvisorStudents      from './pages/advisor/Students'
import AdvisorAnalytics     from './pages/advisor/Analytics'
import AdvisorDocuments     from './pages/advisor/Documents'
import AdvisorNotifications from './pages/advisor/Notifications'

// ── Layouts ───────────────────────────────────────────────────────────────────
import StudentLayout from './layouts/StudentLayout'
import CompanyLayout from './layouts/CompanyLayout'
import AdminLayout   from './layouts/AdminLayout'
import AdvisorLayout from './layouts/AdvisorLayout'

// ── Route Guard ───────────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles, loginPath = '/portal' }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={loginPath} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
    if (user.role === 'company') return <Navigate to="/company/dashboard" replace />
    if (user.role === 'college') return <Navigate to="/college/dashboard" replace />
    if (user.role === 'admin')   return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'advisor') return <Navigate to="/advisor/dashboard" replace />
    return <Navigate to="/portal" replace />
  }

  return children
}

// ── Auto-redirect after login ─────────────────────────────────────────────────
function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/portal" replace />
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
  if (user.role === 'company') return <Navigate to="/company/dashboard" replace />
  if (user.role === 'college') return <Navigate to="/college/dashboard" replace />
  if (user.role === 'admin')   return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'advisor') return <Navigate to="/advisor/dashboard" replace />
  return <Navigate to="/portal" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>

          {/* ── Public ─────────────────────────────────────────────────── */}
          <Route path="/"              element={<Home />} />
          <Route path="/portal"        element={<PortalSelect />} />
          <Route path="/login"         element={<PortalSelect />} />
          <Route path="/login/admin"   element={<AdminLogin />} />
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/company" element={<CompanyLogin />} />
          <Route path="/login/college" element={<CollegeLogin />} />
          <Route path="/login/advisor" element={<AdvisorLogin />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/verify-email"  element={<VerifyEmail />} />
          <Route path="/companies/:id" element={<CompanyPublicPage />} />

          {/* Auto-redirect after login */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* ── Student Portal ─────────────────────────────────────────── */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index                    element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"         element={<StudentDashboard />} />
            <Route path="profile"           element={<StudentProfile />} />
            <Route path="profile/edit"      element={<EditProfile />} />
            <Route path="skill-passport"    element={<SkillPassport />} />
            <Route path="skill-gap"         element={<SkillGap />} />
            <Route path="roadmap"           element={<LearningRoadmap />} />
            <Route path="jobs"              element={<JobsList />} />
            <Route path="jobs/:id"          element={<JobDetail />} />
            <Route path="internships"       element={<InternshipsList />} />
            <Route path="internships/:id"   element={<InternshipDetail />} />
            <Route path="applications"      element={<StudentApplications />} />
            <Route path="interview"         element={<AIInterviewPage />} />
            <Route path="interview/result/:id" element={<InterviewResult />} />
            <Route path="challenges"        element={<ChallengesList />} />
            <Route path="challenges/:id"    element={<ChallengeDetail />} />
            <Route path="badges"            element={<BadgesPage />} />
            <Route path="notifications"     element={<StudentNotifications />} />
          </Route>

          {/* ── Company Portal ─────────────────────────────────────────── */}
          <Route path="/company" element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyLayout />
            </ProtectedRoute>
          }>
            <Route index                     element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"          element={<CompanyDashboard />} />
            <Route path="profile"            element={<CompanyProfile />} />
            <Route path="post-job"           element={<PostJob />} />
            <Route path="post-internship"    element={<PostInternship />} />
            <Route path="jobs"               element={<ManageJobs />} />
            <Route path="internships"        element={<ManageInternships />} />
            <Route path="candidates"         element={<CandidateSearch />} />
            <Route path="applications"       element={<CompanyApplications />} />
            <Route path="challenges"         element={<CompanyChallenges />} />
            <Route path="challenges/create"  element={<CreateChallenge />} />
            <Route path="notifications"      element={<CompanyNotifications />} />
          </Route>

          {/* ── Super Admin Portal (EduNexus admin only) ────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']} loginPath="/login/admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index                         element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"              element={<AdminDashboard />} />
            <Route path="students"               element={<AdminStudents />} />
            <Route path="companies"              element={<AdminCompanies />} />
            <Route path="companies/verification" element={<CompanyVerification />} />
            <Route path="analytics"              element={<AdminAnalytics />} />
            <Route path="training"               element={<AdminTraining />} />
          </Route>

          {/* ── College Portal ───────────────────────────────────────────── */}
          <Route path="/college" element={
            <ProtectedRoute allowedRoles={['college']} loginPath="/login/college">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index                         element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"              element={<AdminDashboard />} />
            <Route path="students"               element={<AdminStudents />} />
            <Route path="companies"              element={<AdminCompanies />} />
            <Route path="analytics"              element={<AdminAnalytics />} />
            <Route path="training"               element={<AdminTraining />} />
          </Route>

          {/* ── Acadmissions Advisor Portal ──────────────────────────────── */}
          <Route path="/advisor" element={
            <ProtectedRoute allowedRoles={['advisor']} loginPath="/login/advisor">
              <AdvisorLayout />
            </ProtectedRoute>
          }>
            <Route index                          element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"               element={<AdvisorDashboard />} />
            <Route path="applications"            element={<AdvisorApplications />} />
            <Route path="students"                element={<AdvisorStudents />} />
            <Route path="analytics"               element={<AdvisorAnalytics />} />
            <Route path="documents"               element={<AdvisorDocuments />} />
            <Route path="notifications"           element={<AdvisorNotifications />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
