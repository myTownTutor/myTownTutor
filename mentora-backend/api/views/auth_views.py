"""
Auth views — /api/auth/* endpoints.
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/resend-otp
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
"""
import re
import random
import secrets
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings as django_settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from api.models import User, Mentor, Student

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

def get_tokens_for_user(user):
    """Return both access and refresh token strings."""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


def _password_errors(password):
    """Return a list of password requirement violation messages, or []."""
    errors = []
    if len(password) < 8:
        errors.append('Password must be at least 8 characters.')
    if not re.search(r'[A-Za-z]', password):
        errors.append('Password must contain at least one letter.')
    if not re.search(r'\d', password):
        errors.append('Password must contain at least one number.')
    return errors


def _generate_otp():
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))


def _send_otp_email(email, otp, first_name):
    """Send OTP verification email via Brevo HTTP API (port 443)."""
    import requests as http_requests
    api_key = django_settings.BREVO_API_KEY
    if not api_key:
        # Fallback to Django email backend (console in dev)
        from django.core.mail import send_mail
        send_mail(
            subject='Verify your MyTownTutor account',
            message=(
                f'Hi {first_name},\n\n'
                f'Your verification code is: {otp}\n\n'
                f'This code expires in 10 minutes.\n\n'
                f'— The MyTownTutor Team'
            ),
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return

    response = http_requests.post(
        'https://api.brevo.com/v3/smtp/email',
        headers={
            'api-key': api_key,
            'Content-Type': 'application/json',
        },
        json={
            'sender': {'name': 'MyTownTutor', 'email': django_settings.DEFAULT_FROM_EMAIL},
            'to': [{'email': email}],
            'subject': 'Verify your MyTownTutor account',
            'textContent': (
                f'Hi {first_name},\n\n'
                f'Your verification code for MyTownTutor is:\n\n'
                f'  {otp}\n\n'
                f'This code expires in 10 minutes.\n\n'
                f'If you did not sign up, please ignore this email.\n\n'
                f'— The MyTownTutor Team'
            ),
        },
        timeout=10,
    )
    if response.status_code not in (200, 201):
        raise Exception(f'Brevo API error {response.status_code}: {response.text}')


class RegisterView(APIView):
    """POST /api/auth/register"""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        required = ['email', 'password', 'first_name', 'last_name', 'role']

        if not all(k in data for k in required):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        if data['role'] not in ['mentor', 'student']:
            return Response(
                {'error': 'Invalid role. Must be mentor or student'},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = data['email'].strip().lower()
        if not EMAIL_RE.match(email):
            return Response({'error': 'Invalid email address'}, status=status.HTTP_400_BAD_REQUEST)

        pw_errors = _password_errors(data['password'])
        if pw_errors:
            return Response({'error': ' '.join(pw_errors)}, status=status.HTTP_400_BAD_REQUEST)

        first_name = data['first_name'].strip()[:120]
        last_name  = data['last_name'].strip()[:120]
        if not first_name or not last_name:
            return Response({'error': 'First and last name are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_409_CONFLICT)

        try:
            otp = _generate_otp()
            otp_expires_at = timezone.now() + timedelta(minutes=10)

            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=data['role'],
                password=data['password'],
            )
            user.email_otp = otp
            user.email_otp_expires_at = otp_expires_at
            user.is_email_verified = False
            user.save()

            if data['role'] == 'mentor':
                Mentor.objects.create(user=user, approval_status='pending_payment')
            elif data['role'] == 'student':
                Student.objects.create(user=user)

            try:
                _send_otp_email(email, otp, first_name)
            except Exception as mail_err:
                # Log but don't crash — user can request resend
                import logging
                logging.getLogger(__name__).error(f'Failed to send OTP email to {email}: {mail_err}')

            return Response({
                'message': 'OTP sent to your email. Please verify to continue.',
                'email': email,
                'role': data['role'],
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyEmailView(APIView):
    """POST /api/auth/verify-email"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_email_verified:
            return Response({'error': 'Email already verified'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.email_otp or user.email_otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > user.email_otp_expires_at:
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.email_otp = None
        user.email_otp_expires_at = None
        user.save()

        access_token, refresh_token = get_tokens_for_user(user)

        return Response({
            'message': 'Email verified successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    """POST /api/auth/resend-otp"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No account found with this email'}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_email_verified:
            return Response({'error': 'Email already verified'}, status=status.HTTP_400_BAD_REQUEST)

        otp = _generate_otp()
        user.email_otp = otp
        user.email_otp_expires_at = timezone.now() + timedelta(minutes=10)
        user.save()

        try:
            _send_otp_email(email, otp, user.first_name)
        except Exception as mail_err:
            import logging
            logging.getLogger(__name__).error(f'Failed to send OTP email to {email}: {mail_err}')
            return Response({'error': 'Failed to send email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'New OTP sent to your email'}, status=status.HTTP_200_OK)


class LoginView(APIView):
    """POST /api/auth/login"""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        if not data or not all(k in data for k in ['email', 'password']):
            return Response({'error': 'Missing email or password'}, status=status.HTTP_400_BAD_REQUEST)

        email = data['email'].strip().lower()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'Account is deactivated'}, status=status.HTTP_403_FORBIDDEN)

        if not user.check_password(data['password']):
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_email_verified and not user.is_staff:
            # Re-send OTP so they can verify immediately
            otp = _generate_otp()
            user.email_otp = otp
            user.email_otp_expires_at = timezone.now() + timedelta(minutes=10)
            user.save()
            try:
                _send_otp_email(email, otp, user.first_name)
            except Exception:
                pass
            return Response({
                'error': 'email_not_verified',
                'message': 'Please verify your email. A new OTP has been sent.',
                'email': email,
            }, status=status.HTTP_403_FORBIDDEN)

        access_token, refresh_token = get_tokens_for_user(user)

        return Response({
            'message': 'Logged in successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """POST /api/auth/logout  — blacklists the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # already blacklisted or invalid — still OK
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    """POST /api/auth/refresh  — exchange a valid refresh token for a new pair."""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'refresh_token required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            # ROTATE_REFRESH_TOKENS=True will blacklist old and issue new
            new_access  = str(token.access_token)
            new_refresh = str(token)
            return Response({
                'access_token': new_access,
                'refresh_token': new_refresh,
            })
        except TokenError as e:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


class MeView(APIView):
    """GET /api/auth/me"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(request.user.to_dict(), status=status.HTTP_200_OK)

