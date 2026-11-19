"""
Students Serializers
"""
from rest_framework import serializers
from .models import StudentProfile, EducationCertificate, Project, Certification, InternshipExperience


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    is_email_verified = serializers.BooleanField(source='user.is_email_verified', read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'job_readiness_score', 'profile_completion',
                            'is_education_verified', 'created_at', 'updated_at']


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        exclude = ['id', 'user', 'job_readiness_score', 'profile_completion',
                   'is_education_verified', 'created_at', 'updated_at']


class StudentProfileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing students (company view)."""
    email = serializers.EmailField(source='user.email', read_only=True)
    skill_count = serializers.SerializerMethodField()
    top_skills = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'full_name', 'email', 'profile_photo', 'city', 'state',
            'college_name', 'degree', 'branch', 'graduation_year', 'cgpa',
            'career_goal', 'job_readiness_score', 'profile_completion',
            'is_education_verified', 'skill_count', 'top_skills', 'created_at',
        ]

    def get_skill_count(self, obj):
        return obj.student_skills.count()

    def get_top_skills(self, obj):
        skills = obj.student_skills.select_related('skill').order_by('-proficiency')[:5]
        return [{'name': s.skill.name, 'proficiency': s.proficiency, 'is_verified': s.is_verified}
                for s in skills]


class EducationCertificateSerializer(serializers.ModelSerializer):
    verified_by_email = serializers.EmailField(source='verified_by.email', read_only=True)

    class Meta:
        model = EducationCertificate
        fields = '__all__'
        read_only_fields = ['id', 'student', 'status', 'verified_by', 'verified_at', 'uploaded_at']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['id', 'student', 'created_at']


class CertificationSerializer(serializers.ModelSerializer):
    verified_by_email = serializers.EmailField(source='verified_by.email', read_only=True)

    class Meta:
        model = Certification
        fields = '__all__'
        read_only_fields = ['id', 'student', 'status', 'verified_by', 'verified_at', 'created_at']


class InternshipExperienceSerializer(serializers.ModelSerializer):
    verified_by_email = serializers.EmailField(source='verified_by.email', read_only=True)

    class Meta:
        model = InternshipExperience
        fields = '__all__'
        read_only_fields = ['id', 'student', 'status', 'verified_by', 'verified_at', 'created_at']
