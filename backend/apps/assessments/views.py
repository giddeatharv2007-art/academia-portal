"""
Assessments Views
"""
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsStudent, IsAdminUser
from apps.students.models import StudentProfile
from apps.skills.models import StudentSkill

from .models import Assessment, AssessmentQuestion, AssessmentResult
from .serializers import (
    AssessmentSerializer, AssessmentQuestionSerializer,
    AssessmentResultSerializer, SubmitAssessmentSerializer,
)


class AssessmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Assessment.objects.filter(is_active=True).select_related('skill')
    serializer_class = AssessmentSerializer
    permission_classes = [AllowAny]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assessment_questions(request, assessment_id):
    """Get questions for an assessment (without answers)."""
    assessment = get_object_or_404(Assessment, id=assessment_id, is_active=True)
    questions = assessment.questions.all().order_by('order')
    return Response({
        'assessment': AssessmentSerializer(assessment).data,
        'questions': AssessmentQuestionSerializer(questions, many=True).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def submit_assessment(request):
    """Submit assessment answers and calculate score."""
    serializer = SubmitAssessmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    profile = get_object_or_404(StudentProfile, user=request.user)
    assessment = get_object_or_404(Assessment, id=data['assessment_id'])

    # Grade the submission
    questions = AssessmentQuestion.objects.filter(assessment=assessment)
    total = questions.count()
    correct = 0
    answers = data['answers']

    for question in questions:
        submitted = answers.get(str(question.id), '').strip().lower()
        expected = question.correct_answer.strip().lower()
        if submitted == expected:
            correct += 1

    score = round((correct / max(total, 1)) * 100, 1)
    passed = score >= assessment.passing_score

    result = AssessmentResult.objects.create(
        student=profile,
        assessment=assessment,
        score=score,
        total_correct=correct,
        total_questions=total,
        answers=answers,
        time_taken_minutes=data.get('time_taken_minutes'),
        passed=passed,
    )

    # If passed and assessment is tied to a skill, update StudentSkill
    if passed and assessment.skill:
        ss, created = StudentSkill.objects.get_or_create(
            student=profile,
            skill=assessment.skill,
            defaults={'proficiency': int(score)}
        )
        if not created:
            ss.proficiency = max(ss.proficiency, int(score))
            if 'assessment' not in ss.evidence_types:
                ss.evidence_types.append('assessment')
            ss.save()

    # Check and award badge if scored very high
    if score >= 85 and assessment.skill:
        _check_award_skill_badge(profile, assessment.skill, score)

    return Response({
        'result_id': str(result.id),
        'score': score,
        'correct': correct,
        'total': total,
        'passed': passed,
        'passing_score': assessment.passing_score,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def my_results(request):
    """Get all assessment results for the current student."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    results = AssessmentResult.objects.filter(student=profile).select_related(
        'assessment', 'assessment__skill'
    ).order_by('-completed_at')
    return Response(AssessmentResultSerializer(results, many=True).data)


def _check_award_skill_badge(profile, skill, score):
    """Award a skill badge if student scores high in assessment."""
    try:
        from apps.skills.models import Badge, StudentBadge
        badge_name = f"{skill.name} Certified"
        badge, _ = Badge.objects.get_or_create(
            name=badge_name,
            defaults={
                'description': f'Passed the {skill.name} assessment with a high score.',
                'icon': '🏅',
                'category': 'skill',
                'requirements': [f'Score >= 85% on {skill.name} assessment'],
                'points': 20,
            }
        )
        StudentBadge.objects.get_or_create(
            student=profile,
            badge=badge,
            defaults={'verification_source': 'Assessment'}
        )
    except Exception:
        pass
