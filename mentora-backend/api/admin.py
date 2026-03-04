from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from api.models import User, Mentor, Student, Payment, Contact


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(Mentor)
class MentorAdmin(admin.ModelAdmin):
    list_display = ('user', 'approval_status', 'city', 'hourly_rate', 'created_at')
    list_filter = ('approval_status', 'gender')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'expertise')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'headline', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('mentor', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('status',)


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('mentor', 'student_name', 'student_email', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('student_email', 'student_name')
