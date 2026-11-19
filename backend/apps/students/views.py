"""
Students Views
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.accounts.permissions import IsStudent, IsCollegeOrAdmin, IsAdminUser
from .models import StudentProfile, EducationCertificate, Project, Certification, InternshipExperience
from .serializers import (
    StudentProfileSerializer, StudentProfileUpdateSerializer, StudentProfileListSerializer,
    EducationCertificateSerializer, ProjectSerializer, CertificationSerializer,
    InternshipExperienceSerializer,
)


class StudentProfileView(generics.RetrieveUpdateAPIView):
    """Get or update own student profile."""
    permission_classes = [IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return StudentProfileUpdateSerializer
        return StudentProfileSerializer

    def get_object(self):
        profile, created = StudentProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'full_name': self.request.user.email.split('@')[0]}
        )
        return profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Recalculate profile completion
        instance.calculate_profile_completion()
        return Response(StudentProfileSerializer(instance).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def student_public_profile(request, student_id):
    """Public view of a student profile (for companies)."""
    profile = get_object_or_404(StudentProfile, id=student_id)
    serializer = StudentProfileSerializer(profile)
    return Response(serializer.data)


class EducationCertificateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = EducationCertificateSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return EducationCertificate.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(student=profile)

    @action(detail=True, methods=['post'], permission_classes=[IsCollegeOrAdmin])
    def verify(self, request, pk=None):
        cert = self.get_object()
        cert.status = EducationCertificate.Status.VERIFIED
        cert.verified_by = request.user
        cert.verified_at = timezone.now()
        cert.save()
        # Update student profile
        cert.student.is_education_verified = True
        cert.student.save(update_fields=['is_education_verified'])
        return Response({'message': 'Certificate verified.'})

    @action(detail=True, methods=['post'], permission_classes=[IsCollegeOrAdmin])
    def reject(self, request, pk=None):
        cert = self.get_object()
        cert.status = EducationCertificate.Status.REJECTED
        cert.rejection_notes = request.data.get('notes', '')
        cert.save()
        return Response({'message': 'Certificate rejected.'})


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(student=profile)


class CertificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = CertificationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Certification.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(student=profile)

    @action(detail=True, methods=['post'], permission_classes=[IsCollegeOrAdmin])
    def verify(self, request, pk=None):
        cert = self.get_object()
        cert.status = Certification.Status.VERIFIED
        cert.verified_by = request.user
        cert.verified_at = timezone.now()
        cert.save()
        return Response({'message': 'Certification verified.'})


class InternshipExperienceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = InternshipExperienceSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return InternshipExperience.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(student=profile)

    @action(detail=True, methods=['post'], permission_classes=[IsCollegeOrAdmin])
    def verify(self, request, pk=None):
        exp = self.get_object()
        exp.status = InternshipExperience.Status.VERIFIED
        exp.verified_by = request.user
        exp.verified_at = timezone.now()
        exp.save()
        return Response({'message': 'Internship experience verified.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard_stats(request):
    """Return stats for student dashboard."""
    try:
        profile = StudentProfile.objects.get(user=request.user)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Profile not found.'}, status=404)

    from apps.jobs.models import Application
    from apps.skills.models import StudentSkill, StudentBadge

    stats = {
        'profile_completion': profile.profile_completion,
        'job_readiness_score': profile.job_readiness_score,
        'skill_count': StudentSkill.objects.filter(student=profile).count(),
        'verified_skill_count': StudentSkill.objects.filter(student=profile, is_verified=True).count(),
        'project_count': profile.projects.count(),
        'certification_count': profile.certifications.count(),
        'application_count': Application.objects.filter(student=profile).count(),
        'badge_count': StudentBadge.objects.filter(student=profile).count(),
        'applications_by_status': {},
    }

    # Application breakdown
    for s in Application.Status:
        stats['applications_by_status'][s.value] = Application.objects.filter(
            student=profile, status=s.value
        ).count()

    return Response(stats)


# ─── Admin ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_list_students(request):
    """
    Admin: list all student profiles with optional search.
    Query params:
      ?search=<name|email|college|branch>
    """
    search = request.query_params.get('search', '').strip()
    qs = StudentProfile.objects.select_related('user').order_by('-created_at')

    if search:
        from django.db.models import Q
        qs = qs.filter(
            Q(full_name__icontains=search) |
            Q(user__email__icontains=search) |
            Q(college_name__icontains=search) |
            Q(branch__icontains=search) |
            Q(city__icontains=search)
        )

    serializer = StudentProfileListSerializer(qs, many=True)
    return Response({'count': qs.count(), 'students': serializer.data})
