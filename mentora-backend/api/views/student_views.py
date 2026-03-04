"""
Student views — replicate Flask /api/students/* endpoints.
GET  /api/students/dashboard
GET  /api/students/mentors
GET  /api/students/profile
PUT  /api/students/profile
POST /api/students/contact-mentor
GET  /api/students/contacts
"""
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models import Student, Mentor, Contact
from api.utils import paginate


class TutorFoundView(APIView):
    """GET/POST /api/students/tutor-found"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'tutor_found': student.tutor_found})

    def post(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
        value = request.data.get('tutor_found')  # true / false / null
        # Accept JSON boolean or null
        if value is not None and not isinstance(value, bool):
            return Response({'error': 'tutor_found must be true, false, or null'}, status=status.HTTP_400_BAD_REQUEST)
        student.tutor_found = value
        student.save(update_fields=['tutor_found'])
        return Response({'tutor_found': student.tutor_found})


class StudentDashboardView(APIView):
    """GET /api/students/dashboard"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        contacts_sent = Contact.objects.filter(student=student).count()

        return Response({
            'student': student.to_dict(),
            'stats': {
                'contacts_sent': contacts_sent,
            },
        })


class BrowseMentorsView(APIView):
    """GET /api/students/mentors"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 10))
        search = request.query_params.get('search', '')
        expertise = request.query_params.get('expertise', '')
        min_exp = int(request.query_params.get('min_exp', 0))
        max_rate = float(request.query_params.get('max_rate', 10000))
        sort_by = request.query_params.get('sort_by', 'latest')

        qs = Mentor.objects.filter(approval_status='approved').select_related('user')

        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(expertise__icontains=search)
            )
        if expertise:
            qs = qs.filter(expertise__icontains=expertise)
        if min_exp > 0:
            qs = qs.filter(experience_years__gte=min_exp)

        qs = qs.filter(hourly_rate__lte=max_rate)

        if sort_by == 'price_high':
            qs = qs.order_by('-hourly_rate')
        elif sort_by == 'price_low':
            qs = qs.order_by('hourly_rate')
        else:
            qs = qs.order_by('-created_at')

        items, total, pages = paginate(qs, page, per_page)

        return Response({
            'mentors': [m.to_dict(include_email=False) for m in items],
            'total': total,
            'pages': pages,
            'current_page': page,
        })


class StudentProfileView(APIView):
    """GET / PUT /api/students/profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(student.to_dict())

    def put(self, request):
        user = request.user
        if user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'headline' in data:
            student.headline = data['headline']
        if 'bio' in data:
            student.bio = data['bio']

        try:
            student.save()
            return Response({
                'message': 'Profile updated successfully',
                'student': student.to_dict(),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContactMentorView(APIView):
    """POST /api/students/contact-mentor"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if not all(k in data for k in ['mentor_id', 'message']):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mentor = Mentor.objects.select_related('user').get(
                pk=data['mentor_id'], approval_status='approved'
            )
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            contact = Contact.objects.create(
                mentor=mentor,
                student=student,
                student_email=user.email,
                student_name=f"{user.first_name} {user.last_name}",
                student_phone=data.get('phone', ''),
                message=data['message'],
            )

            # Send email notification to mentor
            try:
                send_mail(
                    subject=f'New contact from {user.first_name} {user.last_name}',
                    message=(
                        f"You have received a new contact request on Mentora.\n\n"
                        f"From: {user.first_name} {user.last_name}\n"
                        f"Email: {user.email}\n"
                        f"Phone: {data.get('phone', 'Not provided')}\n\n"
                        f"Message:\n{data['message']}\n\n"
                        f"---\nLog in to your dashboard to see all contacts and social links."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[mentor.user.email],
                    fail_silently=True,
                )
            except Exception as mail_err:
                print(f"Email sending failed: {mail_err}")

            return Response({
                'message': 'Contact sent successfully',
                'contact': contact.to_dict(),
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MyContactsView(APIView):
    """GET /api/students/contacts"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'student':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        try:
            student = user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        contacts = (
            Contact.objects
            .filter(student=student)
            .select_related('mentor__user')
            .order_by('-created_at')
        )

        return Response({'contacts': [c.to_dict() for c in contacts]})
