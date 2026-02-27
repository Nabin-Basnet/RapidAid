from rest_framework import serializers
from .models import User


class UserDetailSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    profile_photo_url = serializers.SerializerMethodField(read_only=True)
    role_display = serializers.CharField(
        source='get_role_display',
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "profile_photo",
            "profile_photo_url",
            "password",
            "role",
            "role_display",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "profile_photo_url",
            "role_display",
            "date_joined",
        ]

    def get_profile_photo_url(self, obj):
        if not obj.profile_photo:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.profile_photo.url)
        return obj.profile_photo.url

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
