from django.urls import path
from .views import RegisterView, LogoutView, UserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('<str:username>/', UserView.as_view(), name='user'),
] 