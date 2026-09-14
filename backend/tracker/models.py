from django.conf import settings
from django.db import models


class DailyLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_logs',
    )
    date = models.DateField()
    wake_time = models.DateTimeField(null=True, blank=True)
    sleep_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user} - {self.date} (wake: {self.wake_time}, sleep: {self.sleep_time})"


class CheckIn(models.Model):
    TIMING_CHOICES = [
        ('wake', '起床時'),
        ('midday', '日中'),
        ('bedtime', '就寝前'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='check_ins',
    )
    date = models.DateField()
    timing = models.CharField(max_length=10, choices=TIMING_CHOICES)
    rating = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date', 'timing')

    def __str__(self):
        return f"{self.user} - {self.date} - {self.timing}: {self.rating}"