"""
Admin views — replicate Flask /api/admin/* endpoints.
GET    /api/admin/dashboard
GET    /api/admin/pending-mentors
POST   /api/admin/mentors/<id>/approve
POST   /api/admin/mentors/<id>/reject
GET    /api/admin/users
GET    /api/admin/users/<id>
PUT    /api/admin/users/<id>
DELETE /api/admin/users/<id>
GET    /api/admin/users/<id>/details
PUT    /api/admin/mentors/<id>/profile
PUT    /api/admin/students/<id>/profile
GET    /api/admin/transactions
GET    /api/admin/contacts
"""
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Sum
from django.utils import timezone
from django.http import HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models import User, Mentor, Student, Payment, Contact, QRCode, QRScan
from api.utils import paginate


def is_admin(user):
    return user and user.role == 'super_admin'


class AdminDashboardView(APIView):
    """GET /api/admin/dashboard"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        total_revenue = (
            Payment.objects.filter(status='completed')
            .aggregate(total=Sum('amount'))['total'] or 0
        )

        stats = {
            'total_users': User.objects.count(),
            'total_mentors': Mentor.objects.count(),
            'total_students': User.objects.filter(role='student').count(),
            'pending_mentors': Mentor.objects.filter(approval_status='pending_approval').count(),
            'approved_mentors': Mentor.objects.filter(approval_status='approved').count(),
            'total_payments': Payment.objects.filter(status='completed').count(),
            'total_revenue': total_revenue,
            'students_found_tutor': Student.objects.filter(tutor_found=True).count(),
            'mentors_found_student': Mentor.objects.filter(student_found=True).count(),
        }
        return Response(stats)


class AdminMentorTuitionStatusView(APIView):
    """GET /api/admin/mentors/tuition-status — list all mentors with their student_found value"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        mentors = Mentor.objects.select_related('user').order_by('-created_at')
        return Response({
            'mentors': [
                {
                    'id': m.id,
                    'first_name': m.user.first_name,
                    'last_name': m.user.last_name,
                    'email': m.user.email,
                    'expertise': m.expertise,
                    'city': m.city,
                    'student_found': m.student_found,
                }
                for m in mentors
            ]
        })


class PendingMentorsView(APIView):
    """GET /api/admin/pending-mentors"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 10))

        qs = Mentor.objects.filter(approval_status='pending_approval').select_related('user')
        items, total, pages = paginate(qs, page, per_page)

        return Response({
            'mentors': [m.to_dict() for m in items],
            'total': total,
            'pages': pages,
            'current_page': page,
        })


class ApproveMentorView(APIView):
    """POST /api/admin/mentors/<mentor_id>/approve"""
    permission_classes = [IsAuthenticated]

    def post(self, request, mentor_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            mentor = Mentor.objects.select_related('user').get(pk=mentor_id)
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        mentor.approval_status = 'approved'
        mentor.save()

        try:
            send_mail(
                subject='Your Mentora Profile Has Been Approved!',
                message=(
                    f"Hello {mentor.user.first_name},\n\n"
                    f"Congratulations! Your mentor profile on Mentora has been approved "
                    f"and is now visible to students.\n\n"
                    f"You can now:\n"
                    f"- View student inquiries in your dashboard\n"
                    f"- Update your profile information at any time\n"
                    f"- Manage your hourly rate and availability\n\n"
                    f"Best regards,\nMentora Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[mentor.user.email],
                fail_silently=True,
            )
        except Exception as mail_err:
            print(f"Email sending failed: {mail_err}")

        return Response({'message': 'Mentor approved successfully', 'mentor': mentor.to_dict()})


class RejectMentorView(APIView):
    """POST /api/admin/mentors/<mentor_id>/reject"""
    permission_classes = [IsAuthenticated]

    def post(self, request, mentor_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            mentor = Mentor.objects.select_related('user').get(pk=mentor_id)
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason', 'Your profile does not meet our requirements.')
        mentor.approval_status = 'rejected'
        mentor.rejected_reason = reason
        mentor.save()

        try:
            send_mail(
                subject='Mentora Profile Review',
                message=(
                    f"Hello {mentor.user.first_name},\n\n"
                    f"Thank you for applying to become a mentor on Mentora.\n\n"
                    f"Unfortunately, your application could not be approved at this time.\n\n"
                    f"Reason: {reason}\n\n"
                    f"You can reapply with updated information in your dashboard.\n\n"
                    f"Best regards,\nMentora Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[mentor.user.email],
                fail_silently=True,
            )
        except Exception as mail_err:
            print(f"Email sending failed: {mail_err}")

        return Response({'message': 'Mentor rejected', 'mentor': mentor.to_dict()})


class AllUsersView(APIView):
    """GET /api/admin/users
    Optional query params:
      role=mentor|student
      show_deleted=true  → show only archived (soft-deleted) accounts
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        role = request.query_params.get('role', '')
        show_deleted = request.query_params.get('show_deleted', '').lower() == 'true'

        if show_deleted:
            qs = User.objects.filter(is_deleted=True)
        else:
            qs = User.objects.filter(is_deleted=False)

        if role:
            qs = qs.filter(role=role)

        items, total, pages = paginate(qs, page, per_page)

        return Response({
            'users': [u.to_dict() for u in items],
            'total': total,
            'pages': pages,
            'current_page': page,
        })


