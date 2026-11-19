from rest_framework import serializers
from .models import AIInterview, InterviewQuestion, InterviewAnswer


class InterviewQuestionSerializer(serializers.ModelSerializer):
    answer_transcript = serializers.SerializerMethodField()

    class Meta:
        model = InterviewQuestion
        fields = '__all__'

    def get_answer_transcript(self, obj):
        try:
            return obj.answer.transcript
        except Exception:
            return None


class InterviewAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewAnswer
        fields = '__all__'
        read_only_fields = ['id', 'question', 'recorded_at']


class AIInterviewSerializer(serializers.ModelSerializer):
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    duration_minutes = serializers.FloatField(read_only=True)

    class Meta:
        model = AIInterview
        fields = '__all__'
        read_only_fields = [
            'id', 'student', 'status', 'technical_score', 'communication_score',
            'problem_solving_score', 'answer_relevance_score', 'confidence_score',
            'overall_score', 'strengths', 'improvements', 'evaluation_summary',
            'started_at', 'completed_at',
        ]


class StartInterviewSerializer(serializers.Serializer):
    interview_type = serializers.ChoiceField(choices=['job', 'internship', 'practice'])
    target_role = serializers.CharField(max_length=200)
    job_id = serializers.UUIDField(required=False, allow_null=True)
    internship_id = serializers.UUIDField(required=False, allow_null=True)


class SubmitAnswerSerializer(serializers.Serializer):
    interview_id = serializers.UUIDField()
    question_id = serializers.UUIDField()
    transcript = serializers.CharField(allow_blank=True)
    duration_seconds = serializers.FloatField(required=False)
