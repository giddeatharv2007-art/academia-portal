# Academia Portal
### *Bridging Students, Colleges and Industry*

> **"We don't just connect students with jobs. We make students job-ready."**

A production-style full-stack web application built with **React.js + Django REST Framework + PostgreSQL**.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts |
| Backend | Python 3.11, Django 4.2, Django REST Framework |
| Auth | JWT (SimpleJWT) + Email Verification + OTP |
| Database | PostgreSQL |
| Charts | Recharts |
| Speech | Web Speech API (built-in browser) |

---

## 📁 Project Structure

```
academia-portal/
├── backend/                   # Django project
│   ├── config/               # Settings, URLs, WSGI
│   ├── apps/
│   │   ├── accounts/         # Custom User, JWT auth, OTP
│   │   ├── students/         # Profile, Projects, Certs, Internships
│   │   ├── companies/        # Company profile, verification
│   │   ├── colleges/         # College profile, training programs
│   │   ├── jobs/             # Jobs, Internships, Applications
│   │   ├── skills/           # Skills, Student skills, Badges
│   │   ├── matching/         # AI skill matching engine
│   │   ├── assessments/      # Assessments and results
│   │   ├── interviews/       # AI Interview simulator
│   │   ├── challenges/       # Industry challenges
│   │   ├── analytics/        # Industry demand analytics
│   │   ├── notifications/    # Notification system
│   │   └── badges/           # Badge management
│   ├── ai_services/          # AI/ML service layer
│   ├── requirements.txt
│   └── .env
│
├── frontend/                  # React app (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/       # Home, Login, Register
│   │   │   ├── student/      # Student portal pages
│   │   │   ├── company/      # Company portal pages
│   │   │   └── admin/        # Admin/College pages
│   │   ├── components/       # Reusable components
│   │   ├── layouts/          # StudentLayout, CompanyLayout, AdminLayout
│   │   ├── services/         # Axios API layer
│   │   ├── context/          # AuthContext
│   │   └── index.css         # Tailwind + custom styles
│   └── package.json
│
├── passwords.txt             # Demo login credentials
└── README.md
```

---

## ⚡ Quick Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Database Setup (PostgreSQL)

```sql
CREATE DATABASE academia_portal;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE academia_portal TO postgres;
```

---

### 2. Backend Setup

```bash
cd academia-portal/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# Run migrations
python manage.py makemigrations accounts
python manage.py makemigrations students
python manage.py makemigrations companies
python manage.py makemigrations colleges
python manage.py makemigrations jobs
python manage.py makemigrations skills
python manage.py makemigrations assessments
python manage.py makemigrations interviews
python manage.py makemigrations challenges
python manage.py makemigrations notifications
python manage.py makemigrations badges
python manage.py migrate

# Create superadmin
python manage.py create_superadmin

# Seed demo data
python manage.py seed_data

# Start Django server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

API Docs: **http://localhost:8000/api/docs/**

---

### 3. Frontend Setup

```bash
cd academia-portal/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

See `passwords.txt` for full list. Quick reference:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@academiaportal.in | Admin@123 |
| College (SKN Pandharpur) | admin@sknpandharpur.edu.in | College@123 |
| College (SKN Pune) | admin@sknpune.edu.in | College@123 |
| Company (TechWave) | hr@techwave.in | Company@123 |
| Student (Arjun) | arjun.sharma@student.in | Student@123 |
| Student (Priya) | priya.patil@student.in | Student@123 |

---

## 🎯 Key Features

### For Students
| Feature | Description |
|---------|-------------|
| **Verified Skill Passport** | College/assessment-verified skills with evidence types |
| **AI Skill Matching** | Explainable match score with skill-by-skill breakdown |
| **Skill Gap Analysis** | Current vs potential readiness for target roles |
| **Learning Roadmap** | Personalized step-by-step learning path |
| **AI Interview Simulator** | Speech-to-speech interview with real-time evaluation |
| **Industry Challenges** | Solve real company problems → internship/job offers |
| **Badge System** | Gamified achievement badges |
| **Rejection Analysis** | Understand rejections and find better-matching companies |

