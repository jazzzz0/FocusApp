from django.urls import path
from .views import RegisterView, LogoutView, UserView, CurrentUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('<str:username>/', UserView.as_view(), name='user'),
] 