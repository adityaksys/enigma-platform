
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Membership, MembershipApplication

User = get_user_model()


class MembershipApplicationTests(APITestCase):
    def setUp(self):
        self.member = User.objects.create_user(
            username="test_member",
            password="TestPass123!",
            role="MEMBER",
        )
        self.admin = User.objects.create_user(
            username="test_admin",
            password="TestPass123!",
            role="ADMIN",
        )

        self.application = MembershipApplication.objects.create(
            applicant=self.member,
            motivation="I want to contribute to ENIGMA.",
            interests="Web development, Python",
        )

    
    def test_member_cannot_submit_duplicate_pending_application(self):
        self.client.force_authenticate(user=self.member)

        # The member already has a pending application.
        # A second pending application should be rejected.
        response = self.client.post(
            reverse("membership:my-applications"),
            {
                "motivation": "I want to build projects.",
                "interests": "Python, Django",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(
            MembershipApplication.objects.filter(
                applicant=self.member,
                status=MembershipApplication.Status.PENDING,
            ).count(),
            1,
        )

    def test_member_can_create_list_and_retrieve_an_application(self):
        applicant = User.objects.create_user(
            username="new_applicant",
            password="TestPass123!",
            role="MEMBER",
        )
        self.client.force_authenticate(user=applicant)

        create_response = self.client.post(
            reverse("membership:my-applications"),
            {
                "motivation": "I want to learn and contribute.",
                "interests": "Design systems, Python",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            create_response.data["status"],
            MembershipApplication.Status.PENDING,
        )

        list_response = self.client.get(
            reverse("membership:my-applications")
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(
            list_response.data[0]["id"], create_response.data["id"]
        )

        detail_response = self.client.get(
            reverse(
                "membership:application-detail",
                kwargs={"pk": create_response.data["id"]},
            )
        )
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            detail_response.data["motivation"],
            "I want to learn and contribute.",
        )

    def test_jwt_login_authenticates_the_membership_application_flow(self):
        applicant = User.objects.create_user(
            username="jwt_applicant",
            password="TestPass123!",
            role="MEMBER",
        )
        login_response = self.client.post(
            reverse("users:login"),
            {"username": applicant.username, "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )
        create_response = self.client.post(
            reverse("membership:my-applications"),
            {"motivation": "I want to build with the club."},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        list_response = self.client.get(
            reverse("membership:my-applications")
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        detail_response = self.client.get(
            reverse(
                "membership:application-detail",
                kwargs={"pk": create_response.data["id"]},
            )
        )
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

    def test_my_membership_returns_null_without_a_membership(self):
        self.client.force_authenticate(user=self.member)

        response = self.client.get(reverse("membership:my-membership"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["membership"])

    def test_member_cannot_retrieve_another_members_application(self):
        other_member = User.objects.create_user(
            username="other_member",
            password="TestPass123!",
            role="MEMBER",
        )
        self.client.force_authenticate(user=other_member)

        response = self.client.get(
            reverse(
                "membership:application-detail",
                kwargs={"pk": self.application.pk},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_my_membership_returns_only_the_authenticated_users_membership(self):
        self.application.status = MembershipApplication.Status.APPROVED
        self.application.save(update_fields=["status"])
        membership = Membership.objects.create(
            application=self.application,
            user=self.member,
            academic_year="2026-2027",
        )
        self.client.force_authenticate(user=self.member)

        response = self.client.get(reverse("membership:my-membership"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["membership"]["membership_id"],
            str(membership.membership_id),
        )
        self.assertEqual(
            response.data["membership"]["status"], Membership.Status.ACTIVE
        )

    def test_active_member_cannot_submit_another_application(self):
        self.application.status = MembershipApplication.Status.APPROVED
        self.application.save(update_fields=["status"])
        Membership.objects.create(
            application=self.application,
            user=self.member,
            academic_year="2026-2027",
        )
        self.client.force_authenticate(user=self.member)

        response = self.client.post(
            reverse("membership:my-applications"),
            {"motivation": "I would like to apply again."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["detail"][0],
            "You already have an active ENIGMA membership.",
        )


    def test_member_cannot_review_applications(self):
        self.client.force_authenticate(user=self.member)

        response = self.client.post(
            reverse(
                "membership:review-application",
                kwargs={"pk": self.application.pk},
            ),
            {"decision": "APPROVED"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.application.refresh_from_db()
        self.assertEqual(
            self.application.status,
            MembershipApplication.Status.PENDING,
        )

    def test_admin_can_approve_application(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse(
                "membership:review-application",
                kwargs={"pk": self.application.pk},
            ),
            {
                "decision": "APPROVED",
                "review_note": "Welcome to ENIGMA!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.application.refresh_from_db()
        self.assertEqual(
            self.application.status,
            MembershipApplication.Status.APPROVED,
        )
        self.assertTrue(
            Membership.objects.filter(
                application=self.application,
                user=self.member,
                status=Membership.Status.ACTIVE,
            ).exists()
        )

    def test_rejected_application_does_not_create_membership(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse(
                "membership:review-application",
                kwargs={"pk": self.application.pk},
            ),
            {
                "decision": "REJECTED",
                "review_note": "Please apply again with more details.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            Membership.objects.filter(
                application=self.application
            ).exists()
        )

    def test_application_cannot_be_reviewed_twice(self):
        self.client.force_authenticate(user=self.admin)

        url = reverse(
            "membership:review-application",
            kwargs={"pk": self.application.pk},
        )

        first_response = self.client.post(
            url, {"decision": "APPROVED"}, format="json"
        )
        second_response = self.client.post(
            url, {"decision": "REJECTED"}, format="json"
        )

        self.assertEqual(first_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            second_response.status_code,
            status.HTTP_409_CONFLICT,
        )
        self.assertEqual(
            Membership.objects.filter(
                application=self.application
            ).count(),
            1,
        )