class UserDetailView(APIView):
    """GET / PUT / DELETE /api/admin/users/<user_id>"""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(user.to_dict())

    def put(self, request, user_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        try:
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'email' in data and data['email'] != user.email:
                if User.objects.filter(email=data['email']).exists():
                    return Response({'error': 'Email already in use'}, status=status.HTTP_400_BAD_REQUEST)
                user.email = data['email']
            if 'role' in data:
                user.role = data['role']

            user.save()
            return Response({'message': 'User updated successfully', 'user': user.to_dict()})

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, user_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        if user_id == request.user.id:
            return Response({'error': 'Cannot delete yourself'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Soft-delete: preserve data as archive
            user.is_deleted = True
            user.deleted_at = timezone.now()
            if not user.original_email:
                user.original_email = user.email
            user.email = f'deleted_{user.id}_{int(timezone.now().timestamp())}@deleted.invalid'
            user.is_active = False
            user.save()
            return Response({'message': 'User archived (soft-deleted) successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDetailsView(APIView):
    """GET /api/admin/users/<user_id>/details"""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        user_data = user.to_dict()

        if user.role == 'mentor':
            try:
                user_data['mentor_profile'] = user.mentor_profile.to_dict()
            except Mentor.DoesNotExist:
                pass

        if user.role == 'student':
            try:
                user_data['student_profile'] = user.student_profile.to_dict()
            except Student.DoesNotExist:
                pass

        return Response(user_data)


class AdminMentorProfileView(APIView):
    """PUT /api/admin/mentors/<mentor_id>/profile"""
    permission_classes = [IsAuthenticated]

    def put(self, request, mentor_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            mentor = Mentor.objects.select_related('user').get(pk=mentor_id)
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        try:
            str_fields = [
                'bio', 'expertise', 'gender', 'university', 'education',
                'city', 'resume_url', 'student_id', 'approval_status',
            ]
            for field in str_fields:
                if field in data:
                    setattr(mentor, field, data[field] or None)

            for int_field in ['experience_years', 'age']:
                if int_field in data:
                    setattr(mentor, int_field, int(data[int_field]) if data[int_field] else None)

            for float_field in ['hourly_rate', 'monthly_rate']:
                if float_field in data:
                    setattr(mentor, float_field, float(data[float_field]) if data[float_field] else None)

            mentor.save()
            return Response({
                'message': 'Mentor profile updated successfully',
                'mentor': mentor.to_dict(include_student_id=True),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminStudentProfileView(APIView):
    """PUT /api/admin/students/<student_id>/profile"""
    permission_classes = [IsAuthenticated]

    def put(self, request, student_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = Student.objects.get(pk=student_id)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        try:
            if 'headline' in data:
                student.headline = data['headline']
            if 'bio' in data:
                student.bio = data['bio']
            student.save()
            return Response({
                'message': 'Student profile updated successfully',
                'student': student.to_dict(),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TransactionsView(APIView):
    """GET /api/admin/transactions"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        pay_status = request.query_params.get('status', '')

        qs = Payment.objects.all().order_by('-created_at')
        if pay_status:
            qs = qs.filter(status=pay_status)

        items, total, pages = paginate(qs, page, per_page)

        return Response({
            'transactions': [p.to_dict() for p in items],
            'total': total,
            'pages': pages,
            'current_page': page,
        })


class AllContactsView(APIView):
    """GET /api/admin/contacts"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        mentor_id = request.query_params.get('mentor_id', '')

        qs = Contact.objects.all().select_related('mentor__user').order_by('-created_at')
        if mentor_id:
            qs = qs.filter(mentor_id=mentor_id)

        items, total, pages = paginate(qs, page, per_page)

        return Response({
            'contacts': [c.to_dict() for c in items],
            'total': total,
            'pages': pages,
            'current_page': page,
        })


import random
import string


def _random_slug(length=8):
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choices(chars, k=length))


class QRCodeListCreateView(APIView):
    """
    GET  /api/qr/   — list all QR codes (admin only)
    POST /api/qr/   — create a new QR code (admin only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        qrs = QRCode.objects.all()
        return Response({'qr_codes': [q.to_dict() for q in qrs]})

    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        label = request.data.get('label', '').strip()
        if not label:
            return Response({'error': 'label is required'}, status=status.HTTP_400_BAD_REQUEST)
        # generate unique slug
        slug = _random_slug()
        while QRCode.objects.filter(slug=slug).exists():
            slug = _random_slug()
        qr = QRCode.objects.create(slug=slug, label=label)
        return Response(qr.to_dict(), status=status.HTTP_201_CREATED)


class QRRedirectView(APIView):
    """
    GET /api/qr/<slug>/scan  — public endpoint; logs the scan and redirects to homepage.
    """
    authentication_classes = []   # skip JWT parsing for public scans
    permission_classes = []

    def get(self, request, slug):
        try:
            qr = QRCode.objects.get(slug=slug)
        except QRCode.DoesNotExist:
            return HttpResponseRedirect('https://www.mytowntutor.com/')
        qr.scan_count += 1
        qr.last_scanned_at = timezone.now()
        qr.save(update_fields=['scan_count', 'last_scanned_at'])
        QRScan.objects.create(qr_code=qr)
        return HttpResponseRedirect('https://www.mytowntutor.com/')


class QRCodeDetailView(APIView):
    """
    PUT    /api/qr/<id>  — rename label (admin only)
    DELETE /api/qr/<id>  — delete QR code (admin only)
    """
    permission_classes = [IsAuthenticated]

    def _get_qr(self, qr_id):
        try:
            return QRCode.objects.get(id=qr_id)
        except QRCode.DoesNotExist:
            return None

    def put(self, request, qr_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        qr = self._get_qr(qr_id)
        if not qr:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        label = request.data.get('label', '').strip()
        if not label:
            return Response({'error': 'label is required'}, status=status.HTTP_400_BAD_REQUEST)
        qr.label = label
        qr.save(update_fields=['label'])
        return Response(qr.to_dict())

    def delete(self, request, qr_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        qr = self._get_qr(qr_id)
        if not qr:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        qr.delete()
        return Response({'success': True}, status=status.HTTP_200_OK)


class QRStatsView(APIView):
    """
    GET /api/qr/<id>/stats?days=30  — daily scan counts for a QR code (admin only)
    Also returns overall totals and all-QR combined daily data when id=0.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, qr_id):
        if not is_admin(request.user):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        from django.db.models.functions import TruncDate
        from django.db.models import Count
        import datetime

        days = int(request.query_params.get('days', 30))
        since = timezone.now() - datetime.timedelta(days=days - 1)
        since_date = since.replace(hour=0, minute=0, second=0, microsecond=0)

        # Build queryset
        if qr_id == 0:
            qs = QRScan.objects.filter(scanned_at__gte=since_date)
        else:
            try:
                qr = QRCode.objects.get(id=qr_id)
            except QRCode.DoesNotExist:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
            qs = QRScan.objects.filter(qr_code=qr, scanned_at__gte=since_date)

        # Aggregate by date
        daily = (
            qs
            .annotate(date=TruncDate('scanned_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        # Fill in zero-count days
        data_map = {str(row['date']): row['count'] for row in daily}
        result = []
        for i in range(days):
            d = (since_date + datetime.timedelta(days=i)).date()
            key = str(d)
            result.append({'date': key, 'scans': data_map.get(key, 0)})

        return Response({'daily': result})

