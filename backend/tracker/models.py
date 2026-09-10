from django.db import models

class DailyLog(models.Model):
    date = models.DateField(unique=True)
    wake_time = models.DateTimeField(null=True, blank=True)
    sleep_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.date} (wake: {self.wake_time}, sleep: {self.sleep_time})"