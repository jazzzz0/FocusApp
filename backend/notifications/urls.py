from django.urls import path
from .views import NotificationListView, UnreadNotificationView, UnreadNotificationCountView, MarkAsReadView, MarkAllAsReadView, SubscribeToPushView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications-list'),
    path('unread/', UnreadNotificationView.as_view(), name='notifications-unread'),
    path('count/', UnreadNotificationCountView.as_view(), name='notifications-count'),
    path('mark-as-read/<int:pk>/', MarkAsReadView.as_view(), name='notifications-mark-read'),
    path('mark-all-as-read/', MarkAllAsReadView.as_view(), name='notifications-mark-all-read'),
    path('subscribe/', SubscribeToPushView.as_view(), name='notifications-subscribe'),
]
