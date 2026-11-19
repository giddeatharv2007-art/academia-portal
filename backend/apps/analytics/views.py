"""
Analytics Views - Industry demand, skill gap analytics, college reports
"""
from collections import Counter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsCollegeOrAdmin, IsAdminUser
from apps.skills.models import Skill, StudentSkill
from apps.companies.models import CompanyRequiredSkill
from apps.students.models import StudentProfile
from apps.jobs.models import Job, Internship, Application


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def industry_skill_demand(request):
    """
    Calculate industry skill demand vs student availability.
    Returns skill gap insights for college dashboard.
    """
    # Aggregate required skills from all active jobs + internships
    job_skills = CompanyRequiredSkill.objects.filter(
        company__is_verified=True,
        priority='required'
    ).values_list('skill__name', flat=True)

    internship_skills = []
    for internship in Internship.objects.filter(is_active=True).prefetch_related('required_skills'):
        internship_skills.extend([s.name for s in internship.required_skills.all()])

    for job in Job.objects.filter(is_active=True).prefetch_related('required_skills'):
        internship_skills.extend([s.name for s in job.required_skills.all()])

    all_demand_skills = list(job_skills) + internship_skills
    total_postings = Job.objects.filter(is_active=True).count() + Internship.objects.filter(is_active=True).count()

    if total_postings == 0:
        return Response({'message': 'No active postings found.'})

    demand_counter = Counter(all_demand_skills)
    top_demanded = demand_counter.most_common(15)

    # Student availability for each demanded skill
    total_students = StudentProfile.objects.count()
    skill_analysis = []

    for skill_name, demand_count in top_demanded:
        demand_pct = round((demand_count / max(total_postings, 1)) * 100, 1)

        student_count = StudentSkill.objects.filter(
            skill__name__iexact=skill_name
        ).values('student').distinct().count()

        availability_pct = round((student_count / max(total_students, 1)) * 100, 1) if total_students else 0
        gap = round(demand_pct - availability_pct, 1)

        skill_analysis.append({
            'skill': skill_name,
            'demand_count': demand_count,
            'demand_percentage': demand_pct,
            'student_availability_percentage': availability_pct,
            'student_count': student_count,
            'gap_percentage': gap,
            'gap_severity': 'high' if gap > 30 else ('medium' if gap > 15 else 'low'),
            'recommendation': f"College should conduct {skill_name} training." if gap > 20 else None,
        })

    # Sort by gap descending (highest gap = most urgent)
    skill_analysis.sort(key=lambda x: x['gap_percentage'], reverse=True)

    return Response({
        'total_postings_analyzed': total_postings,
        'total_students': total_students,
        'skill_analysis': skill_analysis,
        'top_gap_skills': [s['skill'] for s in skill_analysis if s['gap_percentage'] > 20],
        'summary': f"{len([s for s in skill_analysis if s['gap_percentage'] > 20])} skills have significant demand-availability gaps.",
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def college_analytics(request):
    """Comprehensive analytics for college dashboard."""
    college_name = request.query_params.get('college', '')

    # Filter students by college if specified
    if college_name:
        students = StudentProfile.objects.filter(college_name__icontains=college_name)
    else:
        students = StudentProfile.objects.all()

    total_students = students.count()

    # Skill distribution
    skill_dist = {}
    for ss in StudentSkill.objects.filter(student__in=students).select_related('skill'):
        name = ss.skill.name
        skill_dist[name] = skill_dist.get(name, 0) + 1

    top_skills = sorted(skill_dist.items(), key=lambda x: x[1], reverse=True)[:10]

    # Application stats
    apps = Application.objects.filter(student__in=students)
    app_stats = {
        'total': apps.count(),
        'shortlisted': apps.filter(status='shortlisted').count(),
        'selected': apps.filter(status='selected').count(),
        'placement_rate': round(
            apps.filter(status='selected').count() / max(total_students, 1) * 100, 1
        ),
    }

    # Career goal distribution
    career_dist = Counter(
        students.exclude(career_goal='').values_list('career_goal', flat=True)
    )

    # Degree distribution
    degree_dist = Counter(
        students.exclude(degree='').values_list('degree', flat=True)
    )

    # Job readiness distribution
    readiness_ranges = {
        'excellent (80-100)': students.filter(job_readiness_score__gte=80).count(),
        'good (60-79)': students.filter(job_readiness_score__gte=60, job_readiness_score__lt=80).count(),
        'average (40-59)': students.filter(job_readiness_score__gte=40, job_readiness_score__lt=60).count(),
        'needs_improvement (<40)': students.filter(job_readiness_score__lt=40).count(),
    }

    return Response({
        'total_students': total_students,
        'verified_students': students.filter(is_education_verified=True).count(),
        'application_stats': app_stats,
        'top_skills': [{'skill': s, 'count': c} for s, c in top_skills],
        'career_goals': dict(career_dist.most_common(10)),
        'degree_distribution': dict(degree_dist.most_common(10)),
        'job_readiness_distribution': readiness_ranges,
        'avg_readiness_score': round(
            sum(s.job_readiness_score for s in students) / max(total_students, 1), 1
        ),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard_analytics(request):
    """Overall platform analytics for super admin."""
    from apps.companies.models import CompanyProfile
    from apps.challenges.models import IndustryChallenge
    from apps.skills.models import StudentBadge
    from apps.interviews.models import AIInterview

    return Response({
        'total_students': StudentProfile.objects.count(),
        'total_companies': CompanyProfile.objects.count(),
        'verified_companies': CompanyProfile.objects.filter(is_verified=True).count(),
        'pending_companies': CompanyProfile.objects.filter(verification_status='pending').count(),
        'active_jobs': Job.objects.filter(is_active=True).count(),
        'active_internships': Internship.objects.filter(is_active=True).count(),
        'total_applications': Application.objects.count(),
        'selected_students': Application.objects.filter(status='selected').count(),
        'active_challenges': IndustryChallenge.objects.filter(status='active').count(),
        'badges_awarded': StudentBadge.objects.count(),
        'interviews_completed': AIInterview.objects.filter(status='evaluated').count(),
        'placement_rate': round(
            Application.objects.filter(status='selected').count() /
            max(Application.objects.count(), 1) * 100, 1
        ),
    })
