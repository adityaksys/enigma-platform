
from django.urls import path

from .views import (
    AdminMembershipApplicationListView,
    MembershipApplicationDetailView,
    MyMembershipView,
    MyMembershipApplicationView,
    ReviewMembershipApplicationView,
)

app_name = "membership"

urlpatterns = [
    path("me/", MyMembershipView.as_view(), name="my-membership"),
    path(
        "applications/",
        MyMembershipApplicationView.as_view(),
        name="my-applications",
    ),
    path(
        "applications/<int:pk>/",
        MembershipApplicationDetailView.as_view(),
        name="application-detail",
    ),
    path(
        "admin/applications/",
        AdminMembershipApplicationListView.as_view(),
        name="admin-applications",
    ),
    path(
        "admin/applications/<int:pk>/review/",
        ReviewMembershipApplicationView.as_view(),
        name="review-application",
    ),
]
