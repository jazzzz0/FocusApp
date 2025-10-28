from django.urls import path
from .views import (
    CategoryListView,
    PostListCreateView,
    PostDetailView,
    DescriptionSuggestionView,
    PostCommentView,
)
from ratings.views import PostRatingsView
from .views import PostCommentDetailView

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="categories-list"),
    path("", PostListCreateView.as_view(), name="post-list"),
    path("<int:pk>/", PostDetailView.as_view(), name="post-detail"),
    # URLs relacionadas a ratings
    path(
        "<int:post_id>/ratings/averages/",
        PostRatingsView.as_view(),
        name="post-ratings-average",
    ),
    # URL Gemini
    path(
        "description-suggestions/",
        DescriptionSuggestionView.as_view(),
        name="suggest-post-descriptions",
    ),
    # URLs relacionadas a comentarios
    path("<int:post_id>/comments/", PostCommentView.as_view(), name="post-comments"),
    path(
        "<int:post_id>/comments/<int:pk>/",
        PostCommentDetailView.as_view(),
        name="post-comment-detail",
    ),
]
