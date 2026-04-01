from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from api.models import MentorProfile

REMINDER_SCHEDULE = [2, 3, 4]
REPEAT_INTERVAL = 15

EMAIL_SUBJECT = 'Complete Your Registration on MyTown Tutor'

EMAIL_BODY = (
    'Hi {first_name},\n\n'
    'Thank you for signing up as a tutor on MyTown Tutor.\n\n'
    'We noticed that your registration is not yet complete. Please note that your profile will NOT be visible to students until both steps are completed:\n'
    '* Fill in all required profile details\n'
    '* Complete the registration payment\n\n'
    'Once everything is completed and confirmed, your profile will be reviewed and published on the platform.\n\n'
    'A complete and verified profile significantly improves your chances of being contacted by students.\n\n'
    'If you have already completed these steps or believe this message was sent in error, please reply to this email so we can verify.\n\n'
    'Best regards,\n'
    'MyTown Tutor Team\n'
)


class Command(BaseCommand):
    help = 'Send payment reminder emails to mentors who have not completed their registration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Send to all pending mentors immediately, ignoring timing schedule (use for testing)',
        )

    def handle(self, *args, **options):
        now = timezone.now()
        force = options['force']
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

            if not force:
                if count == 0:
                    next_reminder = created + timedelta(days=REMINDER_SCHEDULE[0])
                elif count < len(REMINDER_SCHEDULE):
                    next_reminder = last_sent + timedelta(days=REMINDER_SCHEDULE[count])
                else:
                    next_reminder = last_sent + timedelta(days=REPEAT_INTERVAL)

                if now < next_reminder:
                    continue

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
