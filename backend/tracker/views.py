from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
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
    time_str = request.data.get('time')
    if not time_str:
        return Response({'error': 'time is required (HH:MM)'}, status=400)

    try:
        hour, minute = map(int, time_str.split(':'))
        if not (0 <= hour < 24 and 0 <= minute < 60):
            raise ValueError
    except (ValueError, AttributeError):
        return Response({'error': 'invalid time format, expected HH:MM'}, status=400)

    yesterday = timezone.localdate() - timedelta(days=1)
    naive_dt = datetime.combine(yesterday, datetime.min.time()).replace(
        hour=hour, minute=minute
    )
    aware_dt = timezone.make_aware(naive_dt)

    log, _ = DailyLog.objects.get_or_create(date=yesterday)
    log.sleep_time = aware_dt
    log.save()
    return Response(DailyLogSerializer(log).data)


class DailyLogListView(ListAPIView):
    queryset = DailyLog.objects.all().order_by('-date')
    serializer_class = DailyLogSerializer


class SleepSessionListView(APIView):
    """
    Pairs each record's sleep_time with the following day's wake_time,
    representing one continuous sleep session (evening -> next morning).
    """

    def get(self, request):
        logs = list(DailyLog.objects.all().order_by('date'))
        sessions = []

        for i, log in enumerate(logs):
            wake_time = None
            if i + 1 < len(logs):
                wake_time = logs[i + 1].wake_time

            if log.sleep_time is None and wake_time is None:
                continue

            sessions.append({
                'sleep_date': log.date,
                'sleep_time': log.sleep_time,
                'wake_time': wake_time,
            })

        sessions.sort(key=lambda s: s['sleep_date'], reverse=True)
        return Response(sessions)