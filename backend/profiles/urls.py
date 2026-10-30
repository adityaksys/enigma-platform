from django.urls import path

from .views import MemberListView, MyProfileView

app_name = "profiles"

urlpatterns = [
    path("me/", MyProfileView.as_view(), name="my-profile"),
    path("members/", MemberListView.as_view(), name="member-list"),
]