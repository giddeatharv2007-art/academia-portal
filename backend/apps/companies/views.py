"""
Companies Views
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.accounts.permissions import IsCompany, IsAdminUser, IsCollegeOrAdmin
from apps.accounts.utils import send_company_approval_email, send_company_rejection_email
from apps.notifications.models import create_notification

from .models import CompanyProfile, CompanyVerification
from .serializers import CompanyProfileSerializer, CompanyProfilePublicSerializer, CompanyVerificationSerializer


class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """Get or update own company profile."""
    permission_classes = [IsAuthenticated, IsCompany]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        return CompanyProfileSerializer

    def get_object(self):
        profile, created = CompanyProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'name': self.request.user.email.split('@')[0]}
        )
        return profile


@api_view(['GET'])
@permission_classes([AllowAny])
def company_public_profile(request, company_id):
    """Public company page."""
    company = get_object_or_404(CompanyProfile, id=company_id, is_verified=True)
    serializer = CompanyProfilePublicSerializer(company)

    from apps.jobs.serializers import JobSerializer, InternshipSerializer
    from apps.challenges.serializers import IndustryChallengeSerializer

    jobs = company.jobs.filter(is_active=True)[:5]
    internships = company.internships.filter(is_active=True)[:5]
    challenges = company.challenges.filter(status='active')[:5]

    return Response({
        'company': serializer.data,
        'recent_jobs': JobSerializer(jobs, many=True).data,
        'recent_internships': InternshipSerializer(internships, many=True).data,
        'active_challenges': IndustryChallengeSerializer(challenges, many=True).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def company_list(request):
    """List all verified companies."""
    companies = CompanyProfile.objects.filter(is_verified=True).order_by('name')
    serializer = CompanyProfilePublicSerializer(companies, many=True)
    return Response({'count': companies.count(), 'companies': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCompany])
def company_dashboard(request):
    """Company dashboard stats."""
    company = get_object_or_404(CompanyProfile, user=request.user)
    from apps.jobs.models import Application

    return Response({
        'active_jobs': company.jobs.filter(is_active=True).count(),
        'active_internships': company.internships.filter(is_active=True).count(),
        'active_challenges': company.challenges.filter(status='active').count(),
        'total_applications': Application.objects.filter(job__company=company).count() +
                              Application.objects.filter(internship__company=company).count(),
        'shortlisted': Application.objects.filter(
            job__company=company, status='shortlisted'
        ).count() + Application.objects.filter(
            internship__company=company, status='shortlisted'
        ).count(),
        'selected': Application.objects.filter(
            job__company=company, status='selected'
        ).count() + Application.objects.filter(
            internship__company=company, status='selected'
        ).count(),
        'is_verified': company.is_verified,
        'verification_status': company.verification_status,
    })


# ─── Admin Company Verification ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def pending_companies(request):
    """List companies pending verification."""
    companies = CompanyProfile.objects.filter(verification_status='pending')
    serializer = CompanyProfileSerializer(companies, many=True)
    return Response({'count': companies.count(), 'companies': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def all_companies(request):
    """Admin: List all companies."""
    companies = CompanyProfile.objects.all().order_by('-created_at')
    serializer = CompanyProfileSerializer(companies, many=True)
    return Response({'count': companies.count(), 'companies': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def approve_company(request, company_id):
    """Admin approves a company."""
    company = get_object_or_404(CompanyProfile, id=company_id)
    company.is_verified = True
    company.verification_status = CompanyProfile.VerificationStatus.APPROVED
    company.verified_by = request.user
    company.verified_at = timezone.now()
    company.save()

    # Activate the user account
    company.user.is_active = True
    company.user.save(update_fields=['is_active'])

    # Notify company
    try:
        send_company_approval_email(company.user, company.name)
    except Exception:
        pass

    create_notification(
        user=company.user,
        title='Company Registration Approved',
        message=f'Your company "{company.name}" has been verified. You can now post opportunities.',
        notif_type='company',
    )

    return Response({
        'message': f'{company.name} approved successfully.',
        'user_id': str(company.user.id),
        'email': company.user.email,
        'company_name': company.name,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def reject_company(request, company_id):
    """Admin rejects a company."""
    company = get_object_or_404(CompanyProfile, id=company_id)
    reason = request.data.get('reason', '')
    company.is_verified = False
    company.verification_status = CompanyProfile.VerificationStatus.REJECTED
    company.rejection_notes = reason
    company.verified_by = request.user
    company.verified_at = timezone.now()
    company.save()

    try:
        send_company_rejection_email(company.user, company.name, reason)
    except Exception:
        pass

    return Response({'message': f'{company.name} rejected.'})
