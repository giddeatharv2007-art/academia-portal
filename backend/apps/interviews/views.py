"""
AI Interview Views
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsStudent
from apps.students.models import StudentProfile
from apps.skills.models import StudentSkill

from .models import AIInterview, InterviewQuestion, InterviewAnswer
from .serializers import AIInterviewSerializer, StartInterviewSerializer, SubmitAnswerSerializer
from .ai_engine import generate_interview_questions, evaluate_answer, evaluate_full_interview


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def start_interview(request):
    """Start a new AI interview session."""
    serializer = StartInterviewSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    profile = get_object_or_404(StudentProfile, user=request.user)
    data = serializer.validated_data

    # Get student skills
    student_skills = list(
        StudentSkill.objects.filter(student=profile).select_related('skill')
        .values_list('skill__name', flat=True)
    )

    # Create interview
    interview = AIInterview.objects.create(
        student=profile,
        interview_type=data['interview_type'],
        target_role=data['target_role'],
        job_id=data.get('job_id'),
        internship_id=data.get('internship_id'),
        status=AIInterview.Status.IN_PROGRESS,
    )

    # Generate questions
    questions_data = generate_interview_questions(
        target_role=data['target_role'],
        student_skills=student_skills,
        num_questions=8,
    )

    questions = []
    for q in questions_data:
        question = InterviewQuestion.objects.create(
            interview=interview,
            question_text=q['question_text'],
            question_type=q['question_type'],
            order=q['order'],
            expected_topics=q.get('expected_topics', []),
        )
        questions.append({
            'id': str(question.id),
            'order': question.order,
            'question_text': question.question_text,
            'question_type': question.question_type,
        })

    return Response({
        'interview_id': str(interview.id),
        'target_role': interview.target_role,
        'interview_type': interview.interview_type,
        'total_questions': len(questions),
        'questions': questions,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def submit_answer(request):
    """Submit an answer for a specific question."""
    serializer = SubmitAnswerSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    profile = get_object_or_404(StudentProfile, user=request.user)

    interview = get_object_or_404(AIInterview, id=data['interview_id'], student=profile)
    question = get_object_or_404(InterviewQuestion, id=data['question_id'], interview=interview)

    # Evaluate the answer
    evaluation = evaluate_answer(
        question_text=question.question_text,
        transcript=data['transcript'],
        question_type=question.question_type,
    )

    # Create or update answer
    answer, created = InterviewAnswer.objects.update_or_create(
        question=question,
        defaults={
            'transcript': data['transcript'],
            'duration_seconds': data.get('duration_seconds'),
            'relevance_score': evaluation['relevance_score'],
            'technical_accuracy': evaluation['technical_accuracy'],
            'communication_clarity': evaluation['communication_clarity'],
            'feedback': evaluation['feedback'],
        }
    )

    return Response({
        'message': 'Answer submitted.',
        'question_id': str(question.id),
        'evaluation': evaluation,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def complete_interview(request):
    """Complete the interview and get final evaluation."""
    interview_id = request.data.get('interview_id')
    if not interview_id:
        return Response({'error': 'interview_id required.'}, status=status.HTTP_400_BAD_REQUEST)

    profile = get_object_or_404(StudentProfile, user=request.user)
    interview = get_object_or_404(AIInterview, id=interview_id, student=profile)

    # Gather all answers
    answers_data = []
    for question in interview.questions.all():
        try:
            ans = question.answer
            answers_data.append({
                'relevance_score': ans.relevance_score or 0,
                'technical_accuracy': ans.technical_accuracy or 0,
                'communication_clarity': ans.communication_clarity or 0,
                'word_count': len(ans.transcript.split()) if ans.transcript else 0,
            })
        except InterviewAnswer.DoesNotExist:
            answers_data.append({
                'relevance_score': 0,
                'technical_accuracy': 0,
                'communication_clarity': 0,
                'word_count': 0,
            })

    # Final evaluation
    result = evaluate_full_interview(answers_data)

    # Update interview
    interview.technical_score = result['technical_score']
    interview.communication_score = result['communication_score']
    interview.problem_solving_score = result['problem_solving_score']
    interview.answer_relevance_score = result['answer_relevance_score']
    interview.confidence_score = result['confidence_score']
    interview.overall_score = result['overall_score']
    interview.strengths = result['strengths']
    interview.improvements = result['improvements']
    interview.evaluation_summary = result['evaluation_summary']
    interview.status = AIInterview.Status.EVALUATED
    interview.completed_at = timezone.now()
    interview.save()

    # Update student communication score in skills
    _update_student_comm_score(profile, result['communication_score'])

    # Notify
    from apps.notifications.models import create_notification
    create_notification(
        user=request.user,
        title='AI Interview Completed',
        message=f'Your interview for {interview.target_role} scored {result["overall_score"]}/100.',
        notif_type='general',
        related_id=str(interview.id),
        related_type='interview',
    )

    return Response({
        'interview_id': str(interview.id),
        'target_role': interview.target_role,
        'scores': {
            'technical': result['technical_score'],
            'communication': result['communication_score'],
            'problem_solving': result['problem_solving_score'],
            'answer_relevance': result['answer_relevance_score'],
            'confidence': result['confidence_score'],
            'overall': result['overall_score'],
        },
        'strengths': result['strengths'],
        'improvements': result['improvements'],
        'summary': result['evaluation_summary'],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def interview_result(request, interview_id):
    """Get detailed results of a past interview."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    interview = get_object_or_404(AIInterview, id=interview_id, student=profile)
    serializer = AIInterviewSerializer(interview)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def my_interviews(request):
    """List all interviews for the current student."""
    profile = get_object_or_404(StudentProfile, user=request.user)
    interviews = AIInterview.objects.filter(student=profile).order_by('-started_at')
    data = [
        {
            'id': str(i.id),
            'target_role': i.target_role,
            'interview_type': i.interview_type,
            'status': i.status,
            'overall_score': i.overall_score,
            'started_at': i.started_at,
            'completed_at': i.completed_at,
        }
        for i in interviews
    ]
    return Response({'count': len(data), 'interviews': data})


def _update_student_comm_score(profile, comm_score):
    """Update student's communication skill score after interview."""
    try:
        from apps.skills.models import Skill, StudentSkill
        comm_skill, _ = Skill.objects.get_or_create(
            name__iexact='Communication',
            defaults={'name': 'Communication', 'category': 'soft'}
        )
        ss, created = StudentSkill.objects.get_or_create(
            student=profile,
            skill=comm_skill,
            defaults={'proficiency': int(comm_score)}
        )
        if not created and int(comm_score) > ss.proficiency:
            ss.proficiency = int(comm_score)
            if 'assessment' not in ss.evidence_types:
                ss.evidence_types.append('assessment')
            ss.save()
    except Exception:
        pass
