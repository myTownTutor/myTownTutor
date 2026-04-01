from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from api.models import MentorProfile

REMINDER_SCHEDULE = [2, 3, 4]  # days to wait for reminders 1, 2, 3
REPEAT_INTERVAL = 15            # days between reminders 4+

EMAIL_SUBJECT = 'Complete Your Registration on MyTown Tutor'

EMAIL_BODY = """Hi {first_name},

Thank you for signing up as a tutor on MyTown Tutor.

We noticed that your registration is not yet complete. Please note that your profile will NOT be visible to students until both steps are completed:
* Fill in all required profile details
* Complete the registration payment

Once everything is completed and confirmed, your profile will be reviewed and published on the platform.

A complete and verified profile significantly improves your chances of being contacted by students.

If you have already completed these steps or believe this message was sent in error, please reply to this email so we can verify.

Best regards,
MyTown Tutor Team
"""


class Command(BaseCommand):
    help = 'Send payment reminder emails to mentors who have not completed their registration'

    def handle(self, *args, **options):
        now = timezone.now()
        pending = MentorProfile.objects.filter(
            approval_status__in=['pending_payment', 'pending_approval']
        ).select_related('user')

        sent_count = 0
        for mentor in pending:
            if not mentor.user.is_active or mentor.user.is_deleted:
                continue

            count = mentor.reminder_count
            last_sent = mentor.last_reminder_sent
            created = mentor.created_at

            # Determine when the next reminder should go out
            if count == 0:
                # First reminder: 2 days after signup
                next_reminder = created + timedelta(days=REMINDER_SCHEDULE[0])
            elif count < len(REMINDER_SCHEDULE):
                # 2nd reminder: 3 days after 1st; 3rd: 4 days after 2nd
                next_reminder = last_sent + timedelta(days=REMINDER_SCHEDULE[count])
            else:
                # All subsequent: every 15 days
                next_reminder = last_sent + timedelta(days=REPEAT_INTERVAL)

            if now < next_reminder:
                continue  # Not time yet

            try:
                send_mail(
                    subject=EMAIL_SUBJECT,
                    message=EMAIL_BODY.format(first_name=mentor.user.first_name),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[mentor.user.email],
                    fail_silently=False,
                )
                mentor.reminder_count += 1
                mentor.last_reminder_sent = now
                mentor.save(update_fields=['reminder_count', 'last_reminder_sent'])
                sent_count += 1
                self.stdout.write(f'  Sent reminder #{mentor.reminder_count} to {mentor.user.email}')
            except Exception as e:
                self.stderr.write(f'  Failed to email {mentor.user.email}: {e}')

        self.stdout.write(self.style.SUCCESS(f'Done. {sent_count} reminder(s) sent.'))
