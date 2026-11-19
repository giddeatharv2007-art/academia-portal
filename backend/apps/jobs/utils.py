"""
Job / Internship notification utilities.

notify_matched_students(posting, posting_type)
  - Fetches every active StudentProfile that has at least one skill
  - Runs calculate_skill_match() from the matching engine
  - Bulk-creates Notification rows for students whose match score >= MIN_MATCH_SCORE
  - Returns the count of notifications sent
"""
from apps.matching.engine import calculate_skill_match
from apps.notifications.models import Notification

# Only notify students whose skill match reaches this threshold
MIN_MATCH_SCORE = 40.0

# Cap notifications per posting so we don't flood the DB on huge student sets
MAX_NOTIFICATIONS = 500


def notify_matched_students(posting, posting_type: str) -> int:
    """
    Send in-app notifications to students who match the new posting.

    Args:
        posting     : Job or Internship instance (already saved, skills set)
        posting_type: 'job' or 'internship'

    Returns:
        int: number of notifications created
    """
    from apps.students.models import StudentProfile
    from apps.skills.models import StudentSkill

    # Required skills for this posting
    required_skill_names = list(
        posting.required_skills.values_list('name', flat=True)
    )
    preferred_skill_names = list(
        posting.preferred_skills.values_list('name', flat=True)
    )

    # Nothing to match against — still notify all students if no skills required
    if not required_skill_names:
        return _notify_all_students(posting, posting_type)

    # Fetch all student profiles that have at least one skill recorded
    students_with_skills = (
        StudentProfile.objects
        .filter(student_skills__isnull=False)
        .distinct()
        .select_related('user')
        .prefetch_related('student_skills__skill')
    )

    company_name = posting.company.name
    title_text = posting.title

    if posting_type == 'job':
        notif_title = f"🆕 New Job: {title_text} at {company_name}"
        action_url = f"/jobs/{posting.id}"
        related_type = 'job'
    else:
        notif_title = f"🆕 New Internship: {title_text} at {company_name}"
        action_url = f"/internships/{posting.id}"
        related_type = 'internship'

    bulk_notifs = []
    count = 0

    for student in students_with_skills:
        if count >= MAX_NOTIFICATIONS:
            break

        # Build skill list for matching engine
        student_skills = [
            {
                'name': ss.skill.name,
                'proficiency': ss.proficiency,
                'is_verified': ss.is_verified,
            }
            for ss in student.student_skills.all()
        ]

        result = calculate_skill_match(
            student_skills,
            required_skill_names,
            preferred_skill_names or None,
        )

        match_score = result['match_score']
        if match_score < MIN_MATCH_SCORE:
            continue

        # Build a personalised message
        matched = [s['name'] for s in result.get('matched_skills', [])]
        missing = [s['name'] for s in result.get('missing_skills', [])]

        message = (
            f"{company_name} just posted a new {posting_type}: \"{title_text}\". "
            f"Your skill match score is {match_score}%."
        )
        if matched:
            message += f" Matched skills: {', '.join(matched[:3])}{'…' if len(matched) > 3 else ''}."
        if missing:
            message += f" You're missing: {', '.join(missing[:3])}{'…' if len(missing) > 3 else ''}."

        bulk_notifs.append(
            Notification(
                user=student.user,
                title=notif_title,
                message=message,
                notif_type='match',
                related_id=str(posting.id),
                related_type=related_type,
                action_url=action_url,
            )
        )
        count += 1

    if bulk_notifs:
        Notification.objects.bulk_create(bulk_notifs, ignore_conflicts=True)

    return count


def _notify_all_students(posting, posting_type: str) -> int:
    """
    Fallback: posting has no required skills — notify every active student.
    Limited to MAX_NOTIFICATIONS to stay sane.
    """
    from apps.students.models import StudentProfile

    company_name = posting.company.name
    title_text = posting.title

    if posting_type == 'job':
        notif_title = f"🆕 New Job: {title_text} at {company_name}"
        action_url = f"/jobs/{posting.id}"
        related_type = 'job'
    else:
        notif_title = f"🆕 New Internship: {title_text} at {company_name}"
        action_url = f"/internships/{posting.id}"
        related_type = 'internship'

    message = (
        f"{company_name} posted a new {posting_type}: \"{title_text}\". "
        "No specific skills required — open to all students!"
    )

    students = (
        StudentProfile.objects
        .select_related('user')
        .all()[:MAX_NOTIFICATIONS]
    )

    bulk_notifs = [
        Notification(
            user=s.user,
            title=notif_title,
            message=message,
            notif_type='match',
            related_id=str(posting.id),
            related_type=related_type,
            action_url=action_url,
        )
        for s in students
    ]

    if bulk_notifs:
        Notification.objects.bulk_create(bulk_notifs, ignore_conflicts=True)

    return len(bulk_notifs)
