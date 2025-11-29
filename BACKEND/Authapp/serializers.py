from rest_framework import serializers
from .models import User


class UserDetailSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    # 🔥 Add display field (fix your error)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

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
            "is_citizen",
            "is_admin_role",
            "is_rescue_team",
            "is_assessment_team",
            "is_donor",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "role_display",
            "date_joined",
        ]

    # Validate Email
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")

        return value

    # Validate Password
    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Password is required.")
        return value
