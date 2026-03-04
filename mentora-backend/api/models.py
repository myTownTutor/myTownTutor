from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)


class UserManager(BaseUserManager):
    """Custom manager for email-based authentication."""

    def create_user(self, email, first_name, last_name, role, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(
            email, first_name, last_name, 'super_admin', password, **extra_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('mentor', 'Mentor'),
        ('student', 'Student'),
    ]

    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_email_verified = models.BooleanField(default=False)
    email_otp = models.CharField(max_length=6, blank=True, null=True)
    email_otp_expires_at = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'is_email_verified': self.is_email_verified,
        }

    def __str__(self):
        return self.email


class Mentor(models.Model):
    APPROVAL_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='mentor_profile'
    )
    bio = models.TextField(blank=True, null=True)
    expertise = models.CharField(max_length=500, blank=True, null=True)
    experience_years = models.IntegerField(blank=True, null=True)
    monthly_rate = models.FloatField(blank=True, null=True)
    hourly_rate = models.FloatField(blank=True, null=True)
    profile_photo_url = models.CharField(max_length=500, blank=True, null=True)
    instagram_url = models.CharField(max_length=255, blank=True, null=True)
    facebook_url = models.CharField(max_length=255, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    university = models.CharField(max_length=255, blank=True, null=True)
    education = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    resume_url = models.CharField(max_length=500, blank=True, null=True)
    student_id = models.CharField(max_length=100, blank=True, null=True)
    approval_status = models.CharField(
        max_length=20, choices=APPROVAL_CHOICES, default='pending_payment'
    )
    rejected_reason = models.TextField(blank=True, null=True)
    student_found = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mentors'

    def to_dict(self, include_email=True, include_student_id=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'bio': self.bio,
            'expertise': self.expertise,
            'experience_years': self.experience_years,
            'hourly_rate': self.hourly_rate,
            'monthly_rate': self.monthly_rate,
            'profile_photo_url': self.profile_photo_url,
            'instagram_url': self.instagram_url,
            'facebook_url': self.facebook_url,
            'age': self.age,
            'gender': self.gender,
            'university': self.university,
            'education': self.education,
            'city': self.city,
            'resume_url': self.resume_url,
            'approval_status': self.approval_status,
            'rejection_reason': self.rejected_reason,
            'student_found': self.student_found,
            'created_at': self.created_at.isoformat(),
        }
        if include_email:
            data['email'] = self.user.email
        if include_student_id and self.student_id:
            data['student_id'] = self.student_id
        return data

    def __str__(self):
        return f"Mentor: {self.user.email}"


class Student(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='student_profile'
    )
    headline = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    tutor_found = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'students'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'email': self.user.email,
            'headline': self.headline,
            'bio': self.bio,
            'tutor_found': self.tutor_found,
            'created_at': self.created_at.isoformat(),
        }

    def __str__(self):
        return f"Student: {self.user.email}"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    mentor = models.ForeignKey(
        Mentor, on_delete=models.CASCADE, related_name='payments'
    )
    amount = models.FloatField()
    currency = models.CharField(max_length=10, default='INR')
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(
        max_length=255, blank=True, null=True, unique=True
    )
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'

    def to_dict(self):
        return {
            'id': self.id,
            'mentor_id': self.mentor_id,
            'amount': self.amount,
            'currency': self.currency,
            'razorpay_order_id': self.razorpay_order_id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }


class Conversation(models.Model):
    """One conversation thread between a student and a mentor."""
    mentor = models.ForeignKey(
        Mentor, on_delete=models.CASCADE, related_name='conversations'
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversations'
        unique_together = ('mentor', 'student')
        ordering = ['-updated_at']

    def last_message(self):
        return self.messages.order_by('-created_at').first()

    def unread_count(self, user):
        """Messages sent by the other party that this user hasn't read yet."""
        return self.messages.filter(is_read=False).exclude(sender=user).count()

    def to_dict(self, for_user=None):
        last = self.last_message()
        return {
            'id': self.id,
            'mentor_id': self.mentor_id,
            'mentor_name': f"{self.mentor.user.first_name} {self.mentor.user.last_name}",
            'mentor_photo': self.mentor.profile_photo_url,
            'student_id': self.student_id,
            'student_name': f"{self.student.user.first_name} {self.student.user.last_name}",
            'last_message': last.content if last else None,
            'last_message_at': last.created_at.isoformat() if last else self.created_at.isoformat(),
            'unread_count': self.unread_count(for_user) if for_user else 0,
            'created_at': self.created_at.isoformat(),
        }

    def __str__(self):
        return f"Conversation: {self.student.user.email} ↔ {self.mentor.user.email}"


class ChatMessage(models.Model):
    """A single message inside a conversation."""
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_messages'
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender_id': self.sender_id,
            'sender_name': f"{self.sender.first_name} {self.sender.last_name}",
            'sender_role': self.sender.role,
            'content': self.content,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
        }

    def __str__(self):
        return f"Message by {self.sender.email}"


class Contact(models.Model):
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('read', 'Read'),
        ('replied', 'Replied'),
    ]

    mentor = models.ForeignKey(
        Mentor, on_delete=models.CASCADE, related_name='contacts'
    )
    student = models.ForeignKey(
        Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='contacts'
    )
    student_email = models.EmailField()
    student_name = models.CharField(max_length=120)
    student_phone = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contacts'

    def to_dict(self):
        return {
            'id': self.id,
            'mentor_id': self.mentor_id,
            'mentor_name': f"{self.mentor.user.first_name} {self.mentor.user.last_name}",
            'student_email': self.student_email,
            'student_name': self.student_name,
            'student_phone': self.student_phone,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }
