"""
Seed Demo Data Management Command
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with realistic demo data for Academia Portal'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Seeding Academia Portal demo data...'))

        self._create_superadmin()
        self._create_skills()
        self._create_badges()
        self._create_colleges()
        self._create_companies()
        self._create_students()
        self._create_jobs_internships()
        self._create_challenges()
        self._create_assessments()
        self._create_applications()

        self.stdout.write(self.style.SUCCESS('✅ Demo data seeded successfully!'))
        self.stdout.write(self.style.WARNING('See passwords.txt for login credentials.'))

    def _create_superadmin(self):
        email = 'admin@edunexus.in'
        password = 'Admin@123'
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_email_verified': True,
                'is_active': True,
            }
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(f'  Created superadmin: {email}')
        else:
            self.stdout.write(f'  Superadmin already exists: {email}')

    def _create_skills(self):
        from apps.skills.models import Skill
        skills_data = [
            ('Python', 'language'), ('JavaScript', 'language'), ('Java', 'language'),
            ('C++', 'language'), ('TypeScript', 'language'), ('SQL', 'database'),
            ('PostgreSQL', 'database'), ('MySQL', 'database'), ('MongoDB', 'database'),
            ('Redis', 'database'), ('Django', 'framework'), ('React', 'framework'),
            ('Node.js', 'framework'), ('Flask', 'framework'), ('FastAPI', 'framework'),
            ('Vue.js', 'framework'), ('Angular', 'framework'), ('Spring Boot', 'framework'),
            ('Docker', 'tool'), ('Git', 'tool'), ('Linux', 'tool'), ('Kubernetes', 'tool'),
            ('Postman', 'tool'), ('Figma', 'tool'), ('Jira', 'tool'),
            ('AWS', 'cloud'), ('Azure', 'cloud'), ('Google Cloud', 'cloud'),
            ('Machine Learning', 'ai_ml'), ('Deep Learning', 'ai_ml'),
            ('TensorFlow', 'ai_ml'), ('PyTorch', 'ai_ml'), ('NLP', 'ai_ml'),
            ('Data Analysis', 'technical'), ('REST API', 'technical'),
            ('CI/CD', 'technical'), ('Microservices', 'technical'),
            ('Communication', 'soft'), ('Problem Solving', 'soft'),
            ('Teamwork', 'soft'), ('Leadership', 'soft'), ('Time Management', 'soft'),
            ('HTML', 'technical'), ('CSS', 'technical'), ('Tailwind CSS', 'framework'),
        ]
        for name, cat in skills_data:
            Skill.objects.get_or_create(name=name, defaults={'category': cat})
        self.stdout.write(f'  Created {len(skills_data)} skills')

    def _create_badges(self):
        from apps.skills.models import Badge
        badges_data = [
            ('Python Certified', '🏅', 'skill', 'Pass the Python assessment with 85%+'),
            ('Problem Solver', '🧠', 'achievement', 'Complete 5 problem-solving assessments'),
            ('Industry Ready', '🚀', 'industry', 'Complete profile, AI interview, pass assessment, have a project, verify education'),
            ('Internship Completed', '💼', 'internship', 'Complete at least one verified internship'),
            ('Verified Developer', '✅', 'skill', 'Have 3 or more verified skills'),
            ('Top Project', '🌟', 'project', 'Have a featured project with GitHub link'),
            ('Communication Pro', '🗣️', 'communication', 'Score 80+ in AI interview communication'),
            ('AI/ML Explorer', '🤖', 'skill', 'Add 3 AI/ML skills to your skill passport'),
            ('Full Stack', '⚡', 'skill', 'Have both frontend and backend skills verified'),
            ('Open Source Contributor', '🐙', 'achievement', 'Link a public GitHub repository'),
        ]
        for name, icon, cat, desc in badges_data:
            Badge.objects.get_or_create(
                name=name,
                defaults={'icon': icon, 'category': cat, 'description': desc, 'requirements': [desc], 'points': 15}
            )
        self.stdout.write(f'  Created {len(badges_data)} badges')

    def _create_colleges(self):
        from apps.colleges.models import CollegeProfile

        colleges = [
            {
                'email': 'admin@sknpandharpur.edu.in',
                'password': 'College@123',
                'name': 'SKN College of Engineering, Pandharpur',
                'location': 'Pandharpur, Maharashtra',
                'affiliation': 'Solapur University',
                'admin_name': 'Dr. Rajesh Patil',
                'contact_email': 'admin@sknpandharpur.edu.in',
                'contact_phone': '+91-9876543210',
                'established_year': 1983,
                'website': 'https://sknpandharpur.edu.in',
                'about': 'SKN College of Engineering, Pandharpur is a premier engineering institution affiliated to Solapur University.',
            },
            {
                'email': 'admin@sknpune.edu.in',
                'password': 'College@123',
                'name': 'SKN Sinhgad College of Engineering, Pune',
                'location': 'Pune, Maharashtra',
                'affiliation': 'Pune University',
                'admin_name': 'Dr. Priya Sharma',
                'contact_email': 'admin@sknpune.edu.in',
                'contact_phone': '+91-9876543220',
                'established_year': 1995,
                'website': 'https://sknpune.edu.in',
                'about': 'SKN Sinhgad College of Engineering, Pune is an autonomous institute affiliated to Savitribai Phule Pune University.',
            },
        ]

        for c in colleges:
            user, created = User.objects.get_or_create(
                email=c['email'],
                defaults={'role': 'college', 'is_email_verified': True, 'is_active': True}
            )
            if created:
                user.set_password(c['password'])
                user.save()
            CollegeProfile.objects.get_or_create(
                user=user,
                defaults={
                    'name': c['name'],
                    'location': c['location'],
                    'affiliation': c['affiliation'],
                    'admin_name': c['admin_name'],
                    'contact_email': c['contact_email'],
                    'contact_phone': c['contact_phone'],
                    'established_year': c['established_year'],
                    'website': c['website'],
                    'about': c['about'],
                }
            )
        self.stdout.write(f'  Created {len(colleges)} colleges')

    def _create_companies(self):
        from apps.companies.models import CompanyProfile, CompanyRequiredSkill
        from apps.skills.models import Skill

        companies_data = [
            {
                'email': 'company1@gmail.com', 'password': 'Company@123',
                'name': 'TechWave Solutions', 'domain': 'it',
                'location': 'Pune, Maharashtra', 'about': 'Leading IT solutions provider specializing in enterprise software development.',
                'website': 'https://techwave.example.com', 'est_year': 2015,
                'skills': ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
                'hiring': 'both',
                'contact_name': 'Ravi Kulkarni',
                'contact_designation': 'HR Manager',
                'contact_phone': '+91-9876501001',
            },
            {
                'email': 'company2@gmail.com', 'password': 'Company@123',
                'name': 'DataBridge Analytics', 'domain': 'ai',
                'location': 'Bangalore, Karnataka', 'about': 'AI-driven analytics platform helping businesses make data-driven decisions.',
                'website': 'https://databridge.example.com', 'est_year': 2018,
                'skills': ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Data Analysis'],
                'hiring': 'both',
                'contact_name': 'Sneha Mehta',
                'contact_designation': 'Talent Acquisition Lead',
                'contact_phone': '+91-9876501002',
            },
            {
                'email': 'company3@gmail.com', 'password': 'Company@123',
                'name': 'CloudNexus Technologies', 'domain': 'it',
                'location': 'Mumbai, Maharashtra', 'about': 'Cloud-native solutions and DevOps consulting firm.',
                'website': 'https://cloudnexus.example.com', 'est_year': 2019,
                'skills': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Python'],
                'hiring': 'job',
                'contact_name': 'Arjun Patil',
                'contact_designation': 'Technical Recruiter',
                'contact_phone': '+91-9876501003',
            },
            {
                'email': 'company4@gmail.com', 'password': 'Company@123',
                'name': 'FinEdge Systems', 'domain': 'finance',
                'location': 'Hyderabad, Telangana', 'about': 'Fintech startup revolutionizing digital payments and banking.',
                'website': 'https://finedge.example.com', 'est_year': 2020,
                'skills': ['Java', 'Spring Boot', 'SQL', 'React', 'REST API'],
                'hiring': 'both',
                'contact_name': 'Pooja Desai',
                'contact_designation': 'HR Executive',
                'contact_phone': '+91-9876501004',
            },
            {
                'email': 'company5@gmail.com', 'password': 'Company@123',
                'name': 'EduLearn Platform', 'domain': 'edtech',
                'location': 'Pune, Maharashtra', 'about': 'EdTech platform providing personalized learning experiences.',
                'website': 'https://edulearn.example.com', 'est_year': 2021,
                'skills': ['React', 'Node.js', 'MongoDB', 'Python', 'Machine Learning'],
                'hiring': 'internship',
                'contact_name': 'Vikash Joshi',
                'contact_designation': 'Campus Relations Manager',
                'contact_phone': '+91-9876501005',
            },
        ]

        for c in companies_data:
            user, created = User.objects.get_or_create(
                email=c['email'],
                defaults={'role': 'company', 'is_email_verified': True, 'is_active': True}
            )
            if created:
                user.set_password(c['password'])
                user.save()

            company, _ = CompanyProfile.objects.get_or_create(
                user=user,
                defaults={
                    'name': c['name'],
                    'domain': c['domain'],
                    'location': c['location'],
                    'about': c['about'],
                    'website': c['website'],
                    'established_year': c['est_year'],
                    'is_verified': True,
                    'verification_status': 'approved',
                    'target_hiring': c['hiring'],
                    'contact_person_name': c['contact_name'],
                    'contact_person_designation': c['contact_designation'],
                    'contact_person_email': c['email'],
                    'contact_person_phone': c['contact_phone'],
                }
            )

            # Assign required skills
            for skill_name in c['skills']:
                skill = Skill.objects.filter(name=skill_name).first()
                if skill:
                    CompanyRequiredSkill.objects.get_or_create(
                        company=company, skill=skill,
                        defaults={'priority': 'required'}
                    )
        self.stdout.write(f'  Created {len(companies_data)} companies')

    def _create_students(self):
        from apps.students.models import StudentProfile, Project, Certification, InternshipExperience
        from apps.skills.models import Skill, StudentSkill, StudentBadge, Badge

        students_data = [
            # ── Real students (primary demo accounts) ──────────────────────
            {
                'email': 'ajaymali0885@gmail.com', 'password': 'Student@123',
                'name': 'Ajay Mali', 'college': 'SKN College of Engineering, Pandharpur',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 3,
                'grad_year': 2026, 'cgpa': 8.5, 'city': 'Pandharpur', 'state': 'Maharashtra',
                'skills': [('Python', 85), ('Django', 78), ('SQL', 72), ('React', 65), ('Git', 80)],
                'career': 'Backend Developer',
                'github': 'https://github.com/ajaymali0885',
                'mobile': '+91-9000000001',
            },
            {
                'email': 'atharvgidde2007@gmail.com', 'password': 'Student@123',
                'name': 'Atharv Gidde', 'college': 'SKN College of Engineering, Pandharpur',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 3,
                'grad_year': 2026, 'cgpa': 9.1, 'city': 'Pandharpur', 'state': 'Maharashtra',
                'skills': [('Python', 90), ('Machine Learning', 80), ('SQL', 85), ('TensorFlow', 70), ('Data Analysis', 75)],
                'career': 'Data Scientist',
                'github': 'https://github.com/atharvgidde2007',
                'mobile': '+91-9000000002',
            },
            {
                'email': 'shreyashkashid@gmail.com', 'password': 'Student@123',
                'name': 'Shreyash Kashid', 'college': 'SKN Sinhgad College of Engineering, Pune',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 3,
                'grad_year': 2026, 'cgpa': 7.8, 'city': 'Pune', 'state': 'Maharashtra',
                'skills': [('React', 82), ('JavaScript', 80), ('HTML', 90), ('CSS', 85), ('Node.js', 60)],
                'career': 'Frontend Developer',
                'github': 'https://github.com/shreyashkashid',
                'mobile': '+91-9000000003',
            },
            {
                'email': 'prathmesh07@gmail.com', 'password': 'Student@123',
                'name': 'Prathmesh Patil', 'college': 'SKN Sinhgad College of Engineering, Pune',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 3,
                'grad_year': 2026, 'cgpa': 8.2, 'city': 'Pune', 'state': 'Maharashtra',
                'skills': [('Python', 75), ('Machine Learning', 65), ('Deep Learning', 60), ('NLP', 55)],
                'career': 'AI/ML Engineer',
                'github': 'https://github.com/prathmesh07',
                'mobile': '+91-9000000004',
            },
            # ── Additional demo students ────────────────────────────────────
            {
                'email': 'amit.joshi@student.in', 'password': 'Student@123',
                'name': 'Amit Joshi', 'college': 'SKN College of Engineering, Pandharpur',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 2,
                'grad_year': 2027, 'cgpa': 7.2, 'city': 'Nashik', 'state': 'Maharashtra',
                'skills': [('Python', 60), ('SQL', 55), ('HTML', 70), ('CSS', 65)],
                'career': 'Web Developer',
                'github': 'https://github.com/amitjoshi',
                'mobile': '+91-9000000005',
            },
            {
                'email': 'kavya.nair@student.in', 'password': 'Student@123',
                'name': 'Kavya Nair', 'college': 'SKN Sinhgad College of Engineering, Pune',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 4,
                'grad_year': 2025, 'cgpa': 8.8, 'city': 'Pune', 'state': 'Maharashtra',
                'skills': [('Java', 85), ('Spring Boot', 78), ('SQL', 80), ('REST API', 72), ('Git', 85)],
                'career': 'Backend Developer',
                'github': 'https://github.com/kavyanair',
                'mobile': '+91-9000000006',
            },
            {
                'email': 'rohan.mehta@student.in', 'password': 'Student@123',
                'name': 'Rohan Mehta', 'college': 'SKN College of Engineering, Pandharpur',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 3,
                'grad_year': 2026, 'cgpa': 8.0, 'city': 'Mumbai', 'state': 'Maharashtra',
                'skills': [('Python', 78), ('Django', 72), ('React', 70), ('PostgreSQL', 68), ('Docker', 55)],
                'career': 'Full Stack Developer',
                'github': 'https://github.com/rohanmehta',
                'mobile': '+91-9000000007',
            },
            {
                'email': 'ananya.singh@student.in', 'password': 'Student@123',
                'name': 'Ananya Singh', 'college': 'SKN Sinhgad College of Engineering, Pune',
                'degree': 'B.Tech', 'branch': 'Data Science', 'year': 3,
                'grad_year': 2026, 'cgpa': 8.6, 'city': 'Pune', 'state': 'Maharashtra',
                'skills': [('Python', 88), ('SQL', 84), ('Machine Learning', 79), ('Data Analysis', 82), ('TensorFlow', 65)],
                'career': 'Data Analyst',
                'github': 'https://github.com/ananyasingh',
                'mobile': '+91-9000000008',
            },
            {
                'email': 'vikram.rao@student.in', 'password': 'Student@123',
                'name': 'Vikram Rao', 'college': 'SKN College of Engineering, Pandharpur',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 4,
                'grad_year': 2025, 'cgpa': 7.5, 'city': 'Pandharpur', 'state': 'Maharashtra',
                'skills': [('AWS', 70), ('Docker', 75), ('Linux', 80), ('Python', 65), ('CI/CD', 60)],
                'career': 'DevOps Engineer',
                'github': 'https://github.com/vikramrao',
                'mobile': '+91-9000000009',
            },
            {
                'email': 'meera.gupta@student.in', 'password': 'Student@123',
                'name': 'Meera Gupta', 'college': 'SKN Sinhgad College of Engineering, Pune',
                'degree': 'B.Tech', 'branch': 'Computer Science', 'year': 2,
                'grad_year': 2027, 'cgpa': 7.9, 'city': 'Pune', 'state': 'Maharashtra',
                'skills': [('Python', 70), ('HTML', 80), ('CSS', 78), ('JavaScript', 65), ('React', 55)],
                'career': 'Frontend Developer',
                'github': 'https://github.com/meeragupta',
                'mobile': '+91-9000000010',
            },
        ]

        for s in students_data:
            user, created = User.objects.get_or_create(
                email=s['email'],
                defaults={'role': 'student', 'is_email_verified': True, 'is_active': True}
            )
            if created:
                user.set_password(s['password'])
                user.save()

            profile, _ = StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    'full_name': s['name'],
                    'mobile': s.get('mobile', ''),
                    'college_name': s['college'],
                    'degree': s['degree'],
                    'branch': s['branch'],
                    'current_year': s['year'],
                    'graduation_year': s['grad_year'],
                    'cgpa': s['cgpa'],
                    'city': s['city'],
                    'state': s['state'],
                    'career_goal': s['career'],
                    'github_url': s['github'],
                    'linkedin_url': f'https://linkedin.com/in/{s["name"].lower().replace(" ", "")}',
                    'job_readiness_score': random.uniform(55, 85),
                    'profile_completion': random.uniform(70, 95),
                }
            )

            # Add skills
            for skill_name, proficiency in s['skills']:
                skill = Skill.objects.filter(name=skill_name).first()
                if skill:
                    StudentSkill.objects.get_or_create(
                        student=profile, skill=skill,
                        defaults={
                            'proficiency': proficiency,
                            'is_verified': random.choice([True, False]),
                            'evidence_types': ['self', 'project'],
                        }
                    )

            # Add sample project
            Project.objects.get_or_create(
                student=profile,
                name=f'{s["career"]} Portfolio Project',
                defaults={
                    'description': f'A comprehensive project demonstrating {s["career"]} skills using modern technologies.',
                    'technologies': [skill[0] for skill in s['skills'][:3]],
                    'github_url': s['github'],
                    'role': 'Developer',
                }
            )

            # Add a certification for senior students
            if s['year'] >= 3:
                Certification.objects.get_or_create(
                    student=profile,
                    name=f'{s["skills"][0][0]} Developer Certification',
                    defaults={
                        'issuing_organization': 'Coursera',
                        'issue_date': date(2023, 6, 1),
                        'status': 'verified',
                    }
                )

        self.stdout.write(f'  Created {len(students_data)} students')

    def _create_jobs_internships(self):
        from apps.companies.models import CompanyProfile
        from apps.jobs.models import Job, Internship
        from apps.skills.models import Skill

        company_map = {c.name: c for c in CompanyProfile.objects.all()}

        jobs_data = [
            {
                'company': 'TechWave Solutions',
                'title': 'Python Backend Developer',
                'description': 'Join our backend team to build scalable APIs and microservices using Python and Django.',
                'type': 'full_time', 'location': 'Pune', 'mode': 'hybrid',
                'salary_min': 600000, 'salary_max': 900000, 'exp': 0,
                'skills': ['Python', 'Django', 'PostgreSQL', 'REST API', 'Git'],
                'openings': 3,
            },
            {
                'company': 'DataBridge Analytics',
                'title': 'Data Scientist',
                'description': 'Work with large datasets to build ML models and drive business insights.',
                'type': 'full_time', 'location': 'Bangalore', 'mode': 'remote',
                'salary_min': 700000, 'salary_max': 1200000, 'exp': 0,
                'skills': ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
                'openings': 2,
            },
            {
                'company': 'CloudNexus Technologies',
                'title': 'DevOps Engineer',
                'description': 'Manage cloud infrastructure, CI/CD pipelines, and containerized deployments.',
                'type': 'full_time', 'location': 'Mumbai', 'mode': 'onsite',
                'salary_min': 800000, 'salary_max': 1300000, 'exp': 1,
                'skills': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
                'openings': 2,
            },
            {
                'company': 'FinEdge Systems',
                'title': 'Full Stack Developer',
                'description': 'Build and maintain full-stack fintech applications.',
                'type': 'full_time', 'location': 'Hyderabad', 'mode': 'hybrid',
                'salary_min': 650000, 'salary_max': 1000000, 'exp': 0,
                'skills': ['Java', 'Spring Boot', 'React', 'SQL'],
                'openings': 4,
            },
            {
                'company': 'TechWave Solutions',
                'title': 'React Frontend Developer',
                'description': 'Build modern, responsive web applications using React and TypeScript.',
                'type': 'full_time', 'location': 'Pune', 'mode': 'hybrid',
                'salary_min': 550000, 'salary_max': 850000, 'exp': 0,
                'skills': ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
                'openings': 2,
            },
        ]

        internships_data = [
            {
                'company': 'TechWave Solutions',
                'title': 'Python Developer Internship',
                'description': 'Gain hands-on experience building REST APIs and working with Django framework.',
                'duration': 3, 'location': 'Pune', 'mode': 'hybrid',
                'stipend_min': 8000, 'stipend_max': 12000,
                'skills': ['Python', 'Django', 'SQL', 'REST API', 'Git'],
                'openings': 5,
            },
            {
                'company': 'DataBridge Analytics',
                'title': 'Machine Learning Intern',
                'description': 'Work on real-world ML projects under senior data scientists.',
                'duration': 6, 'location': 'Bangalore', 'mode': 'remote',
                'stipend_min': 10000, 'stipend_max': 15000,
                'skills': ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
                'openings': 3,
            },
            {
                'company': 'EduLearn Platform',
                'title': 'React Frontend Internship',
                'description': 'Build interactive learning interfaces using React and modern CSS frameworks.',
                'duration': 3, 'location': 'Pune', 'mode': 'hybrid',
                'stipend_min': 6000, 'stipend_max': 10000,
                'skills': ['React', 'JavaScript', 'HTML', 'CSS'],
                'openings': 4,
            },
            {
                'company': 'FinEdge Systems',
                'title': 'Backend Development Intern',
                'description': 'Work on microservices and APIs for our digital banking platform.',
                'duration': 4, 'location': 'Hyderabad', 'mode': 'onsite',
                'stipend_min': 12000, 'stipend_max': 18000,
                'skills': ['Java', 'Spring Boot', 'SQL', 'REST API'],
                'openings': 3,
            },
            {
                'company': 'CloudNexus Technologies',
                'title': 'Cloud & DevOps Internship',
                'description': 'Learn and implement cloud infrastructure using AWS and containerization.',
                'duration': 6, 'location': 'Mumbai', 'mode': 'hybrid',
                'stipend_min': 10000, 'stipend_max': 14000,
                'skills': ['AWS', 'Docker', 'Linux', 'Python'],
                'openings': 2,
            },
            {
                'company': 'TechWave Solutions',
                'title': 'Data Analytics Internship',
                'description': 'Analyze business data and create dashboards using Python and SQL.',
                'duration': 3, 'location': 'Pune', 'mode': 'remote',
                'stipend_min': 7000, 'stipend_max': 10000,
                'skills': ['Python', 'SQL', 'Data Analysis'],
                'openings': 3,
            },
        ]

        for j in jobs_data:
            company = company_map.get(j['company'])
            if not company:
                continue
            job, created = Job.objects.get_or_create(
                company=company, title=j['title'],
                defaults={
                    'description': j['description'],
                    'job_type': j['type'],
                    'location': j['location'],
                    'work_mode': j['mode'],
                    'salary_min': j['salary_min'],
                    'salary_max': j['salary_max'],
                    'experience_min': j['exp'],
                    'openings': j['openings'],
                    'deadline': date.today() + timedelta(days=30),
                    'is_active': True,
                }
            )
            if created:
                for skill_name in j['skills']:
                    skill = Skill.objects.filter(name=skill_name).first()
                    if skill:
                        job.required_skills.add(skill)

        for i in internships_data:
            company = company_map.get(i['company'])
            if not company:
                continue
            internship, created = Internship.objects.get_or_create(
                company=company, title=i['title'],
                defaults={
                    'description': i['description'],
                    'duration_months': i['duration'],
                    'location': i['location'],
                    'work_mode': i['mode'],
                    'stipend_min': i['stipend_min'],
                    'stipend_max': i['stipend_max'],
                    'openings': i['openings'],
                    'deadline': date.today() + timedelta(days=30),
                    'is_active': True,
                }
            )
            if created:
                for skill_name in i['skills']:
                    skill = Skill.objects.filter(name=skill_name).first()
                    if skill:
                        internship.required_skills.add(skill)

        self.stdout.write(f'  Created {len(jobs_data)} jobs and {len(internships_data)} internships')

    def _create_challenges(self):
        from apps.companies.models import CompanyProfile
        from apps.challenges.models import IndustryChallenge
        from apps.skills.models import Skill

        challenges_data = [
            {
                'company': 'TechWave Solutions',
                'title': 'Build an AI-Powered Attendance System',
                'description': 'Design and implement an automated attendance tracking system using computer vision and facial recognition.',
                'problem': 'Our company needs a contactless attendance system for 500+ employees that works in real-time.',
                'skills': ['Python', 'Machine Learning', 'Deep Learning'],
                'outcome': 'Top 3 teams get internship offers',
                'deadline_days': 30,
            },
            {
                'company': 'DataBridge Analytics',
                'title': 'Predictive Analytics Dashboard',
                'description': 'Build a real-time analytics dashboard that predicts customer churn using ML models.',
                'problem': 'We need to identify customers likely to churn 30 days in advance with >80% accuracy.',
                'skills': ['Python', 'Machine Learning', 'SQL', 'Data Analysis'],
                'outcome': 'Winner gets a 6-month paid internship',
                'deadline_days': 45,
            },
            {
                'company': 'FinEdge Systems',
                'title': 'Smart Expense Tracker API',
                'description': 'Create a RESTful API for an intelligent expense tracking application with ML-based categorization.',
                'problem': 'Build a backend API that automatically categorizes transactions and detects unusual spending patterns.',
                'skills': ['Python', 'Django', 'SQL', 'Machine Learning', 'REST API'],
                'outcome': 'Potential full-time job offer for best submission',
                'deadline_days': 21,
            },
        ]

        for c in challenges_data:
            company = CompanyProfile.objects.filter(name=c['company']).first()
            if not company:
                continue
            challenge, created = IndustryChallenge.objects.get_or_create(
                company=company, title=c['title'],
                defaults={
                    'description': c['description'],
                    'problem_statement': c['problem'],
                    'deadline': date.today() + timedelta(days=c['deadline_days']),
                    'team_size_min': 1,
                    'team_size_max': 3,
                    'submission_requirements': 'GitHub repository, README, demo video (optional)',
                    'possible_outcome': c['outcome'],
                    'status': 'active',
                }
            )
            if created:
                for skill_name in c['skills']:
                    skill = Skill.objects.filter(name=skill_name).first()
                    if skill:
                        challenge.required_skills.add(skill)

        self.stdout.write(f'  Created {len(challenges_data)} industry challenges')

    def _create_assessments(self):
        from apps.assessments.models import Assessment, AssessmentQuestion
        from apps.skills.models import Skill

        python_skill = Skill.objects.filter(name='Python').first()
        django_skill = Skill.objects.filter(name='Django').first()
        sql_skill = Skill.objects.filter(name='SQL').first()
        ml_skill = Skill.objects.filter(name='Machine Learning').first()

        assessments_data = [
            {
                'skill': python_skill, 'title': 'Python Fundamentals Assessment',
                'difficulty': 'intermediate', 'questions': [
                    ("What is the output of print(type([]))?", ['mcq'], ["<class 'list'>", "<class 'array'>", "list", "None"], "<class 'list'>"),
                    ("Which keyword is used to define a function in Python?", ['mcq'], ["func", "def", "define", "function"], "def"),
                    ("What does len('Hello') return?", ['mcq'], ["4", "5", "6", "Hello"], "5"),
                    ("What is a list comprehension in Python?", ['mcq'], ["A loop inside a list", "A concise way to create lists", "A sorting method", "A class method"], "A concise way to create lists"),
                    ("What does the 'pass' statement do?", ['mcq'], ["Exits the program", "Does nothing", "Prints nothing", "Skips a loop"], "Does nothing"),
                ]
            },
            {
                'skill': sql_skill, 'title': 'SQL Fundamentals Assessment',
                'difficulty': 'beginner', 'questions': [
                    ("Which SQL command is used to retrieve data?", ['mcq'], ["GET", "SELECT", "FETCH", "RETRIEVE"], "SELECT"),
                    ("What does JOIN do in SQL?", ['mcq'], ["Combines rows from two or more tables", "Deletes duplicate rows", "Creates a new table", "Sorts data"], "Combines rows from two or more tables"),
                    ("What is the correct SQL syntax to select all columns?", ['mcq'], ["SELECT * FROM table", "SELECT ALL FROM table", "GET * FROM table", "FETCH * FROM table"], "SELECT * FROM table"),
                    ("Which clause filters records in SQL?", ['mcq'], ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], "WHERE"),
                    ("What does COUNT(*) do?", ['mcq'], ["Counts all rows", "Counts unique rows", "Sums values", "Finds maximum"], "Counts all rows"),
                ]
            },
        ]

        for a_data in assessments_data:
            if not a_data['skill']:
                continue
            assessment, created = Assessment.objects.get_or_create(
                title=a_data['title'],
                defaults={
                    'skill': a_data['skill'],
                    'difficulty': a_data['difficulty'],
                    'total_questions': len(a_data['questions']),
                    'passing_score': 60,
                }
            )
            if created:
                for i, (q_text, q_type, options, answer) in enumerate(a_data['questions']):
                    AssessmentQuestion.objects.create(
                        assessment=assessment,
                        question_text=q_text,
                        question_type='mcq',
                        options=options,
                        correct_answer=answer,
                        order=i + 1,
                    )

        self.stdout.write(f'  Created {len(assessments_data)} assessments')

    def _create_applications(self):
        from apps.students.models import StudentProfile
        from apps.jobs.models import Job, Internship, Application

        students = list(StudentProfile.objects.all()[:5])
        internships = list(Internship.objects.all()[:4])
        jobs = list(Job.objects.all()[:3])

        statuses = ['applied', 'under_review', 'shortlisted', 'applied', 'rejected']

        for i, student in enumerate(students):
            if internships:
                internship = internships[i % len(internships)]
                Application.objects.get_or_create(
                    student=student, internship=internship,
                    defaults={
                        'status': statuses[i % len(statuses)],
                        'match_score': random.uniform(60, 95),
                        'cover_letter': f'I am excited to apply for the {internship.title} position.',
                    }
                )
            if jobs:
                job = jobs[i % len(jobs)]
                Application.objects.get_or_create(
                    student=student, job=job,
                    defaults={
                        'status': statuses[(i + 2) % len(statuses)],
                        'match_score': random.uniform(55, 90),
                    }
                )

        self.stdout.write(f'  Created sample applications')
