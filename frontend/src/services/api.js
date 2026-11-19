import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Skip the interceptor for auth endpoints — a 401 on login/refresh/verify-otp
    // means bad credentials, not an expired session. Let the caller handle it.
    const isAuthEndpoint = original?.url?.startsWith('/auth/')

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')
        const res = await axios.post(`${API_BASE}/auth/refresh/`, { refresh })
        localStorage.setItem('access_token', res.data.access)
        original.headers.Authorization = `Bearer ${res.data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        // Redirect to the correct login page based on the current path
        const path = window.location.pathname
        if (path.startsWith('/admin'))      window.location.href = '/login/admin'
        else if (path.startsWith('/company'))  window.location.href = '/login/company'
        else if (path.startsWith('/college'))  window.location.href = '/login/college'
        else if (path.startsWith('/student'))  window.location.href = '/login/student'
        else if (path.startsWith('/advisor'))  window.location.href = '/login/advisor'
        else window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  registerStudent: (data) => api.post('/auth/register/student/', data),
  registerCompany: (data) => api.post('/auth/register/company/', data),
  registerCollege: (data) => api.post('/auth/register/college/', data),
  registerAdvisor: (data) => api.post('/auth/register/advisor/', data),
  registerAdvisor: (data) => api.post('/auth/register/advisor/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  verifyEmail: (token) => api.post('/auth/verify-email/', { token }),
  sendOTP: (email) => api.post('/auth/send-otp/', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp/', { email, otp }),
  resendVerification: (email) => api.post('/auth/resend-verification/', { email }),
  getMe: () => api.get('/auth/me/'),
  changePassword: (data) => api.post('/auth/change-password/', data),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
}

// ─── Student ──────────────────────────────────────────────────────────────────
export const studentAPI = {
  getProfile: () => api.get('/students/profile/'),
  updateProfile: (data) => api.patch('/students/profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPublicProfile: (id) => api.get(`/students/profile/${id}/`),
  getDashboard: () => api.get('/students/dashboard/'),

  // Admin
  adminListStudents: (search = '') => api.get(`/students/admin/all/${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  // Education certs
  getCerts: () => api.get('/students/education-certificates/'),
  uploadCert: (data) => api.post('/students/education-certificates/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verifyCert: (id) => api.post(`/students/education-certificates/${id}/verify/`),

  // Projects
  getProjects: () => api.get('/students/projects/'),
  createProject: (data) => api.post('/students/projects/', data),
  updateProject: (id, data) => api.patch(`/students/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/students/projects/${id}/`),

  // Certifications
  getCertifications: ()         => api.get('/students/certifications/'),
  createCertification: (data)   => api.post('/students/certifications/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCertification: (id, data) => api.patch(`/students/certifications/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCertification: (id)     => api.delete(`/students/certifications/${id}/`),
  verifyCertification: (id)     => api.post(`/students/certifications/${id}/verify/`),
  submitCertTest: (id, data)    => api.post(`/students/certifications/${id}/submit-test/`, data),
  flagCertification: (id, data) => api.post(`/students/certifications/${id}/flag/`, data),

  // Internship experience
  getInternships: () => api.get('/students/internship-experiences/'),
  createInternship: (data) => api.post('/students/internship-experiences/', data),
  updateInternship: (id, data) => api.patch(`/students/internship-experiences/${id}/`, data),
  deleteInternship: (id) => api.delete(`/students/internship-experiences/${id}/`),
}

// ─── Skills ───────────────────────────────────────────────────────────────────
export const skillsAPI = {
  listSkills: (search = '') => api.get(`/skills/list/${search ? `?search=${search}` : ''}`),
  getMySkills: () => api.get('/skills/student/'),
  addSkill: (data) => api.post('/skills/student/', data),
  updateSkill: (id, data) => api.patch(`/skills/student/${id}/`, data),
  deleteSkill: (id) => api.delete(`/skills/student/${id}/`),
  getPassport: () => api.get('/skills/passport/'),
  getStudentPassport: (id) => api.get(`/skills/passport/${id}/`),
  getMyBadges: () => api.get('/skills/my-badges/'),
  getBadges: () => api.get('/skills/badges/'),
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  listJobs: (params = {}) => api.get('/jobs/jobs/', { params }),
  getJob: (id) => api.get(`/jobs/jobs/${id}/`),
  createJob: (data) => api.post('/jobs/jobs/', data),
  updateJob: (id, data) => api.patch(`/jobs/jobs/${id}/`, data),
  deleteJob: (id) => api.delete(`/jobs/jobs/${id}/`),
  applyJob: (id, data) => api.post(`/jobs/jobs/${id}/apply/`, data),
  getJobApplications: (id) => api.get(`/jobs/jobs/${id}/applications/`),
}

// ─── Internships ──────────────────────────────────────────────────────────────
export const internshipsAPI = {
  listInternships: (params = {}) => api.get('/jobs/internships/', { params }),
  getInternship: (id) => api.get(`/jobs/internships/${id}/`),
  createInternship: (data) => api.post('/jobs/internships/', data),
  updateInternship: (id, data) => api.patch(`/jobs/internships/${id}/`, data),
  deleteInternship: (id) => api.delete(`/jobs/internships/${id}/`),
  applyInternship: (id, data) => api.post(`/jobs/internships/${id}/apply/`, data),
  getInternshipApplications: (id) => api.get(`/jobs/internships/${id}/applications/`),
}

// ─── Applications ─────────────────────────────────────────────────────────────
export const applicationsAPI = {
  myApplications: () => api.get('/jobs/applications/'),
  updateStatus: (id, data) => api.post(`/jobs/applications/${id}/update_status/`, data),
  giveFeedback: (id, data) => api.post(`/jobs/applications/${id}/give_feedback/`, data),
}

// ─── Matching ─────────────────────────────────────────────────────────────────
export const matchingAPI = {
  matchJobs: () => api.get('/matching/jobs/'),
  matchInternships: () => api.get('/matching/internships/'),
  matchJob: (id) => api.get(`/matching/jobs/${id}/`),
  matchInternship: (id) => api.get(`/matching/internships/${id}/`),
  skillGap: (role) => api.get(`/matching/skill-gap/${role ? `?role=${role}` : ''}`),
  roadmap: (role) => api.get(`/matching/roadmap/${role ? `?role=${role}` : ''}`),
  findStudents: (params) => api.get('/matching/students/', { params }),
  rejectionAnalysis: () => api.get('/matching/rejection-analysis/'),
  recommendedCompanies: () => api.get('/matching/recommended-companies/'),
}

// ─── Companies ────────────────────────────────────────────────────────────────
export const companiesAPI = {
  getProfile: () => api.get('/companies/profile/'),
  updateProfile: (data) => api.patch('/companies/profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPublicProfile: (id) => api.get(`/companies/profile/${id}/`),
  listCompanies: () => api.get('/companies/list/'),
  getDashboard: () => api.get('/companies/dashboard/'),
  // Admin
  getPendingCompanies: () => api.get('/companies/admin/pending/'),
  getAllCompanies: () => api.get('/companies/admin/all/'),
  approveCompany: (id) => api.post(`/companies/admin/${id}/approve/`),
  rejectCompany: (id, reason) => api.post(`/companies/admin/${id}/reject/`, { reason }),
}

// ─── Interviews ───────────────────────────────────────────────────────────────
export const interviewsAPI = {
  start: (data) => api.post('/interviews/start/', data),
  submitAnswer: (data) => api.post('/interviews/answer/', data),
  complete: (interview_id) => api.post('/interviews/complete/', { interview_id }),
  myInterviews: () => api.get('/interviews/my/'),
  getResult: (id) => api.get(`/interviews/result/${id}/`),
}

// ─── Challenges ───────────────────────────────────────────────────────────────
export const challengesAPI = {
  list: () => api.get('/challenges/'),
  get: (id) => api.get(`/challenges/${id}/`),
  create: (data) => api.post('/challenges/', data),
  join: (id, data) => api.post(`/challenges/${id}/join/`, data),
  submit: (id, data) => api.post(`/challenges/${id}/submit/`, data),
  myTeams: () => api.get('/challenges/my-teams/'),
  getSubmissions: (id) => api.get(`/challenges/${id}/submissions/`),
  evaluate: (submissionId, data) => api.post(`/challenges/submissions/${submissionId}/evaluate/`, data),
}

// ─── Assessments ──────────────────────────────────────────────────────────────
export const assessmentsAPI = {
  list: () => api.get('/assessments/list/'),
  getQuestions: (id) => api.get(`/assessments/${id}/questions/`),
  submit: (data) => api.post('/assessments/submit/', data),
  myResults: () => api.get('/assessments/my-results/'),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  markRead: (ids) => api.post('/notifications/mark-read/', { ids }),
  markAllRead: () => api.post('/notifications/mark-read/', { ids: [] }),
  clear: () => api.delete('/notifications/clear/'),
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  industryDemand: () => api.get('/analytics/industry-demand/'),
  collegeAnalytics: (college = '') => api.get(`/analytics/college/${college ? `?college=${college}` : ''}`),
  adminDashboard: () => api.get('/analytics/admin/'),
}

// ─── College ──────────────────────────────────────────────────────────────────
export const collegeAPI = {
  getProfile:       ()       => api.get('/colleges/profile/'),
  updateProfile:    (data)   => api.patch('/colleges/profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard:     ()       => api.get('/colleges/dashboard/'),

  // Students
  listStudents:     (search = '') => api.get(`/colleges/students/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  addStudent:       (data)   => api.post('/colleges/students/add/', data),
  sendSuggestion:   (id, message) => api.post(`/colleges/students/${id}/suggest/`, { message }),

  // Notifications
  sendNotification: (data)   => api.post('/colleges/notifications/send/', data),

  // Training
  listTraining:     ()       => api.get('/colleges/training/'),
  createTraining:   (data)   => api.post('/colleges/training/', data),
  enrollTraining:   (id)     => api.post(`/colleges/training/${id}/enroll/`),
}

// ─── Advisor (Acadmissions) ───────────────────────────────────────────────────
export const advisorAPI = {
  getDashboard:        ()         => api.get('/advisors/dashboard/'),
  listApplications:    (params = {}) => api.get('/advisors/applications/', { params }),
  getApplication:      (id)       => api.get(`/advisors/applications/${id}/`),
  updateApplicationStatus: (id, data) => api.patch(`/advisors/applications/${id}/status/`, data),
  listStudents:        (search = '') => api.get(`/advisors/students/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  listDocuments:       ()         => api.get('/advisors/documents/'),
  verifyDocument:      (id)       => api.post(`/advisors/documents/${id}/verify/`),
  getAnalytics:        ()         => api.get('/advisors/analytics/'),
}

export default api
