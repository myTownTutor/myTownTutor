"""
Mentor views.
GET  /api/mentors/approved
GET  /api/mentors/<mentor_id>
POST /api/mentors/initiate-payment   (returns UPI details)
POST /api/mentors/verify-payment     (alias for mark-paid)
POST /api/mentors/mark-paid          (self-report UPI payment → pending_approval)
GET  /api/mentors/profile
PUT  /api/mentors/profile
POST /api/mentors/upload-photo
GET  /api/mentors/enquiries
POST /api/mentors/enquiries/<id>/mark-read
POST /api/mentors/enquiries/<id>/mark-replied
"""
import uuid
import os

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from api.models import Mentor, Payment, Contact, User
from api.utils import paginate


class MentorStudentFoundView(APIView):
    """GET/POST /api/mentors/student-found"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        try:
            mentor = request.user.mentor_profile
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'student_found': mentor.student_found})

    def post(self, request):
        if request.user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        try:
            mentor = request.user.mentor_profile
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor profile not found'}, status=status.HTTP_404_NOT_FOUND)
        value = request.data.get('student_found')
        if value is not None and not isinstance(value, bool):
            return Response({'error': 'student_found must be true, false, or null'}, status=status.HTTP_400_BAD_REQUEST)
        mentor.student_found = value
        mentor.save(update_fields=['student_found'])
        return Response({'student_found': mentor.student_found})


# ---------------------------------------------------------------------------
# Views
# ---------------------------------------------------------------------------

class ApprovedMentorsView(APIView):
    """GET /api/mentors/approved"""
    permission_classes = [AllowAny]

    def get(self, request):
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 10))
        search = request.query_params.get('search', '')
        city = request.query_params.get('city', '')
        gender = request.query_params.get('gender', '')

        qs = Mentor.objects.filter(approval_status='approved', user__is_deleted=False, user__is_active=True).select_related('user')

        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(expertise__icontains=search)
            )
        if city:
            qs = qs.filter(city__icontains=city)
        if gender:
            qs = qs.filter(gender=gender)

        items, total, pages = paginate(qs, page, per_page)

        return Response({
            'mentors': [m.to_dict(include_email=False) for m in items],
            'total': total,
            'pages': pages,
            'current_page': page,
        })


class MentorDetailView(APIView):
    """GET /api/mentors/<mentor_id>"""
    permission_classes = [AllowAny]

    def get(self, request, mentor_id):
        try:
            mentor = Mentor.objects.select_related('user').get(pk=mentor_id)
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Hide deleted accounts entirely
        if mentor.user.is_deleted or not mentor.user.is_active:
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Only show approved mentors; or the mentor viewing their own profile
        user = request.user if request.user.is_authenticated else None
        if mentor.approval_status != 'approved' and (not user or user.id != mentor.user_id):
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(mentor.to_dict())


class InitiatePaymentView(APIView):
    """POST /api/mentors/initiate-payment  (kept for backward-compat, returns UPI info)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            'amount': int(os.getenv('MENTOR_FEE', 299)),
            'upi_id': os.getenv('UPI_ID', 'mytowntutor@upi'),
            'upi_name': os.getenv('UPI_NAME', 'MyTownTutor'),
        })


class VerifyPaymentView(APIView):
    """POST /api/mentors/verify-payment  (kept for backward-compat, delegates to MarkPaidView)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return MarkPaidView().post(request)


class MarkPaidView(APIView):
    """POST /api/mentors/mark-paid — mentor self-reports UPI payment, moves to pending_approval"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        mentor, _ = Mentor.objects.get_or_create(
            user=user,
            defaults={'approval_status': 'pending_payment'}
        )

        if mentor.approval_status in ('approved',):
            return Response({'error': 'Mentor is already approved'}, status=status.HTTP_400_BAD_REQUEST)

        amount = float(request.data.get('amount', os.getenv('MENTOR_FEE', 299)))

        Payment.objects.create(
            mentor=mentor,
            amount=amount,
            razorpay_order_id=f"manual_{uuid.uuid4().hex[:12]}",
            status='pending',
        )

        mentor.approval_status = 'pending_approval'
        mentor.save(update_fields=['approval_status'])

        return Response({
            'message': 'Payment recorded. Your profile is under review.',
            'mentor': mentor.to_dict(),
        })


