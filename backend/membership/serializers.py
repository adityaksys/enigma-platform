
from rest_framework import serializers

from .models import MembershipApplication, Membership



class MembershipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipApplication
        fields = [
            "id",
            "motivation",
            "interests",
            "status",
            "review_note",
            "submitted_at",
            "reviewed_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "review_note",
            "submitted_at",
            "reviewed_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")

        if (
            request
            and request.user.is_authenticated
            and Membership.objects.filter(
                user=request.user,
                status=Membership.Status.ACTIVE,
            ).exists()
        ):
            raise serializers.ValidationError({
                "detail": "You already have an active ENIGMA membership."
            })

        if (
            request
            and request.user.is_authenticated
            and MembershipApplication.objects.filter(
                applicant=request.user,
                status=MembershipApplication.Status.PENDING,
            ).exists()
        ):
            raise serializers.ValidationError({
                "detail": "You already have a pending membership application."
            })

        return attrs


class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = [
            "membership_id",
            "academic_year",
            "joined_at",
            "status",
        ]
        read_only_fields = fields
