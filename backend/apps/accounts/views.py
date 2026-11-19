"""
Accounts Views - Registration, Email Verification, OTP, Auth
"""
import logging
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    StudentRegisterSerializer,
    CompanyRegisterSerializer,
    CollegeRegisterSerializer,
    AdvisorRegisterSerializer,
    VerifyEmailSerializer,
    VerifyOTPSerializer,
    SendOTPSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
)
from .utils import send_otp_email

logger = logging.getLogger(__name__)
User = get_user_model()


def _build_token_response(user, message):
    """Helper: generate JWT tokens and build a standardised auth response."""
    refresh = RefreshToken.for_user(user)
    return {
        'message': message,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': str(user.id),
            'email': user.email,
            'role': user.role,
            'is_email_verified': user.is_email_verified,
        },
    }


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    """Register a new student account and send OTP for email verification."""
    serializer = StudentRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        otp_sent = False
        otp_error = None
        try:
            send_otp_email(user)
            otp_sent = True
        except Exception as e:
            logger.error(f'OTP email failed for student {user.email}: {type(e).__name__}: {e}')
            otp_error = str(e)

        return Response({
            'message': 'Registration successful. Check your email for the OTP.' if otp_sent
                       else 'Registered but OTP email failed. Please use "Resend OTP".',
            'email': user.email,
            'role': user.role,
            'otp_sent': otp_sent,
            **({"otp_error": otp_error} if otp_error else {}),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_company(request):
    """Register a new company account — requires OTP verification then admin approval."""
    serializer = CompanyRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        otp_sent = False
        otp_error = None
        try:
            send_otp_email(user)
            otp_sent = True
        except Exception as e:
            logger.error(f'OTP email failed for company {user.email}: {type(e).__name__}: {e}')
            otp_error = str(e)

        return Response({
            'message': 'Company registration initiated. Check your email for OTP.' if otp_sent
                       else 'Registered but OTP email failed. Contact support.',
            'email': user.email,
            'otp_sent': otp_sent,
            **({"otp_error": otp_error} if otp_error else {}),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_college(request):
    """Register a college admin account and send OTP for email verification."""
    serializer = CollegeRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        otp_sent = False
        otp_error = None
        try:
            send_otp_email(user)
            otp_sent = True
        except Exception as e:
            logger.error(f'OTP email failed for college {user.email}: {type(e).__name__}: {e}')
            otp_error = str(e)

        return Response({
            'message': 'College registration successful. Check your email for the OTP.' if otp_sent
                       else 'Registered but OTP email failed. Please use "Resend OTP".',
            'email': user.email,
            'role': user.role,
            'otp_sent': otp_sent,
            **({"otp_error": otp_error} if otp_error else {}),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_advisor(request):
    """Register an admissions advisor account and send OTP for email verification."""
    serializer = AdvisorRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        otp_sent = False
        otp_error = None
        try:
            send_otp_email(user)
            otp_sent = True
        except Exception as e:
            logger.error(f'OTP email failed for advisor {user.email}: {type(e).__name__}: {e}')
            otp_error = str(e)
        return Response({
            'message': 'Advisor registration successful. Check your email for the OTP.' if otp_sent
                       else 'Registered but OTP email failed. Please use "Resend OTP".',
            'email': user.email,
            'role': user.role,
            'otp_sent': otp_sent,
            **({"otp_error": otp_error} if otp_error else {}),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Legacy: Verify email using token from verification link (kept for backwards compatibility)."""
    serializer = VerifyEmailSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        try:
            user = User.objects.get(email_verification_token=token)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired verification token.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check token age (24 hours)
        if user.email_verification_token_created:
            elapsed = (timezone.now() - user.email_verification_token_created).total_seconds()
            if elapsed > 86400:
                return Response(
                    {'error': 'Verification token has expired. Please request a new one.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_token_created = None
        user.save(update_fields=['is_email_verified', 'email_verification_token',
                                  'email_verification_token_created'])

        # Generate JWT tokens and return them so the frontend can auto-login
        return Response(_build_token_response(user, 'Email verified successfully.'))
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send or resend OTP to email (all roles)."""
    serializer = SendOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            send_otp_email(user)
        except Exception as e:
            logger.error(f'Resend OTP failed for {email}: {e}')
            return Response({'error': 'Failed to send OTP.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent to your email.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP for all roles.

    - student / college: marks email verified, activates account, returns JWT tokens
      so the frontend can auto-login and redirect to dashboard.
    - company: marks email verified but keeps is_active=False (admin approval still required).
      Returns a pending message — no tokens issued.
    """
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not user.is_otp_valid(otp):
            return Response(
                {'error': 'Invalid or expired OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark OTP as verified and email as verified for all roles
        user.otp_verified = True
        user.is_email_verified = True
        user.otp_code = None
        update_fields = ['otp_verified', 'is_email_verified', 'otp_code']

        if user.role in (User.Role.STUDENT, User.Role.COLLEGE, User.Role.ADVISOR):
            # Ensure account is active so login works immediately
            user.is_active = True
            update_fields.append('is_active')
            user.save(update_fields=update_fields)

            # Auto-login: return JWT tokens so the frontend stores them directly
            data = _build_token_response(user, 'Email verified successfully. Welcome to EduNexus!')
            return Response(data, status=status.HTTP_200_OK)

        else:
            # Company: email verified but still awaiting admin approval
            user.save(update_fields=update_fields)
            return Response({
                'message': 'OTP verified successfully. Your account is pending admin approval.',
                'pending_approval': True,
                'role': user.role,
            }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    """Resend OTP verification email for any unverified user."""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email, is_email_verified=False)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found or already verified.'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        send_otp_email(user)
    except Exception as e:
        logger.error(f'Resend verification OTP failed for {email}: {e}')
        return Response({'error': 'Failed to send OTP email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'message': 'A new OTP has been sent to your email.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    """Get current authenticated user info."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password."""
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Old password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Blacklist refresh token on logout."""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully.'})
    except Exception:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
