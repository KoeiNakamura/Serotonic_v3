from rest_framework import serializers
from .models import DailyLog, CheckIn


class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = ['id', 'date', 'wake_time', 'sleep_time']


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ['id', 'date', 'timing', 'rating', 'created_at']