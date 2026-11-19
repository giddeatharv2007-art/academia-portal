"""
Matching Views - Skill matching, reverse mapping, gap analysis, roadmap
"""
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.permissions import IsStudent, IsCompany
from apps.students.models import StudentProfile
from apps.companies.models import CompanyProfile
from apps.jobs.models import Job, Internship
from apps.skills.models import StudentSkill

from .engine import (
    calculate_skill_match,
    calculate_skill_gap,
    generate_learning_roadmap,
    get_suggested_certifications,
    rank_candidates,
)


def _get_student_skills(profile):
    """Get student skills as list of dicts."""
    skills = StudentSkill.objects.filter(student=profile).select_related('skill')
    return [
        {
            'name': s.skill.name,
            'proficiency': s.proficiency,
            'is_verified': s.is_verified,
            'category': s.skill.category,
        }
        for s in skills
    ]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_jobs(request):
    """Return jobs sorted by match score for the current student."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    student_skills = _get_student_skills(profile)

    jobs = Job.objects.filter(is_active=True).prefetch_related('required_skills', 'company')
    results = []

    for job in jobs:
        required = [s.name for s in job.required_skills.all()]
        preferred = []
        match = calculate_skill_match(student_skills, required, preferred)
        results.append({
            'job_id': str(job.id),
            'title': job.title,
            'company_name': job.company.name,
            'company_id': str(job.company.id),
            'company_logo': job.company.logo.url if job.company.logo else None,
            'location': job.location,
            'work_mode': job.work_mode,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'deadline': job.deadline,
            'required_skills': required,
            **match,
        })

    # Sort by match_score descending
    results.sort(key=lambda x: x['match_score'], reverse=True)
    return Response({'count': len(results), 'results': results})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_internships(request):
    """Return internships sorted by match score for the current student."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    student_skills = _get_student_skills(profile)

    internships = Internship.objects.filter(is_active=True).prefetch_related('required_skills', 'company')
    results = []

    for internship in internships:
        required = [s.name for s in internship.required_skills.all()]
        match = calculate_skill_match(student_skills, required)
        results.append({
            'internship_id': str(internship.id),
            'title': internship.title,
            'company_name': internship.company.name,
            'company_id': str(internship.company.id),
            'company_logo': internship.company.logo.url if internship.company.logo else None,
            'location': internship.location,
            'work_mode': internship.work_mode,
            'stipend_min': internship.stipend_min,
            'stipend_max': internship.stipend_max,
            'duration_months': internship.duration_months,
            'deadline': internship.deadline,
            'required_skills': required,
            **match,
        })

    results.sort(key=lambda x: x['match_score'], reverse=True)
    return Response({'count': len(results), 'results': results})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_for_job(request, job_id):
    """Get match details for a specific job."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    job = get_object_or_404(Job, id=job_id)
    student_skills = _get_student_skills(profile)
    required = [s.name for s in job.required_skills.all()]
    preferred = [s.name for s in job.preferred_skills.all()]
    match = calculate_skill_match(student_skills, required, preferred)
    return Response({
        'job_id': str(job.id),
        'title': job.title,
        **match,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_for_internship(request, internship_id):
    """Get match details for a specific internship."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    internship = get_object_or_404(Internship, id=internship_id)
    student_skills = _get_student_skills(profile)
    required = [s.name for s in internship.required_skills.all()]
    match = calculate_skill_match(student_skills, required)
    return Response({
        'internship_id': str(internship.id),
        'title': internship.title,
        **match,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def skill_gap_analysis(request):
    """Skill gap analysis for the student's career goal."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    target_role = request.query_params.get('role', profile.career_goal or 'Software Developer')
    student_skills = _get_student_skills(profile)
    gap = calculate_skill_gap(student_skills, target_role)
    return Response(gap)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def learning_roadmap(request):
    """Generate learning roadmap for missing skills."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    target_role = request.query_params.get('role', profile.career_goal or 'Software Developer')
    student_skills = _get_student_skills(profile)
    gap = calculate_skill_gap(student_skills, target_role)

    all_missing = gap['missing_required'] + gap['missing_intermediate']
    roadmap = generate_learning_roadmap(all_missing, target_role)
    suggested_certifications = get_suggested_certifications(all_missing, target_role)

    # Fetch certs the student already holds so the frontend can mark them earned
    from apps.students.models import Certification
    earned_cert_names = list(
        Certification.objects.filter(student=profile)
        .values_list('title', flat=True)
    )

    return Response({
        'target_role': target_role,
        'current_readiness': gap['current_readiness'],
        'potential_readiness': gap['potential_readiness'],
        'roadmap': roadmap,
        'suggested_certifications': suggested_certifications,
        'earned_certifications': earned_cert_names,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def find_students_for_company(request):
    """
    Reverse Mapping: Company → Find Suitable Students.
    Query params: job_id or internship_id or required_skills (comma-separated)
    """
    if not hasattr(request.user, 'company_profile'):
        return Response({'error': 'Company profile required.'}, status=status.HTTP_403_FORBIDDEN)

    company = request.user.company_profile

    # Get required skills from query
    required_skills_param = request.query_params.get('required_skills', '')
    job_id = request.query_params.get('job_id')
    internship_id = request.query_params.get('internship_id')

    required_skill_names = []

    if job_id:
        job = get_object_or_404(Job, id=job_id, company=company)
        required_skill_names = [s.name for s in job.required_skills.all()]
    elif internship_id:
        internship = get_object_or_404(Internship, id=internship_id, company=company)
        required_skill_names = [s.name for s in internship.required_skills.all()]
    elif required_skills_param:
        required_skill_names = [s.strip() for s in required_skills_param.split(',')]
    else:
        # Use company's general required skills
        required_skill_names = [s.skill.name for s in company.company_skills.filter(priority='required')]

    if not required_skill_names:
        return Response({'error': 'No required skills specified.'}, status=status.HTTP_400_BAD_REQUEST)

    # Get all active students
    students = StudentProfile.objects.prefetch_related('student_skills__skill').all()
    candidates = []

    for student in students:
        student_skills = _get_student_skills(student)
        match = calculate_skill_match(student_skills, required_skill_names)

        # Only include students with >40% match
        if match['match_score'] < 40:
            continue

        # Build candidate profile
        from apps.assessments.models import AssessmentResult
        from apps.students.models import InternshipExperience
        from apps.students.models import Certification

        best_assessment = AssessmentResult.objects.filter(
            student=student
        ).order_by('-score').first()

        candidates.append({
            'student_id': str(student.id),
            'student_name': student.full_name,
            'college': student.college_name,
            'degree': student.degree,
            'branch': student.branch,
            'graduation_year': student.graduation_year,
            'cgpa': float(student.cgpa or 0),
            'profile_photo': student.profile_photo.url if student.profile_photo else None,
            'career_goal': student.career_goal,
            'job_readiness_score': student.job_readiness_score,
            'is_education_verified': student.is_education_verified,
            'skill_match_score': match['match_score'],
            'matched_skills': match['matched_skills'],
            'missing_skills': match['missing_skills'],
            'explanation': match['explanation'],
            'assessment_score': best_assessment.score if best_assessment else 0,
            'has_relevant_project': student.projects.exists(),
            'internship_experience_count': student.internship_experiences.count(),
            'verified_certification_count': student.certifications.filter(status='verified').count(),
            'communication_score': 0,  # Updated after AI interview
            'problem_solving_score': 0,
        })

    # Rank candidates
    if candidates:
        candidates = rank_candidates(candidates)

    return Response({
        'required_skills': required_skill_names,
        'total_candidates': len(candidates),
        'candidates': candidates[:50],  # Top 50
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rejection_analysis(request):
    """Analyze student's rejection history and recommend improvements."""
    profile = get_object_or_404(StudentProfile, user=request.user)

    from apps.jobs.models import Application
    from collections import Counter

    applications = Application.objects.filter(student=profile).select_related('job', 'internship')

    total = applications.count()
    shortlisted = applications.filter(status='shortlisted').count()
    interviews = applications.filter(status='interview').count()
    selected = applications.filter(status='selected').count()
    rejected = applications.filter(status='rejected').count()

    # Aggregate rejection reasons
    rejection_tags = []
    for app in applications.filter(status='rejected'):
        rejection_tags.extend(app.rejection_tags)

    tag_counter = Counter(rejection_tags)
    top_rejection_reasons = [
        {'reason': tag, 'count': count}
        for tag, count in tag_counter.most_common(5)
    ]

    # Calculate success rate
    success_rate = (selected / total * 100) if total > 0 else 0

    # Find most common missing skill from rejected applications
    missing_skill_counter = Counter()
    for app in applications.filter(status='rejected'):
        if app.job:
            for skill in app.job.required_skills.all():
                if not profile.student_skills.filter(skill=skill).exists():
                    missing_skill_counter[skill.name] += 1
        elif app.internship:
            for skill in app.internship.required_skills.all():
                if not profile.student_skills.filter(skill=skill).exists():
                    missing_skill_counter[skill.name] += 1

    top_missing_skills = [
        {'skill': s, 'count': c}
        for s, c in missing_skill_counter.most_common(5)
    ]

    # Generate recommendations
    recommendations = []
    if top_missing_skills:
        top_skill = top_missing_skills[0]['skill']
        recommendations.append(
            f"Your most common missing skill is '{top_skill}'. "
            f"Learning it could significantly improve your chances."
        )
    if tag_counter.get('communication', 0) > 0:
        recommendations.append("Improve communication skills — this was a recurring rejection reason.")
    if success_rate < 20:
        recommendations.append("Consider applying to roles that better match your current skill set.")

    return Response({
        'summary': {
            'total_applications': total,
            'shortlisted': shortlisted,
            'interviews': interviews,
            'selected': selected,
            'rejected': rejected,
            'success_rate': round(success_rate, 1),
        },
        'top_rejection_reasons': top_rejection_reasons,
        'top_missing_skills': top_missing_skills,
        'recommendations': recommendations,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_companies(request):
    """Smart company recommendations based on student skills."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    student_skills = _get_student_skills(profile)

    from apps.companies.models import CompanyProfile

    companies = CompanyProfile.objects.filter(
        is_verified=True
    ).prefetch_related('company_skills__skill')

    results = []
    for company in companies:
        required_skills = [cs.skill.name for cs in company.company_skills.filter(priority='required')]
        if not required_skills:
            continue

        match = calculate_skill_match(student_skills, required_skills)
        results.append({
            'company_id': str(company.id),
            'company_name': company.name,
            'domain': company.domain,
            'location': company.location,
            'logo': company.logo.url if company.logo else None,
            'target_hiring': company.target_hiring,
            'match_score': match['match_score'],
            'matched_skills': match['matched_skills'],
            'missing_skills': match['missing_skills'],
            'why_recommended': match['explanation'],
        })

    results.sort(key=lambda x: x['match_score'], reverse=True)
    return Response({'count': len(results), 'companies': results[:20]})
