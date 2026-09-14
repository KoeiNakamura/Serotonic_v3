from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from .models import DailyLog, CheckIn
from .serializers import DailyLogSerializer, CheckInSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_wake(request):
    today = timezone.localdate()
    log, _ = DailyLog.objects.get_or_create(user=request.user, date=today)
    log.wake_time = timezone.now()
    log.save()
    return Response(DailyLogSerializer(log).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
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

    log, _ = DailyLog.objects.get_or_create(user=request.user, date=target_date)
    log.sleep_time = aware_dt
    log.save()
    return Response(DailyLogSerializer(log).data)


class DailyLogListView(ListAPIView):
    serializer_class = DailyLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyLog.objects.filter(user=self.request.user).order_by('-date')


def build_sleep_sessions(user):
    """
    Pairs each record's sleep_time with the wake_time that follows it,
    representing one continuous sleep session (evening -> next morning).

    A sleep_time recorded before noon is treated as a past-midnight bedtime
    and is paired with that same record's own wake_time (same wake_date).
    A sleep_time at or after noon is treated as a normal evening bedtime and
    is paired with the following day's wake_time (next record's date).

    Returns a list of dicts with sleep_date, sleep_time, wake_time,
    wake_date, and duration_minutes.
    """
    logs = list(DailyLog.objects.filter(user=user).order_by('date'))
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
        wake_date = wake_log.date if (wake_log and wake_time is not None) else None
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
            'wake_date': wake_date,
            'duration_minutes': duration_minutes,
        })

    for log in logs:
        if log.wake_time is not None and log.id not in consumed_wake_ids:
            sessions.append({
                'sleep_date': log.date,
                'sleep_time': None,
                'wake_time': log.wake_time,
                'wake_date': log.date,
                'duration_minutes': None,
            })

    sessions.sort(key=lambda s: s['sleep_date'], reverse=True)
    return sessions


class SleepSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = build_sleep_sessions(request.user)
        # wake_date is an internal detail used for recommendation calculation;
        # strip it out of the public sessions response to keep the API shape stable
        public_sessions = [
            {k: v for k, v in s.items() if k != 'wake_date'} for s in sessions
        ]
        return Response(public_sessions)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def whoami(request):
    return Response({'username': request.user.username})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_checkin(request):
    timing = request.data.get('timing')
    rating = request.data.get('rating')

    if timing not in ('wake', 'midday', 'bedtime'):
        return Response({'error': 'invalid timing'}, status=400)

    try:
        rating = int(rating)
        if not (1 <= rating <= 5):
            raise ValueError
    except (TypeError, ValueError):
        return Response({'error': 'rating must be an integer 1-5'}, status=400)

    today = timezone.localdate()
    checkin, _ = CheckIn.objects.update_or_create(
        user=request.user,
        date=today,
        timing=timing,
        defaults={'rating': rating},
    )
    return Response(CheckInSerializer(checkin).data)


class TodayCheckInsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        checkins = CheckIn.objects.filter(user=request.user, date=today)
        data = {c.timing: c.rating for c in checkins}
        return Response(data)


class RecommendedBedtimeView(APIView):
    """
    Recommends a bedtime by taking a satisfaction-weighted average of past
    bedtimes. Every check-in (regardless of its timing type) is treated as
    an evaluation of the sleep session that most recently ended that same
    morning — i.e. a check-in dated X reflects on the session whose
    wake_date is X.
    """

    permission_classes = [IsAuthenticated]
    MIN_SAMPLES = 3

    def get(self, request):
        sessions = build_sleep_sessions(request.user)

        checkins = CheckIn.objects.filter(user=request.user)
        ratings_by_date = {}
        for c in checkins:
            ratings_by_date.setdefault(c.date, []).append(c.rating)

        weighted_minutes = []
        for s in sessions:
            if s['sleep_time'] is None or s['wake_date'] is None:
                continue
            ratings = ratings_by_date.get(s['wake_date'])
            if not ratings:
                continue

            score = sum(ratings) / len(ratings)

            local_dt = timezone.localtime(s['sleep_time'])
            hour = local_dt.hour + 24 if local_dt.hour < 12 else local_dt.hour
            minutes = hour * 60 + local_dt.minute

            weighted_minutes.append((minutes, score))

        sample_size = len(weighted_minutes)

        if sample_size < self.MIN_SAMPLES:
            return Response({
                'recommended_bedtime': None,
                'sample_size': sample_size,
                'min_samples': self.MIN_SAMPLES,
            })

        total_score = sum(score for _, score in weighted_minutes)
        avg_minutes = sum(m * score for m, score in weighted_minutes) / total_score
        avg_minutes = round(avg_minutes) % (24 * 60)

        hour = avg_minutes // 60
        minute = avg_minutes % 60

        return Response({
            'recommended_bedtime': f'{hour:02d}:{minute:02d}',
            'sample_size': sample_size,
            'min_samples': self.MIN_SAMPLES,
        })