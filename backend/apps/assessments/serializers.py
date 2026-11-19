from rest_framework import serializers
from .models import Assessment, AssessmentQuestion, AssessmentResult


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = '__all__'  # correct_answer included for frontend proctored grading


class AssessmentSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def get_question_count(self, obj):
        return obj.questions.count()


class AssessmentResultSerializer(serializers.ModelSerializer):
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    skill_name = serializers.CharField(source='assessment.skill.name', read_only=True)

    class Meta:
        model = AssessmentResult
        fields = '__all__'
        read_only_fields = ['id', 'student', 'completed_at']


class SubmitAssessmentSerializer(serializers.Serializer):
    assessment_id = serializers.UUIDField()
    answers = serializers.DictField(child=serializers.CharField())
    time_taken_minutes = serializers.FloatField(required=False)
