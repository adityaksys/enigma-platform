from django.conf import settings
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    full_name = models.CharField(max_length=150)
    bio = models.TextField(blank=True)

    college = models.CharField(max_length=200, blank=True)
    course = models.CharField(max_length=100, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    academic_year = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    
    skills = models.ManyToManyField(
    "skills.Skill",
    blank=True,
    related_name="profiles",
    )
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name