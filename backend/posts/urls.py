from django.urls import path
from .views import CategoryListView, PostView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='categories-list'),
    path("", PostView.as_view(), name='post-list'),
] 