class MentorProfileView(APIView):
    """GET / PUT /api/mentors/profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        mentor, _ = Mentor.objects.get_or_create(
            user=user,
            defaults={'approval_status': 'pending_payment'}
        )
        return Response(mentor.to_dict())

    def put(self, request):
        user = request.user
        if user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        mentor, _ = Mentor.objects.get_or_create(
            user=user,
            defaults={'approval_status': 'pending_payment'}
        )

        data = request.data
        str_fields = [
            'bio', 'expertise', 'profile_photo_url', 'instagram_url',
            'facebook_url', 'gender', 'university', 'education', 'city', 'resume_url',
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

        try:
            mentor.save()
            return Response({
                'message': 'Profile updated successfully',
                'mentor': mentor.to_dict(),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UploadPhotoView(APIView):
    """POST /api/mentors/upload-photo"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    MAX_SIZE_BYTES = 5 * 1024 * 1024   # 5 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    ALLOWED_MIME_PREFIXES = {'image/png', 'image/jpeg', 'image/webp'}

    def post(self, request):
        user = request.user
        try:
            mentor = Mentor.objects.get(user=user)
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'photo' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        photo = request.FILES['photo']
        if not photo.name:
            return Response({'error': 'No file selected'}, status=status.HTTP_400_BAD_REQUEST)

        # Size check
        if photo.size > self.MAX_SIZE_BYTES:
            return Response(
                {'error': 'File too large. Maximum size is 5 MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extension check
        ext = photo.name.rsplit('.', 1)[-1].lower() if '.' in photo.name else ''
        if ext not in self.ALLOWED_EXTENSIONS:
            return Response(
                {'error': f'Invalid file type. Allowed: {", ".join(self.ALLOWED_EXTENSIONS)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # MIME / magic-bytes check via Pillow (prevents renamed files)
        try:
            from PIL import Image
            img = Image.open(photo)
            img.verify()          # raises if not a valid image
            photo.seek(0)         # reset after verify() consumes the stream
            if img.format.lower() not in ('png', 'jpeg', 'webp'):
                raise ValueError('Unsupported image format')
        except Exception:
            return Response(
                {'error': 'File does not appear to be a valid image.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        import uuid
        filename = f"mentor_{mentor.id}_{uuid.uuid4().hex[:8]}.{ext}"
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'profiles')
        os.makedirs(upload_dir, exist_ok=True)

        filepath = os.path.join(upload_dir, filename)
        with open(filepath, 'wb+') as destination:
            for chunk in photo.chunks():
                destination.write(chunk)

        url = request.build_absolute_uri(f"{settings.MEDIA_URL}profiles/{filename}")
        mentor.profile_photo_url = url
        mentor.save()

        return Response({'url': url})


class MentorEnquiriesView(APIView):
    """GET /api/mentors/enquiries"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            mentor = Mentor.objects.get(user=user)
        except Mentor.DoesNotExist:
            return Response({'enquiries': [], 'total': 0})

        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 10))
        contact_status = request.query_params.get('status', '')

        qs = Contact.objects.filter(mentor=mentor).select_related('mentor__user').order_by('-created_at')
        if contact_status:
            qs = qs.filter(status=contact_status)

        items, total, pages = paginate(qs, page, per_page)

        return Response({
            'enquiries': [e.to_dict() for e in items],
            'total': total,
            'pages': pages,
            'current_page': page,
        })


class MarkEnquiryReadView(APIView):
    """POST /api/mentors/enquiries/<contact_id>/mark-read"""
    permission_classes = [IsAuthenticated]

    def post(self, request, contact_id):
        user = request.user
        if user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            mentor = Mentor.objects.get(user=user)
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor profile not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            contact = Contact.objects.select_related('mentor__user').get(pk=contact_id, mentor=mentor)
        except Contact.DoesNotExist:
            return Response({'error': 'Enquiry not found'}, status=status.HTTP_404_NOT_FOUND)

        contact.status = 'read'
        contact.save()
        return Response({'message': 'Enquiry marked as read', 'enquiry': contact.to_dict()})


class MarkEnquiryRepliedView(APIView):
    """POST /api/mentors/enquiries/<contact_id>/mark-replied"""
    permission_classes = [IsAuthenticated]

    def post(self, request, contact_id):
        user = request.user
        if user.role != 'mentor':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            mentor = Mentor.objects.get(user=user)
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor profile not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            contact = Contact.objects.select_related('mentor__user').get(pk=contact_id, mentor=mentor)
        except Contact.DoesNotExist:
            return Response({'error': 'Enquiry not found'}, status=status.HTTP_404_NOT_FOUND)

        contact.status = 'replied'
        contact.save()
        return Response({'message': 'Enquiry marked as replied', 'enquiry': contact.to_dict()})
