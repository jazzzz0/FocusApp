from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'actor', 'type', 'target', 'is_read', 'created_at')
    list_filter = ('is_read', 'recipient')
    search_fields = ('recipient__username', 'actor__username', 'target__title')
    ordering = ('-created_at',)