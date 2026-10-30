
from django.db import transaction
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User

from .models import Membership, MembershipApplication
from .permissions import CanReviewMembershipApplications
from .serializers import (
    MembershipApplicationSerializer,
    MembershipSerializer,
)


class MyMembershipApplicationView(generics.ListCreateAPIView):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MembershipApplication.objects.filter(
            applicant=self.request.user
        ).order_by("-submitted_at")

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)


class MembershipApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MembershipApplication.objects.filter(
            applicant=self.request.user
        )


class MyMembershipView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        membership = (
            Membership.objects.filter(user=request.user)
            .order_by("-joined_at")
            .first()
        )

        return Response(
            {
                "membership": (
                    MembershipSerializer(membership).data
                    if membership is not None
                    else None
                )
            }
        )


class AdminMembershipApplicationListView(generics.ListAPIView):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [
        IsAuthenticated,
        CanReviewMembershipApplications,
    ]

    def get_queryset(self):
        queryset = MembershipApplication.objects.select_related(
            "applicant", "reviewed_by"
        )

        application_status = self.request.query_params.get("status")
        if application_status:
            if application_status not in MembershipApplication.Status.values:
                return queryset.none()
            queryset = queryset.filter(status=application_status)

        return queryset.order_by("-submitted_at")


class ReviewMembershipApplicationView(APIView):
    permission_classes = [
        IsAuthenticated,
        CanReviewMembershipApplications,
    ]

    @transaction.atomic
    def post(self, request, pk):
        decision = request.data.get("decision")
        review_note = request.data.get("review_note", "")

        if decision not in {
            MembershipApplication.Status.APPROVED,
            MembershipApplication.Status.REJECTED,
        }:
            return Response(
                {"detail": "Decision must be APPROVED or REJECTED."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(review_note, str):
            return Response(
                {"detail": "review_note must be text."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application = (
            MembershipApplication.objects.select_for_update()
            .filter(pk=pk)
            .first()
        )

        if application is None:
            return Response(
                {"detail": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if application.status != MembershipApplication.Status.PENDING:
            return Response(
                {"detail": "Only pending applications can be reviewed."},
                status=status.HTTP_409_CONFLICT,
            )

        application.status = decision
        application.reviewed_by = request.user
        application.review_note = review_note
        application.reviewed_at = timezone.now()
        application.save(
            update_fields=[
                "status",
                "reviewed_by",
                "review_note",
                "reviewed_at",
            ]
        )

        if decision == MembershipApplication.Status.APPROVED:
            Membership.objects.create(
                application=application,
                user=application.applicant,
                academic_year=timezone.localdate().strftime("%Y")
                + "-"
                + str(timezone.localdate().year + 1),
            )

        return Response(
            {
                "application": MembershipApplicationSerializer(
                    application
                ).data,
                "membership": (
                    MembershipSerializer(
                        Membership.objects.get(application=application)
                    ).data
                    if decision == MembershipApplication.Status.APPROVED
                    else None
                ),
            },
            status=status.HTTP_200_OK,
        )
