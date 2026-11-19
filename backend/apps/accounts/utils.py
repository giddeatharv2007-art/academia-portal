"""
Email utility functions for Academia Portal
"""
from django.core.mail import send_mail
from django.conf import settings


# Role labels used in email copy
_ROLE_LABELS = {
    'student': 'Student',
    'company': 'Company',
    'college': 'College',
    'admin':   'Admin',
    'advisor': 'Admissions Advisor',
}

# Extra note shown to company users explaining the admin-approval step
_COMPANY_NOTE = (
    "\nNote: After OTP verification your account will be reviewed by an admin before "
    "you can log in.\n"
)


def send_otp_email(user):
    """
    Send a 6-digit OTP verification email.

    Works for all roles (student, college, company).  Company users get an
    extra note about the admin-approval step.
    """
    otp = user.generate_otp()
    role_label = _ROLE_LABELS.get(user.role, 'User')
    extra_note = _COMPANY_NOTE if user.role == 'company' else ''

    subject = "🔐 Your EduNexus OTP Verification Code"
    message = f"""
Hi,

Welcome to EduNexus — Learn · Grow · Build Your Future!

You're registering as a {role_label}. Please verify your email with the OTP below:

━━━━━━━━━━━━━━━━━━━━━━━━━
          {otp}
━━━━━━━━━━━━━━━━━━━━━━━━━
{extra_note}
⏱  This code is valid for 10 minutes.
🔒 Do NOT share this code with anyone.

If you did not create an EduNexus account, please ignore this email.

Best regards,
EduNexus Team
https://edunexus.in
    """.strip()

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return otp


# ── Keep legacy helper so any existing imports don't break ───────────────────
def send_verification_email(user):
    """
    Deprecated: previously sent a link-based verification email.
    Now delegates to send_otp_email so all roles use the same OTP flow.
    """
    return send_otp_email(user)


def send_company_approval_email(user, company_name):
    """Notify company that their registration has been approved.

    Includes the user's UUID so the company can reference their account ID,
    along with a direct login link.
    """
    subject = "🎉 Your Company Registration is Approved – EduNexus"
    message = f"""
Dear {company_name},

Congratulations! Your company registration on EduNexus has been approved by our admin team.

━━━━━━━━━━━━━━━━━━━━━━━━━
  Account Details
━━━━━━━━━━━━━━━━━━━━━━━━━
  Email   : {user.email}
  User ID : {user.id}
━━━━━━━━━━━━━━━━━━━━━━━━━

You can now log in and start posting internships, jobs, and industry challenges.

👉 Login here: {settings.FRONTEND_URL}/login

If you have any questions, reply to this email or contact our support team.

Best regards,
EduNexus Team
https://edunexus.in
    """.strip()

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_company_rejection_email(user, company_name, reason=""):
    """Notify company that their registration was rejected."""
    subject = "Your company registration status - Academia Portal"
    message = f"""
Dear {company_name},

We regret to inform you that your company registration on Academia Portal could not be approved at this time.

{f'Reason: {reason}' if reason else ''}

Please contact support for more information or re-apply with correct documents.

Best regards,
Academia Portal Team
    """.strip()

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
