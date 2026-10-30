from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        MEMBER = "MEMBER", "Member"
        MENTOR = "MENTOR", "Mentor"
        DEPARTMENT_LEAD = "DEPARTMENT_LEAD", "Department Lead"
        ADMIN = "ADMIN", "Admin"
        SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.MEMBER,
    )

    def __str__(self):
        return self.username