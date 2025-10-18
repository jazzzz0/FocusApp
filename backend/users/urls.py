from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LogoutView, UserView, CurrentUserView, SingleSessionTokenObtainPairView

urlpatterns = [
    # JWT endpoints
    path('token/', SingleSessionTokenObtainPairView.as_view(), name='token_obtain_pair'), # Login con sesión única
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Refresh token
    
    # User endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('<str:username>/', UserView.as_view(), name='user'),
] 