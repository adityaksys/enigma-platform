from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Skill
from .serializers import SkillSerializer


class SkillListView(generics.ListAPIView):
    queryset = Skill.objects.all().order_by("category", "name")
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]