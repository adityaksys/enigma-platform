from rest_framework import serializers

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "full_name",
            "bio",
            "college",
            "course",
            "branch",
            "academic_year",
            "skills",
            "github_url",
            "linkedin_url",
            "portfolio_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]