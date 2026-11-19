from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.skills.models import Badge, StudentBadge
from apps.skills.serializers import BadgeSerializer, StudentBadgeSerializer
from apps.students.models import StudentProfile
from django.shortcuts import get_object_or_404


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def badge_list(request):
    badges = Badge.objects.filter(is_active=True)
    return Response(BadgeSerializer(badges, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_badges(request):
    profile = get_object_or_404(StudentProfile, user=request.user)
    earned = StudentBadge.objects.filter(student=profile).select_related('badge')
    earned_ids = [sb.badge_id for sb in earned]
    available = Badge.objects.filter(is_active=True).exclude(id__in=earned_ids)
    return Response({
        'earned': StudentBadgeSerializer(earned, many=True).data,
        'available': BadgeSerializer(available, many=True).data,
    })
