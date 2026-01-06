from rest_framework import serializers
from .models import User


class UserDetailSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
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
            "password",
            "role",
            "role_display",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "role_display",
            "date_joined",
        ]

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
