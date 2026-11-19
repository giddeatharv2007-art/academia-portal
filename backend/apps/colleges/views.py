"""
Colleges Views
"""
import logging
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, viewsets, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.accounts.permissions import IsCollege, IsStudent, IsAdminUser
from apps.students.models import StudentProfile
from apps.students.serializers import StudentProfileListSerializer
from .models import CollegeProfile, TrainingProgram, TrainingEnrollment
from .serializers import CollegeProfileSerializer, TrainingProgramSerializer, TrainingEnrollmentSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


class CollegeProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsCollege]
    serializer_class = CollegeProfileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        profile, created = CollegeProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'name': self.request.user.email.split('@')[0]}
        )
        return profile


class TrainingProgramViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingProgramSerializer

    def get_queryset(self):
        if self.request.user.role == 'college':
            college = get_object_or_404(CollegeProfile, user=self.request.user)
            return TrainingProgram.objects.filter(college=college)
        return TrainingProgram.objects.filter(status__in=['active', 'upcoming'])

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsCollege()]

    def perform_create(self, serializer):
        college = get_object_or_404(CollegeProfile, user=self.request.user)
        serializer.save(college=college)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def enroll(self, request, pk=None):
        program = self.get_object()
        profile = get_object_or_404(StudentProfile, user=request.user)
        enrollment, created = TrainingEnrollment.objects.get_or_create(
            student=profile, program=program
        )
        if not created:
            return Response({'error': 'Already enrolled.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Enrolled successfully.'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def college_dashboard(request):
    """College dashboard stats."""
    from apps.companies.models import CompanyProfile
    from apps.jobs.models import Application

    college = get_object_or_404(CollegeProfile, user=request.user)

    # Students from this college
    students = StudentProfile.objects.filter(college_name__icontains=college.name)
    total_students = students.count()

    return Response({
        'total_students': total_students,
        'verified_students': students.filter(is_education_verified=True).count(),
        'active_training_programs': college.training_programs.filter(status='active').count(),
        'registered_companies': CompanyProfile.objects.filter(is_verified=True).count(),
        'total_applications': Application.objects.filter(student__college_name__icontains=college.name).count(),
        'selected_students': Application.objects.filter(
            student__college_name__icontains=college.name, status='selected'
        ).count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCollege])
def college_students_list(request):
    """
    Return all students whose college_name matches this college's name.
    Supports ?search=<term> for name/branch/email filtering.
    """
    college = get_object_or_404(CollegeProfile, user=request.user)
    qs = StudentProfile.objects.filter(
        college_name__icontains=college.name
    ).select_related('user').prefetch_related('student_skills__skill')

    search = request.query_params.get('search', '').strip()
    if search:
        from django.db.models import Q
        qs = qs.filter(
            Q(full_name__icontains=search) |
            Q(branch__icontains=search) |
            Q(user__email__icontains=search)
        )

    serializer = StudentProfileListSerializer(qs, many=True)
    return Response({'students': serializer.data, 'total': qs.count()})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCollege])
def college_add_student(request):
    """
    College admin creates a student account directly.
    Creates a User (role=student, is_email_verified=True) and a StudentProfile
    with the college's name pre-filled.  No invitation email — direct creation.
    """
    college = get_object_or_404(CollegeProfile, user=request.user)

    email    = request.data.get('email', '').strip().lower()
    name     = request.data.get('full_name', '').strip()
    branch   = request.data.get('branch', '').strip()
    year     = request.data.get('current_year', None)
    grad_yr  = request.data.get('graduation_year', None)

    if not email or not name:
        return Response({'error': 'email and full_name are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'A user with this email already exists.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Generate a random temporary password (student can reset later)
    import secrets
    temp_password = secrets.token_urlsafe(12)

    user = User.objects.create_user(
        email=email,
        password=temp_password,
        role=User.Role.STUDENT,
        is_email_verified=True,   # college vouches for the student
        is_active=True,
    )

    profile = StudentProfile.objects.create(
        user=user,
        full_name=name,
        college_name=college.name,
        branch=branch,
        current_year=int(year) if year else None,
        graduation_year=int(grad_yr) if grad_yr else None,
    )

    return Response({
        'message': f'Student {name} added successfully.',
        'student': {
            'id': str(profile.id),
            'full_name': profile.full_name,
            'email': email,
            'branch': profile.branch,
            'current_year': profile.current_year,
            'college_name': profile.college_name,
            'temp_password': temp_password,   # college can share this with the student
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCollege])
def college_send_notification(request):
    """
    Broadcast a notification to students of this college.
    Persists one Notification record per matching student.
    """
    from apps.notifications.models import Notification   # lazy import

    college = get_object_or_404(CollegeProfile, user=request.user)

    title   = request.data.get('title', '').strip()
    message = request.data.get('message', '').strip()
    notif_type = request.data.get('type', 'general')
    target  = request.data.get('target', 'all')   # 'all' | 'year3' | 'year4'

    if not title or not message:
        return Response({'error': 'title and message are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    qs = StudentProfile.objects.filter(college_name__icontains=college.name).select_related('user')

    if target == 'year3':
        qs = qs.filter(current_year=3)
    elif target == 'year4':
        qs = qs.filter(current_year=4)

    notifications = [
        Notification(
            user=sp.user,
            title=title,
            message=message,
            notif_type=notif_type,
        )
        for sp in qs
    ]
    Notification.objects.bulk_create(notifications, ignore_conflicts=True)

    return Response({
        'message': f'Notification sent to {len(notifications)} student(s).',
        'count': len(notifications),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCollege])
def college_send_suggestion(request, student_id):
    """
    Send a suggestion/feedback message to a specific student as a notification.
    """
    from apps.notifications.models import Notification

    college = get_object_or_404(CollegeProfile, user=request.user)
    profile = get_object_or_404(StudentProfile, id=student_id)

    # Only allow suggestions to students of this college
    if college.name.lower() not in profile.college_name.lower():
        return Response({'error': 'Student does not belong to your college.'},
                        status=status.HTTP_403_FORBIDDEN)

    msg = request.data.get('message', '').strip()
    if not msg:
        return Response({'error': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    Notification.objects.create(
        user=profile.user,
        title=f'Suggestion from {college.name}',
        message=msg,
        notif_type='general',
    )

    return Response({'message': f'Suggestion sent to {profile.full_name}.'})

