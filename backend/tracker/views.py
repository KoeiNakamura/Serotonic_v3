from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from .models import DailyLog
from .serializers import DailyLogSerializer


@api_view(['POST'])
def record_wake(request):
    today = timezone.localdate()
    log, _ = DailyLog.objects.get_or_create(date=today)
    log.wake_time = timezone.now()
    log.save()
    return Response(DailyLogSerializer(log).data)


@api_view(['POST'])
def record_sleep(request):
    today = timezone.localdate()
    log, _ = DailyLog.objects.get_or_create(date=today)
    log.sleep_time = timezone.now()
    log.save()
    return Response(DailyLogSerializer(log).data)


class DailyLogListView(ListAPIView):
    queryset = DailyLog.objects.all().order_by('-date')
    serializer_class = DailyLogSerializer