### For Companies
| Feature | Description |
|---------|-------------|
| **Post Jobs & Internships** | Rich job/internship posting with skill requirements |
| **Reverse Mapping** | Find students by required skills with priority ranking |
| **AI Candidate Ranking** | Multi-factor scoring beyond just skill percentage |
| **Industry Challenges** | Post real problems → discover talent |
| **Application Management** | Update status → auto-notify students |

### For Colleges
| Feature | Description |
|---------|-------------|
| **Industry Demand Analytics** | Real-time skill demand vs student availability |
| **Skill Gap Alerts** | Identify critical gaps (e.g. AWS demand 52%, availability 15%) |
| **Training Programs** | Create targeted programs based on gap data |
| **Education Verification** | Verify student certificates → adds to Skill Passport |
| **Placement Tracking** | Dashboard with placement rates and analytics |

---

## 🔌 API Reference

Base URL: `http://localhost:8000/api/`

### Auth
```
POST /api/auth/register/student/
POST /api/auth/register/company/
POST /api/auth/login/
POST /api/auth/verify-email/
POST /api/auth/verify-otp/
POST /api/auth/refresh/
```

### Core APIs
```
GET  /api/students/profile/
PUT  /api/students/profile/
GET  /api/skills/passport/
GET  /api/matching/jobs/
GET  /api/matching/internships/
GET  /api/matching/skill-gap/
GET  /api/matching/roadmap/
GET  /api/matching/students/           # Company reverse mapping
POST /api/interviews/start/
POST /api/interviews/answer/
POST /api/interviews/complete/
GET  /api/analytics/industry-demand/
POST /api/companies/admin/{id}/approve/
```

Full interactive docs: **http://localhost:8000/api/docs/**

---

## 🗺️ Demo Flow (Complete Scenario)

1. **Register** as student → verify email
2. **Complete profile** → add Python, SQL, Django, React skills
3. **Upload project** and certification
4. **College verifies** profile → Education Verified ✓
5. **Student gets** Verified Skill Passport
6. **Company posts** "Python Developer Internship" (requires Python, Django, SQL, REST API, Git)
7. **System calculates** 78% Match — shows matched/missing skills with explanation
8. **Student sees** "Learn REST API" recommendation
9. **Student follows** Learning Roadmap
10. **Student takes** technical Assessment → passes → Skill Passport updated
11. **Student starts** AI Interview → speech-to-speech → gets 78/100
12. **Company searches** for candidates → sees student ranked by composite score
13. **Company shortlists** student → student gets notification
14. **If rejected** → system shows rejection analysis + recommends better-matched companies
15. **College sees** AWS demand 52% vs availability 15% → creates AWS training
16. **Students complete** training → certificates → Skill Passport updated

---

## 🔒 Security

- JWT authentication with refresh token rotation
- Password hashing (PBKDF2 + SHA256)
- Role-based access control (student/company/college/admin)
- CORS configured for frontend origin
- File type validation on uploads
- Environment variables for all secrets
- API rate limiting

---

## 📊 Database Models (25+)

User, StudentProfile, EducationCertificate, Project, Certification, InternshipExperience, CollegeProfile, TrainingProgram, TrainingEnrollment, CompanyProfile, CompanyRequiredSkill, CompanyVerification, Skill, StudentSkill, Badge, StudentBadge, Job, Internship, Application, CompanyFeedback, AIInterview, InterviewQuestion, InterviewAnswer, Assessment, AssessmentQuestion, AssessmentResult, IndustryChallenge, ChallengeTeam, ChallengeSubmission, Notification, SkillGap

---

## 🚀 Production Deployment

For production:
1. Set `DEBUG=False` in `.env`
2. Configure `ALLOWED_HOSTS` with your domain
3. Use `gunicorn` for Django: `gunicorn config.wsgi:application`
4. Build React: `npm run build`
5. Serve static files with Nginx/WhiteNoise
6. Use a managed PostgreSQL service

---

## 📧 Email Configuration

The platform uses Gmail SMTP for:
- Email verification links (students/colleges)
- OTP verification (companies)
- Company approval/rejection notifications

Configure in `.env`:
```
EMAIL_HOST_USER=edunexus45@gmail.com
EMAIL_HOST_PASSWORD=Pass@123
```

> For Gmail, enable "Less Secure Apps" or use an App Password.

---

*Built for EduNexus — Academia Portal 2024*
