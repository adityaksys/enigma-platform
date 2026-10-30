from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthenticationApiTests(APITestCase):
    def test_user_can_register_log_in_and_refresh_an_access_token(self):
        registration_response = self.client.post(
            reverse("users:register"),
            {
                "username": "new_member",
                "email": "new_member@example.com",
                "password": "TestPass123!",
                "password_confirm": "TestPass123!",
            },
            format="json",
        )

        self.assertEqual(
            registration_response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertTrue(User.objects.filter(username="new_member").exists())
        self.assertNotIn("password", registration_response.data)

        login_response = self.client.post(
            reverse("users:login"),
            {"username": "new_member", "password": "TestPass123!"},
            format="json",
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)

        refresh_response = self.client.post(
            reverse("users:token_refresh"),
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)

    def test_registration_rejects_mismatched_passwords(self):
        response = self.client.post(
            reverse("users:register"),
            {
                "username": "mismatch_member",
                "email": "mismatch_member@example.com",
                "password": "TestPass123!",
                "password_confirm": "DifferentPass123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password_confirm", response.data)
