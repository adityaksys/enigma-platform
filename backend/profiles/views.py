from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Profile
from .serializers import ProfileSerializer


class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(
            user=self.request.user,
            defaults={
                "full_name": self.request.user.get_full_name()
                or self.request.user.username
            },
        )
        return profile


class MemberListView(generics.ListAPIView):
    queryset = Profile.objects.all().order_by("full_name")
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
