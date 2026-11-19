from rest_framework import serializers
from .models import CollegeProfile, TrainingProgram, TrainingEnrollment


class CollegeProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CollegeProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class TrainingProgramSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)
    target_skills_detail = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()

    class Meta:
        model = TrainingProgram
        fields = '__all__'
        read_only_fields = ['id', 'college', 'created_at']

    def get_target_skills_detail(self, obj):
        return [{'id': str(s.id), 'name': s.name} for s in obj.target_skills.all()]

    def get_enrolled_count(self, obj):
        return obj.enrollments.count()


class TrainingEnrollmentSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source='program.title', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = TrainingEnrollment
        fields = '__all__'
        read_only_fields = ['id', 'student', 'enrolled_at']
