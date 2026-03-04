"""
Chat views — comment-style messaging between students and mentors.

POST /api/chat/conversations              — student starts / reopens a chat with a mentor
GET  /api/chat/conversations              — list all my conversations (student or mentor)
GET  /api/chat/conversations/<id>         — get conversation detail + messages
POST /api/chat/conversations/<id>/messages — send a message
POST /api/chat/conversations/<id>/mark-read — mark incoming messages as read
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models import Mentor, Student, Conversation, ChatMessage


class ConversationListView(APIView):
    """
    POST — student opens (or retrieves existing) conversation with a mentor.
    GET  — list all conversations for the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    # ── GET /api/chat/conversations ────────────────────────────────────────
    def get(self, request):
        user = request.user

        if user.role == 'student':
            try:
                student = user.student_profile
            except Student.DoesNotExist:
                return Response({'conversations': []})
            qs = (
                Conversation.objects
                .filter(student=student)
                .select_related('mentor__user', 'student__user')
                .prefetch_related('messages')
                .order_by('-updated_at')
            )

        elif user.role == 'mentor':
            try:
                mentor = user.mentor_profile
            except Mentor.DoesNotExist:
                return Response({'conversations': []})
            qs = (
                Conversation.objects
                .filter(mentor=mentor)
                .select_related('mentor__user', 'student__user')
                .prefetch_related('messages')
                .order_by('-updated_at')
            )

        else:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'conversations': [c.to_dict(for_user=user) for c in qs]
        })

    # ── POST /api/chat/conversations ───────────────────────────────────────
    def post(self, request):
        user = request.user
        if user.role != 'student':
            return Response(
                {'error': 'Only students can start a conversation'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            student = user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'mentor_id' not in data:
            return Response({'error': 'mentor_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mentor = Mentor.objects.select_related('user').get(
                pk=data['mentor_id'], approval_status='approved'
            )
        except Mentor.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get existing or create new conversation
        conversation, created = Conversation.objects.get_or_create(
            mentor=mentor, student=student
        )

        # If an initial message is provided, post it
        initial_message = data.get('message', '').strip()
        if initial_message:
            msg = ChatMessage.objects.create(
                conversation=conversation,
                sender=user,
                content=initial_message,
            )
            # Bump updated_at on conversation
            conversation.save()

        return Response(
            {
                'conversation': conversation.to_dict(for_user=user),
                'created': created,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ConversationDetailView(APIView):
    """
    GET  — return conversation metadata + all messages (and mark incoming as read).
    """
    permission_classes = [IsAuthenticated]

    def _get_conversation(self, user, conversation_id):
        """Return conversation if user is a participant, else None."""
        try:
            conv = Conversation.objects.select_related(
                'mentor__user', 'student__user'
            ).get(pk=conversation_id)
        except Conversation.DoesNotExist:
            return None

        if user.role == 'mentor' and conv.mentor.user_id != user.id:
            return None
        if user.role == 'student' and conv.student.user_id != user.id:
            return None

        return conv

    def get(self, request, conversation_id):
        user = request.user
        conv = self._get_conversation(user, conversation_id)
        if not conv:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        # Mark messages sent by the other party as read
        conv.messages.filter(is_read=False).exclude(sender=user).update(is_read=True)

        messages = conv.messages.select_related('sender').order_by('created_at')

        return Response({
            'conversation': conv.to_dict(for_user=user),
            'messages': [m.to_dict() for m in messages],
        })


class SendMessageView(APIView):
    """POST /api/chat/conversations/<id>/messages — send a reply."""
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        user = request.user

        try:
            conv = Conversation.objects.select_related(
                'mentor__user', 'student__user'
            ).get(pk=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        # Make sure the user is a participant
        is_mentor = user.role == 'mentor' and conv.mentor.user_id == user.id
        is_student = user.role == 'student' and conv.student.user_id == user.id
        if not is_mentor and not is_student:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)

        msg = ChatMessage.objects.create(
            conversation=conv,
            sender=user,
            content=content,
        )
        # Bump conversation updated_at so it floats to the top of lists
        conv.save()

        return Response({'message': msg.to_dict()}, status=status.HTTP_201_CREATED)


class MarkConversationReadView(APIView):
    """POST /api/chat/conversations/<id>/mark-read"""
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        user = request.user

        try:
            conv = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

        is_mentor = user.role == 'mentor' and conv.mentor.user_id == user.id
        is_student = user.role == 'student' and conv.student.user_id == user.id
        if not is_mentor and not is_student:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        updated = conv.messages.filter(is_read=False).exclude(sender=user).update(is_read=True)
        return Response({'marked_read': updated})
