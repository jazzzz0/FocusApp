from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field

from .models import Notification
from posts.serializers import AuthorSerializer


class NotificationSerializer(serializers.ModelSerializer):

    recipient = serializers.StringRelatedField(read_only=True)
    actor = AuthorSerializer(read_only=True)

    # enlace genérico al objeto relacionado (post, comentario, etc)
    target_id = serializers.IntegerField(source="object_id", read_only=True)
    target_type = serializers.CharField(source="content_type.model", read_only=True)
    message = serializers.SerializerMethodField()

    @extend_schema_field(serializers.CharField())
    def get_message(self, obj):
        return obj.message

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "actor",
            "type",
            "target_id",
            "target_type",
            "is_read",
            "created_at",
            "message",
        ]
        read_only_fields = ["id", "created_at", "message"]
        depth = 1
