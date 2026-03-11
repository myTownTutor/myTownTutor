from django.urls import path
from api.views.auth_views import (
    RegisterView, LoginView, LogoutView, MeView, TokenRefreshView,
    VerifyEmailView, ResendOTPView, ForgotPasswordView, ResetPasswordView,
    DeleteAccountView,
)
from api.views.mentor_views import (
    ApprovedMentorsView, MentorDetailView, InitiatePaymentView, VerifyPaymentView,
    MarkPaidView, MentorProfileView, UploadPhotoView, MentorEnquiriesView,
    MarkEnquiryReadView, MarkEnquiryRepliedView, MentorStudentFoundView,
)
from api.views.student_views import (
    StudentDashboardView, BrowseMentorsView, StudentProfileView,
    ContactMentorView, MyContactsView, TutorFoundView,
)
from api.views.admin_views import (
    AdminDashboardView, PendingMentorsView, ApproveMentorView, RejectMentorView,
    AllUsersView, UserDetailView, UserDetailsView,
    AdminMentorProfileView, AdminStudentProfileView,
    TransactionsView, AllContactsView, AdminMentorTuitionStatusView,
    QRCodeListCreateView, QRRedirectView, QRCodeDetailView,
)
from api.views.chat_views import (
    ConversationListView, ConversationDetailView,
    SendMessageView, MarkConversationReadView,
)

urlpatterns = [
    # ── Auth ────────────────────────────────────────────────────────────────
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/verify-email', VerifyEmailView.as_view(), name='verify-email'),
    path('auth/resend-otp', ResendOTPView.as_view(), name='resend-otp'),
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/logout', LogoutView.as_view(), name='logout'),
    path('auth/refresh', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me', MeView.as_view(), name='me'),
    path('auth/forgot-password', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/delete-account', DeleteAccountView.as_view(), name='delete-account'),

    # ── Mentors ──────────────────────────────────────────────────────────────
    path('mentors/approved', ApprovedMentorsView.as_view(), name='approved-mentors'),
    path('mentors/initiate-payment', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('mentors/verify-payment', VerifyPaymentView.as_view(), name='verify-payment'),
    path('mentors/mark-paid', MarkPaidView.as_view(), name='mark-paid'),
    path('mentors/profile', MentorProfileView.as_view(), name='mentor-profile'),
    path('mentors/student-found', MentorStudentFoundView.as_view(), name='mentor-student-found'),
    path('mentors/upload-photo', UploadPhotoView.as_view(), name='upload-photo'),
    path('mentors/enquiries', MentorEnquiriesView.as_view(), name='mentor-enquiries'),
    path('mentors/enquiries/<int:contact_id>/mark-read', MarkEnquiryReadView.as_view(), name='mark-read'),
    path('mentors/enquiries/<int:contact_id>/mark-replied', MarkEnquiryRepliedView.as_view(), name='mark-replied'),
    path('mentors/<int:mentor_id>', MentorDetailView.as_view(), name='mentor-detail'),

    # ── Students ─────────────────────────────────────────────────────────────
    path('students/dashboard', StudentDashboardView.as_view(), name='student-dashboard'),
    path('students/mentors', BrowseMentorsView.as_view(), name='browse-mentors'),
    path('students/profile', StudentProfileView.as_view(), name='student-profile'),
    path('students/contact-mentor', ContactMentorView.as_view(), name='contact-mentor'),
    path('students/contacts', MyContactsView.as_view(), name='my-contacts'),
    path('students/tutor-found', TutorFoundView.as_view(), name='tutor-found'),

    # ── Admin ────────────────────────────────────────────────────────────────
    path('admin/dashboard', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/pending-mentors', PendingMentorsView.as_view(), name='pending-mentors'),
    path('admin/mentors/<int:mentor_id>/approve', ApproveMentorView.as_view(), name='approve-mentor'),
    path('admin/mentors/<int:mentor_id>/reject', RejectMentorView.as_view(), name='reject-mentor'),
    path('admin/mentors/<int:mentor_id>/profile', AdminMentorProfileView.as_view(), name='admin-mentor-profile'),
    path('admin/students/<int:student_id>/profile', AdminStudentProfileView.as_view(), name='admin-student-profile'),
    path('admin/users', AllUsersView.as_view(), name='all-users'),
    path('admin/users/<int:user_id>/details', UserDetailsView.as_view(), name='user-details'),
    path('admin/users/<int:user_id>', UserDetailView.as_view(), name='user-detail'),
    path('admin/transactions', TransactionsView.as_view(), name='transactions'),
    path('admin/contacts', AllContactsView.as_view(), name='admin-contacts'),
    path('admin/mentors/tuition-status', AdminMentorTuitionStatusView.as_view(), name='mentor-tuition-status'),

    # ── QR Codes ─────────────────────────────────────────────────────────────
    path('qr', QRCodeListCreateView.as_view(), name='qr-list-create'),
    path('qr/<int:qr_id>', QRCodeDetailView.as_view(), name='qr-detail'),
    path('qr/<str:slug>/scan', QRRedirectView.as_view(), name='qr-redirect'),

    # ── Chat ─────────────────────────────────────────────────────────────────
    path('chat/conversations', ConversationListView.as_view(), name='conversations'),
    path('chat/conversations/<int:conversation_id>', ConversationDetailView.as_view(), name='conversation-detail'),
    path('chat/conversations/<int:conversation_id>/messages', SendMessageView.as_view(), name='send-message'),
    path('chat/conversations/<int:conversation_id>/mark-read', MarkConversationReadView.as_view(), name='mark-conversation-read'),
]
