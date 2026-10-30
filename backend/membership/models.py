
import uuid

from django.conf import settings
from django.db import models


class MembershipApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="membership_applications",
    )
    motivation = models.TextField()
    interests = models.TextField(blank=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_membership_applications",
    )
    review_note = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["applicant"],
                condition=models.Q(status="PENDING"),
                name="unique_pending_membership_application",
            ),
        ]

    def __str__(self):
        return f"{self.applicant} — {self.status}"


class Membership(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        SUSPENDED = "SUSPENDED", "Suspended"
        EXPIRED = "EXPIRED", "Expired"
        LEFT = "LEFT", "Left"

    application = models.OneToOneField(
        MembershipApplication,
        on_delete=models.PROTECT,
        related_name="membership",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="club_memberships",
    )
    membership_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )
    academic_year = models.CharField(max_length=9)
    joined_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )

    class Meta:
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.user} — {self.membership_id}"
