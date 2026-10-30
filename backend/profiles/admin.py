from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "college",
        "course",
        "branch",
        "academic_year",
        "created_at",
    )

    search_fields = (
        "full_name",
        "college",
        "user__username",
        "user__email",
    )

    list_filter = (
        "college",
        "course",
        "academic_year",
    )