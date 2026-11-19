"""
Skills Views
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.filters import SearchFilter

from apps.accounts.permissions import IsStudent, IsCollegeOrAdmin, IsAdminUser
from apps.students.models import StudentProfile
from .models import Skill, StudentSkill, Badge, StudentBadge
from .serializers import (
    SkillSerializer, StudentSkillSerializer, StudentSkillCreateSerializer,
    BadgeSerializer, StudentBadgeSerializer,
)


class SkillListView(generics.ListAPIView):
    """Public skill master list."""
    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'category']


class SkillViewSet(viewsets.ModelViewSet):
    """Admin skill management."""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class StudentSkillViewSet(viewsets.ModelViewSet):
    """Student can manage their own skills."""
    permission_classes = [IsAuthenticated, IsStudent]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StudentSkillCreateSerializer
        return StudentSkillSerializer

    def get_queryset(self):
        return StudentSkill.objects.filter(
            student__user=self.request.user
        ).select_related('skill')

    def perform_create(self, serializer):
        profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(student=profile)

    @action(detail=True, methods=['post'], permission_classes=[IsCollegeOrAdmin])
    def verify(self, request, pk=None):
        skill = self.get_object()
        skill.is_verified = True
        skill.verified_by = request.user
        skill.verified_at = timezone.now()
        if 'college' not in skill.evidence_types:
            skill.evidence_types.append('college')
        skill.save()
        return Response({'message': f'{skill.skill.name} verified.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def skill_passport(request, student_id=None):
    """Return the skill passport for a student."""
    if student_id:
        profile = get_object_or_404(StudentProfile, id=student_id)
    else:
        profile = get_object_or_404(StudentProfile, user=request.user)

    skills = StudentSkill.objects.filter(student=profile).select_related('skill')
    badges = StudentBadge.objects.filter(student=profile).select_related('badge')

    verified_count = skills.filter(is_verified=True).count()
    total_count = skills.count()

    # Passport score = weighted avg of verified proficiency
    passport_score = 0
    if verified_count > 0:
        verified_skills = skills.filter(is_verified=True)
        passport_score = sum(s.proficiency for s in verified_skills) / verified_count

    skill_data = []
    for s in skills:
        skill_data.append({
            'id': str(s.id),
            'skill_id': str(s.skill.id),
            'skill_name': s.skill.name,
            'skill_category': s.skill.category,
            'proficiency': s.proficiency,
            'is_verified': s.is_verified,
            'evidence_types': s.evidence_types,
            'verification_source': s.verification_source,
            'verified_at': s.verified_at,
        })

    badge_data = []
    for b in badges:
        badge_data.append({
            'id': str(b.id),
            'badge_name': b.badge.name,
            'badge_icon': b.badge.icon,
            'badge_description': b.badge.description,
            'badge_category': b.badge.category,
            'earned_at': b.earned_at,
            'verification_source': b.verification_source,
        })

    return Response({
        'student_id': str(profile.id),
        'student_name': profile.full_name,
        'college': profile.college_name,
        'skills': skill_data,
        'badges': badge_data,
        'verified_skills_count': verified_count,
        'total_skills_count': total_count,
        'passport_score': round(passport_score, 1),
        'is_education_verified': profile.is_education_verified,
    })


class BadgeViewSet(viewsets.ModelViewSet):
    """Admin badge management."""
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer

    def get_permissions(self):
        if self.request.method in ('GET',):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminUser()]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_badges(request):
    """Get all badges the current student has earned + available badges."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    earned = StudentBadge.objects.filter(student=profile).select_related('badge')
    earned_ids = [sb.badge_id for sb in earned]

    all_badges = Badge.objects.filter(is_active=True)
    available = all_badges.exclude(id__in=earned_ids)

    return Response({
        'earned': StudentBadgeSerializer(earned, many=True).data,
        'available': BadgeSerializer(available, many=True).data,
        'earned_count': len(earned_ids),
        'total_badges': all_badges.count(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def award_badge(request):
    """Award a badge to a student (admin only)."""
    student_id = request.data.get('student_id')
    badge_id = request.data.get('badge_id')

    profile = get_object_or_404(StudentProfile, id=student_id)
    badge = get_object_or_404(Badge, id=badge_id)

    sb, created = StudentBadge.objects.get_or_create(
        student=profile, badge=badge,
        defaults={
            'awarded_by': request.user,
            'verification_source': request.data.get('source', 'admin'),
        }
    )

    if not created:
        return Response({'message': 'Badge already awarded.'})

    # Notify student
    from apps.notifications.models import create_notification
    create_notification(
        user=profile.user,
        title=f'Badge Earned: {badge.icon} {badge.name}',
        message=f'Congratulations! You earned the "{badge.name}" badge.',
        notif_type='badge',
        related_id=str(sb.id),
        related_type='badge',
    )

    return Response({'message': f'Badge "{badge.name}" awarded to {profile.full_name}.'})
