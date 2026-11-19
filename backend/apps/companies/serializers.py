from rest_framework import serializers
from .models import CompanyProfile, CompanyRequiredSkill, CompanyVerification
from apps.skills.serializers import SkillSerializer


class CompanyProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    required_skills_detail = serializers.SerializerMethodField()

    class Meta:
        model = CompanyProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'is_verified', 'verification_status',
                            'verified_by', 'verified_at', 'created_at', 'updated_at']

    def get_required_skills_detail(self, obj):
        return [
            {'skill_name': cs.skill.name, 'priority': cs.priority}
            for cs in obj.company_skills.select_related('skill').all()
        ]


class CompanyProfilePublicSerializer(serializers.ModelSerializer):
    """Public company profile (visible to students)."""
    required_skills_detail = serializers.SerializerMethodField()
    active_jobs_count = serializers.SerializerMethodField()
    active_internships_count = serializers.SerializerMethodField()
    active_challenges_count = serializers.SerializerMethodField()

    class Meta:
        model = CompanyProfile
        fields = [
            'id', 'name', 'logo', 'about', 'location', 'website',
            'established_year', 'domain', 'target_hiring', 'is_verified',
            'verification_status', 'required_skills_detail',
            'active_jobs_count', 'active_internships_count', 'active_challenges_count',
        ]

    def get_required_skills_detail(self, obj):
        return [
            {'skill_name': cs.skill.name, 'priority': cs.priority}
            for cs in obj.company_skills.select_related('skill').all()
        ]

    def get_active_jobs_count(self, obj):
        return obj.jobs.filter(is_active=True).count()

    def get_active_internships_count(self, obj):
        return obj.internships.filter(is_active=True).count()

    def get_active_challenges_count(self, obj):
        return obj.challenges.filter(status='active').count()


class CompanyVerificationSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_email = serializers.EmailField(source='company.user.email', read_only=True)

    class Meta:
        model = CompanyVerification
        fields = '__all__'
        read_only_fields = ['id', 'company', 'submitted_at']
