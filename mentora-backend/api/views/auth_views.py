"""
Auth views — /api/auth/* endpoints.
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
"""
import re
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
            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=data['role'],
                password=data['password'],
            )

            if data['role'] == 'mentor':
                Mentor.objects.create(user=user, approval_status='pending_payment')
            elif data['role'] == 'student':
                Student.objects.create(user=user)

            access_token, refresh_token = get_tokens_for_user(user)

            return Response({
                'message': 'User registered successfully',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict(),
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

