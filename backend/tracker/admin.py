from django.contrib import admin
from .models import DailyLog, CheckIn

admin.site.register(DailyLog)
admin.site.register(CheckIn)