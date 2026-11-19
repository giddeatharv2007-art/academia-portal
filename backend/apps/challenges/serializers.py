from rest_framework import serializers
from .models import IndustryChallenge, ChallengeTeam, ChallengeTeamMember, ChallengeSubmission
from apps.skills.serializers import SkillSerializer


class IndustryChallengeSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    required_skills_detail = SkillSerializer(source='required_skills', many=True, read_only=True)
    teams_count = serializers.SerializerMethodField()
    submissions_count = serializers.SerializerMethodField()

    class Meta:
        model = IndustryChallenge
        fields = '__all__'
        read_only_fields = ['id', 'company', 'created_at', 'updated_at']

    def get_teams_count(self, obj):
        return obj.teams.count()

    def get_submissions_count(self, obj):
        return obj.submissions.count()


class ChallengeTeamSerializer(serializers.ModelSerializer):
    leader_name = serializers.CharField(source='leader.full_name', read_only=True)
    members_detail = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeTeam
        fields = '__all__'
        read_only_fields = ['id', 'leader', 'created_at']

    def get_members_detail(self, obj):
        return [
            {'student_id': str(m.student.id), 'name': m.student.full_name, 'role': m.role}
            for m in obj.challengeteammember_set.select_related('student').all()
        ]


class ChallengeSubmissionSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)

    class Meta:
        model = ChallengeSubmission
        fields = '__all__'
        read_only_fields = ['id', 'submitted_at', 'evaluated_by', 'evaluated_at']
