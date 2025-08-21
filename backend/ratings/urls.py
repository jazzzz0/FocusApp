from django.urls import path
from .views import RatingView

urlpatterns = [
    path('', RatingView.as_view(), name='rating-list'),
    path('<int:pk>/', RatingView.as_view(), name='rating-detail'),
]