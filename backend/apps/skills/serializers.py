from rest_framework import serializers
from .models import Skill, StudentSkill, Badge, StudentBadge


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'description', 'icon', 'is_active']


class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = StudentSkill
        fields = '__all__'
        read_only_fields = ['id', 'student', 'is_verified', 'verified_by', 'verified_at', 'created_at']


class StudentSkillCreateSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(write_only=True, required=False)
    skill_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = StudentSkill
        fields = ['skill_id', 'skill_name', 'proficiency', 'evidence_types']

    def validate(self, attrs):
        skill_id = attrs.pop('skill_id', None)
        skill_name = attrs.pop('skill_name', None)
        if skill_id:
            try:
                attrs['skill'] = Skill.objects.get(id=skill_id)
            except Skill.DoesNotExist:
                raise serializers.ValidationError({'skill_id': 'Skill not found.'})
        elif skill_name:
            skill, _ = Skill.objects.get_or_create(
                name__iexact=skill_name,
                defaults={'name': skill_name}
            )
            attrs['skill'] = skill
        else:
            raise serializers.ValidationError('Provide skill_id or skill_name.')
        return attrs


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class StudentBadgeSerializer(serializers.ModelSerializer):
    badge_name = serializers.CharField(source='badge.name', read_only=True)
    badge_icon = serializers.CharField(source='badge.icon', read_only=True)
    badge_description = serializers.CharField(source='badge.description', read_only=True)
    badge_category = serializers.CharField(source='badge.category', read_only=True)

    class Meta:
        model = StudentBadge
        fields = '__all__'
        read_only_fields = ['id', 'student', 'earned_at']


class SkillPassportSerializer(serializers.Serializer):
    """Full skill passport for a student."""
    student_id = serializers.UUIDField()
    student_name = serializers.CharField()
    skills = StudentSkillSerializer(many=True)
    badges = StudentBadgeSerializer(many=True)
    verified_skills_count = serializers.IntegerField()
    total_skills_count = serializers.IntegerField()
    passport_score = serializers.FloatField()
