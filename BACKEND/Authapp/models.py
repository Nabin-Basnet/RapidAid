from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone

from .managers import UserManager


class UserRole(models.TextChoices):
    CITIZEN = 'citizen', 'Citizen'
    ADMIN = 'admin', 'Admin'
    RESCUE_TEAM = 'rescue_team', 'Rescue Team'
    ASSESSMENT_TEAM = 'assessment_team', 'Assessment Team'


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)

    role = models.CharField(
        max_length=50,
        choices=UserRole.choices,
        default=UserRole.CITIZEN
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    def __str__(self):
        return self.email

    # ---- Role helpers ----
    @property
    def is_admin_role(self):
        return self.role == UserRole.ADMIN

    @property
    def is_rescue_team(self):
        return self.role == UserRole.RESCUE_TEAM

    @property
    def is_assessment_team(self):
        return self.role == UserRole.ASSESSMENT_TEAM
    
    @property
    def is_citizen(self):
        return self.role == UserRole.CITIZEN
