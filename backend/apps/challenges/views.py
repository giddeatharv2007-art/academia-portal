"""
Industry Challenges Views
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsStudent, IsCompany, IsAdminUser
from apps.students.models import StudentProfile
from apps.companies.models import CompanyProfile
from apps.notifications.models import create_notification

from .models import IndustryChallenge, ChallengeTeam, ChallengeTeamMember, ChallengeSubmission
from .serializers import IndustryChallengeSerializer, ChallengeTeamSerializer, ChallengeSubmissionSerializer


class IndustryChallengeViewSet(viewsets.ModelViewSet):
    serializer_class = IndustryChallengeSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'company':
            try:
                company = self.request.user.company_profile
                return IndustryChallenge.objects.filter(company=company)
            except Exception:
                pass
        return IndustryChallenge.objects.filter(status='active')

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsCompany()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        company = get_object_or_404(CompanyProfile, user=self.request.user)
        serializer.save(company=company)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def join(self, request, pk=None):
        """Student creates or joins a team for a challenge."""
        challenge = self.get_object()
        profile = get_object_or_404(StudentProfile, user=request.user)
        team_name = request.data.get('team_name', f"{profile.full_name}'s Team")
        team_id = request.data.get('team_id')  # join existing team

        # Check if student already has a team for this challenge
        if ChallengeTeamMember.objects.filter(team__challenge=challenge, student=profile).exists():
            return Response({'error': 'Already part of a team for this challenge.'}, status=400)

        if team_id:
            team = get_object_or_404(ChallengeTeam, id=team_id, challenge=challenge)
            if team.members.count() >= challenge.team_size_max:
                return Response({'error': 'Team is full.'}, status=400)
            ChallengeTeamMember.objects.create(team=team, student=profile)
        else:
            team = ChallengeTeam.objects.create(
                challenge=challenge,
                name=team_name,
                leader=profile,
            )
            ChallengeTeamMember.objects.create(team=team, student=profile, role='Leader')

        return Response({'message': 'Joined challenge.', 'team_id': str(team.id)}, status=201)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def submit(self, request, pk=None):
        """Submit solution for a challenge."""
        challenge = self.get_object()
        profile = get_object_or_404(StudentProfile, user=request.user)

        try:
            membership = ChallengeTeamMember.objects.get(team__challenge=challenge, student=profile)
            team = membership.team
        except ChallengeTeamMember.DoesNotExist:
            return Response({'error': 'You are not part of a team for this challenge.'}, status=400)

        if hasattr(team, 'submission'):
            return Response({'error': 'Team already has a submission.'}, status=400)

        serializer = ChallengeSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            submission = serializer.save(challenge=challenge, team=team)
            # Notify company
            create_notification(
                user=challenge.company.user,
                title='New Challenge Submission',
                message=f'Team "{team.name}" submitted for challenge "{challenge.title}".',
                notif_type='challenge',
                related_id=str(submission.id),
            )
            return Response(ChallengeSubmissionSerializer(submission).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsCompany])
    def submissions(self, request, pk=None):
        challenge = self.get_object()
        subs = ChallengeSubmission.objects.filter(challenge=challenge)
        return Response(ChallengeSubmissionSerializer(subs, many=True).data)

    @action(detail=False, methods=['get'], url_path='my-teams')
    def my_teams(self, request):
        profile = get_object_or_404(StudentProfile, user=request.user)
        memberships = ChallengeTeamMember.objects.filter(student=profile).select_related('team__challenge')
        data = [
            {
                'team_id': str(m.team.id),
                'team_name': m.team.name,
                'challenge_id': str(m.team.challenge.id),
                'challenge_title': m.team.challenge.title,
                'role': m.role,
                'has_submission': hasattr(m.team, 'submission'),
            }
            for m in memberships
        ]
        return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCompany])
def evaluate_submission(request, submission_id):
    """Company evaluates a challenge submission."""
    company = get_object_or_404(CompanyProfile, user=request.user)
    submission = get_object_or_404(ChallengeSubmission, id=submission_id, challenge__company=company)

    submission.score = request.data.get('score')
    submission.evaluation_notes = request.data.get('notes', '')
    submission.status = request.data.get('status', ChallengeSubmission.Status.UNDER_REVIEW)
    submission.evaluated_by = company
    submission.evaluated_at = timezone.now()
    submission.save()

    # Notify team members
    for member in submission.team.challengeteammember_set.select_related('student__user').all():
        create_notification(
            user=member.student.user,
            title='Challenge Submission Evaluated',
            message=f'Your submission for "{submission.challenge.title}" has been evaluated.',
            notif_type='challenge',
            related_id=str(submission.id),
        )

    return Response({'message': 'Submission evaluated.'})
