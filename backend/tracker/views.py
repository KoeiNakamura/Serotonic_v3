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
        if not (0 <= hour < 48 and 0 <= minute < 60):
            raise ValueError
    except (ValueError, AttributeError):
        return Response(
            {'error': 'invalid time format, expected HH:MM (use 24+ for past-midnight times, e.g. 25:15)'},
            status=400,
        )

    yesterday = timezone.localdate() - timedelta(days=1)
    target_date = yesterday + timedelta(days=hour // 24)
    actual_hour = hour % 24

    naive_dt = datetime.combine(target_date, datetime.min.time()).replace(
        hour=actual_hour, minute=minute
    )
    aware_dt = timezone.make_aware(naive_dt)

    log, _ = DailyLog.objects.get_or_create(date=target_date)
    log.sleep_time = aware_dt
    log.save()
    return Response(DailyLogSerializer(log).data)


class DailyLogListView(ListAPIView):
    queryset = DailyLog.objects.all().order_by('-date')
    serializer_class = DailyLogSerializer


class SleepSessionListView(APIView):
    """
    Builds sleep sessions by pairing each sleep_time with the wake_time that
    follows it.

    A sleep_time recorded before noon is treated as a past-midnight bedtime
    and is paired with that same record's own wake_time. A sleep_time at or
    after noon is treated as a normal evening bedtime and is paired with the
    following day's wake_time.
    """

    def get(self, request):
        logs = list(DailyLog.objects.all().order_by('date'))
        sessions = []
        consumed_wake_ids = set()

        for i, log in enumerate(logs):
            if log.sleep_time is None:
                continue

            local_hour = timezone.localtime(log.sleep_time).hour

            if local_hour < 12:
                wake_log = log
            else:
                wake_log = logs[i + 1] if i + 1 < len(logs) else None

            wake_time = wake_log.wake_time if wake_log else None
            if wake_log and wake_time is not None:
                consumed_wake_ids.add(wake_log.id)

            duration_minutes = None
            if wake_time is not None:
                delta = wake_time - log.sleep_time
                duration_minutes = round(delta.total_seconds() / 60)

            sessions.append({
                'sleep_date': log.date,
                'sleep_time': log.sleep_time,
                'wake_time': wake_time,
                'duration_minutes': duration_minutes,
            })

        # sleep_timeとペアにならなかった、孤立したwake_timeも表示に含める
        for log in logs:
            if log.wake_time is not None and log.id not in consumed_wake_ids:
                sessions.append({
                    'sleep_date': log.date,
                    'sleep_time': None,
                    'wake_time': log.wake_time,
                    'duration_minutes': None,
                })

        sessions.sort(key=lambda s: s['sleep_date'], reverse=True)
        return Response(sessions)