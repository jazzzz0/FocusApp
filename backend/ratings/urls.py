from django.urls import path
from .views import RatingView

urlpatterns = [
    path('', RatingView.as_view(), name='post-list')
]