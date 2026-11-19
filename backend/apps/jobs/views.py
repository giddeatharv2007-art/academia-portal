"""
Jobs, Internships, Applications Views
"""
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsStudent, IsCompany, IsAdminUser, IsCompanyOwnerOrAdmin
from apps.students.models import StudentProfile
from apps.companies.models import CompanyProfile
from apps.notifications.models import create_notification

from .models import Job, Internship, Application, CompanyFeedback
from .serializers import JobSerializer, InternshipSerializer, ApplicationSerializer, CompanyFeedbackSerializer
from .filters import JobFilter, InternshipFilter
from .utils import notify_matched_students


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['title', 'description', 'company__name']
    ordering_fields = ['created_at', 'salary_min', 'deadline']

    def get_queryset(self):
        qs = Job.objects.filter(is_active=True).select_related('company').prefetch_related('required_skills')
        if self.request.user.is_authenticated and self.request.user.role == 'company':
            # Company can see their own jobs including inactive
            try:
                company = self.request.user.company_profile
                return Job.objects.filter(company=company).select_related('company').prefetch_related('required_skills')
            except Exception:
                pass
        return qs

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsCompany()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        company = get_object_or_404(CompanyProfile, user=self.request.user)
        job = serializer.save(company=company)
        # Notify all skill-matched students about the new job posting
        try:
            notify_matched_students(job, posting_type='job')
        except Exception:
            pass  # Never let notification failure block the job creation

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def apply(self, request, pk=None):
        job = self.get_object()
        profile = get_object_or_404(StudentProfile, user=request.user)

        if Application.objects.filter(student=profile, job=job).exists():
            return Response({'error': 'Already applied.'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate match score
        from apps.matching.engine import calculate_skill_match
        from apps.skills.models import StudentSkill
        student_skills = [
            {'name': ss.skill.name, 'proficiency': ss.proficiency, 'is_verified': ss.is_verified}
            for ss in StudentSkill.objects.filter(student=profile).select_related('skill')
        ]
        required = [s.name for s in job.required_skills.all()]
        match = calculate_skill_match(student_skills, required)

        app = Application.objects.create(
            student=profile,
            job=job,
            cover_letter=request.data.get('cover_letter', ''),
            match_score=match['match_score'],
        )

        # Notify company
        create_notification(
            user=job.company.user,
            title='New Job Application',
            message=f'{profile.full_name} applied for {job.title}.',
            notif_type='application',
            related_id=str(app.id),
            related_type='application',
        )

        return Response({'message': 'Applied successfully.', 'application_id': str(app.id)}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsCompany])
    def applications(self, request, pk=None):
        job = self.get_object()
        apps = Application.objects.filter(job=job).select_related('student')
        serializer = ApplicationSerializer(apps, many=True)
        return Response(serializer.data)


class InternshipViewSet(viewsets.ModelViewSet):
    serializer_class = InternshipSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = InternshipFilter
    search_fields = ['title', 'description', 'company__name']
    ordering_fields = ['created_at', 'stipend_min', 'deadline', 'duration_months']

    def get_queryset(self):
        qs = Internship.objects.filter(is_active=True).select_related('company').prefetch_related('required_skills')
        if self.request.user.is_authenticated and self.request.user.role == 'company':
            try:
                company = self.request.user.company_profile
                return Internship.objects.filter(company=company).select_related('company').prefetch_related('required_skills')
            except Exception:
                pass
        return qs

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated(), IsCompany()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        company = get_object_or_404(CompanyProfile, user=self.request.user)
        internship = serializer.save(company=company)
        # Notify all skill-matched students about the new internship posting
        try:
            notify_matched_students(internship, posting_type='internship')
        except Exception:
            pass  # Never let notification failure block the internship creation

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def apply(self, request, pk=None):
        internship = self.get_object()
        profile = get_object_or_404(StudentProfile, user=request.user)

        if Application.objects.filter(student=profile, internship=internship).exists():
            return Response({'error': 'Already applied.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.matching.engine import calculate_skill_match
        from apps.skills.models import StudentSkill
        student_skills = [
            {'name': ss.skill.name, 'proficiency': ss.proficiency, 'is_verified': ss.is_verified}
            for ss in StudentSkill.objects.filter(student=profile).select_related('skill')
        ]
        required = [s.name for s in internship.required_skills.all()]
        match = calculate_skill_match(student_skills, required)

        app = Application.objects.create(
            student=profile,
            internship=internship,
            cover_letter=request.data.get('cover_letter', ''),
            match_score=match['match_score'],
        )

        create_notification(
            user=internship.company.user,
            title='New Internship Application',
            message=f'{profile.full_name} applied for {internship.title}.',
            notif_type='application',
            related_id=str(app.id),
            related_type='application',
        )

        return Response({'message': 'Applied successfully.', 'application_id': str(app.id)}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsCompany])
    def applications(self, request, pk=None):
        internship = self.get_object()
        apps = Application.objects.filter(internship=internship).select_related('student')
        serializer = ApplicationSerializer(apps, many=True)
        return Response(serializer.data)


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Application.objects.filter(student__user=user).select_related(
                'job', 'internship', 'job__company', 'internship__company'
            )
        elif user.role == 'company':
            try:
                company = user.company_profile
                return Application.objects.filter(
                    job__company=company
                ) | Application.objects.filter(
                    internship__company=company
                )
            except Exception:
                return Application.objects.none()
        return Application.objects.all()

    def get_permissions(self):
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsCompany])
    def update_status(self, request, pk=None):
        app = self.get_object()
        new_status = request.data.get('status')
        if new_status not in [s.value for s in Application.Status]:
            return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = app.status
        app.status = new_status

        if new_status == Application.Status.REJECTED:
            app.rejection_reason = request.data.get('rejection_reason', '')
            app.rejection_tags = request.data.get('rejection_tags', [])
            app.company_notes = request.data.get('company_notes', '')

        app.save()

        # Notify student
        title_map = {
            'shortlisted': '🎉 You have been shortlisted!',
            'interview': '📅 Interview Invitation',
            'selected': '✅ Congratulations! You are Selected!',
            'rejected': 'Application Update',
        }
        notif_title = title_map.get(new_status, 'Application Status Updated')
        role_title = app.job.title if app.job else (app.internship.title if app.internship else 'Challenge')
        company_name = app.job.company.name if app.job else (app.internship.company.name if app.internship else '')

        create_notification(
            user=app.student.user,
            title=notif_title,
            message=f'Your application for {role_title} at {company_name} has been {new_status}.',
            notif_type=new_status if new_status in ('shortlisted', 'interview', 'rejection') else 'application',
            related_id=str(app.id),
            related_type='application',
        )

        return Response({'message': f'Status updated to {new_status}.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsCompany])
    def give_feedback(self, request, pk=None):
        app = self.get_object()
        if hasattr(app, 'feedback'):
            return Response({'error': 'Feedback already given.'}, status=status.HTTP_400_BAD_REQUEST)

        company = get_object_or_404(CompanyProfile, user=request.user)
        serializer = CompanyFeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(application=app, company=company, student=app.student)

            # Notify student
            create_notification(
                user=app.student.user,
                title='Company Feedback Received',
                message=f'{company.name} has provided feedback on your internship/project.',
                notif_type='general',
                related_id=str(app.id),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
