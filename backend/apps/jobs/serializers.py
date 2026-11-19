from rest_framework import serializers
from .models import Job, Internship, Application, CompanyFeedback
from apps.skills.serializers import SkillSerializer


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    company_verified = serializers.BooleanField(source='company.is_verified', read_only=True)
    required_skills = SkillSerializer(many=True, read_only=True)
    required_skill_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']

    def create(self, validated_data):
        skill_ids = validated_data.pop('required_skill_ids', [])
        job = Job.objects.create(**validated_data)
        if skill_ids:
            from apps.skills.models import Skill
            job.required_skills.set(Skill.objects.filter(id__in=skill_ids))
        return job

    def update(self, instance, validated_data):
        skill_ids = validated_data.pop('required_skill_ids', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if skill_ids is not None:
            from apps.skills.models import Skill
            instance.required_skills.set(Skill.objects.filter(id__in=skill_ids))
        return instance


class InternshipSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    company_verified = serializers.BooleanField(source='company.is_verified', read_only=True)
    required_skills = SkillSerializer(many=True, read_only=True)
    required_skill_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Internship
        fields = '__all__'
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']

    def create(self, validated_data):
        skill_ids = validated_data.pop('required_skill_ids', [])
        internship = Internship.objects.create(**validated_data)
        if skill_ids:
            from apps.skills.models import Skill
            internship.required_skills.set(Skill.objects.filter(id__in=skill_ids))
        return internship

    def update(self, instance, validated_data):
        skill_ids = validated_data.pop('required_skill_ids', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if skill_ids is not None:
            from apps.skills.models import Skill
            instance.required_skills.set(Skill.objects.filter(id__in=skill_ids))
        return instance


class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_email = serializers.EmailField(source='student.user.email', read_only=True)
    job_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['id', 'student', 'applied_at', 'updated_at', 'match_score']

    def get_job_title(self, obj):
        if obj.job:
            return obj.job.title
        if obj.internship:
            return obj.internship.title
        if obj.challenge:
            return obj.challenge.title
        return None

    def get_company_name(self, obj):
        if obj.job:
            return obj.job.company.name
        if obj.internship:
            return obj.internship.company.name
        if obj.challenge:
            return obj.challenge.company.name
        return None


class CompanyFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyFeedback
        fields = '__all__'
        read_only_fields = ['id', 'company', 'student', 'created_at']
