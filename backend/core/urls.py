from django.urls import path, include

urlpatterns = [
    path('users/', include('users.urls')),
    path('posts/', include('posts.urls')),
    path('ratings/', include('ratings.urls')),
    path('notifications/', include('notifications.urls')),
]