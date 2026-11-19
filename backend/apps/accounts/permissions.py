"""
Custom permission classes for role-based access control
"""
from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    """Allow access only to students."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'student' and
            request.user.is_email_verified
        )


class IsCompany(BasePermission):
    """Allow access only to verified companies."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'company' and
            request.user.is_active
        )


class IsCollege(BasePermission):
    """Allow access only to college accounts."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'college'
        )


class IsAdminUser(BasePermission):
    """Allow access only to admin users."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_staff)
        )


class IsCollegeOrAdmin(BasePermission):
    """Allow access to college or admin."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ('college', 'admin') or
            (request.user.is_authenticated and request.user.is_staff)
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level permission: owner or admin can access."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        # Check if obj has a user or student field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'student'):
            return obj.student.user == request.user
        if hasattr(obj, 'company'):
            return obj.company.user == request.user
        return False


class IsAdvisor(BasePermission):
    """Allow access only to verified admissions advisors."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'advisor' and
            request.user.is_email_verified
        )


class IsCompanyOwnerOrAdmin(BasePermission):
    """Object-level permission: company owner or admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        if hasattr(obj, 'company'):
            return obj.company.user == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
