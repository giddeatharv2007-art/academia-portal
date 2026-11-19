import django_filters
from .models import Job, Internship


class JobFilter(django_filters.FilterSet):
    salary_min = django_filters.NumberFilter(field_name='salary_min', lookup_expr='gte')
    salary_max = django_filters.NumberFilter(field_name='salary_max', lookup_expr='lte')
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    deadline_after = django_filters.DateFilter(field_name='deadline', lookup_expr='gte')

    class Meta:
        model = Job
        fields = ['job_type', 'work_mode', 'location', 'salary_min', 'salary_max']


class InternshipFilter(django_filters.FilterSet):
    stipend_min = django_filters.NumberFilter(field_name='stipend_min', lookup_expr='gte')
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    duration_max = django_filters.NumberFilter(field_name='duration_months', lookup_expr='lte')

    class Meta:
        model = Internship
        fields = ['work_mode', 'location', 'duration_months', 'stipend_min']
