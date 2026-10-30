
from rest_framework.permissions import BasePermission

from users.models import User


class CanReviewMembershipApplications(BasePermission):
    message = "You are not authorized to review membership applications."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return (
            user.is_active
            and user.role in {
                User.Role.ADMIN,
                User.Role.SUPER_ADMIN,
            }
        )
