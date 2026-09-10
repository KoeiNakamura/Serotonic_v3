from rest_framework import serializers
from .models import DailyLog

class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = ['id', 'date', 'wake_time', 'sleep_time']