from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'unread_count': count})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:50]
    data = [
        {
            'id': str(n.id),
            'title': n.title,
            'message': n.message,
            'notif_type': n.notif_type,
            'is_read': n.is_read,
            'related_id': n.related_id,
            'related_type': n.related_type,
            'action_url': n.action_url,
            'created_at': n.created_at,
        }
        for n in notifs
    ]
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'count': len(data), 'unread_count': unread_count, 'notifications': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request):
    notif_ids = request.data.get('ids', [])
    if notif_ids:
        Notification.objects.filter(user=request.user, id__in=notif_ids).update(is_read=True)
    else:
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'Marked as read.'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_notifications(request):
    Notification.objects.filter(user=request.user, is_read=True).delete()
    return Response({'message': 'Cleared read notifications.'})
