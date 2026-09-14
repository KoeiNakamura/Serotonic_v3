from django.urls import path
from .views import (
    record_wake,
    record_sleep,
    DailyLogListView,
    SleepSessionListView,
    whoami,
    record_checkin,
    TodayCheckInsView,
    RecommendedBedtimeView,
)

urlpatterns = [
    path('wake/', record_wake),
    path('sleep/', record_sleep),
    path('logs/', DailyLogListView.as_view()),
    path('sessions/', SleepSessionListView.as_view()),
    path('me/', whoami),
    path('checkin/', record_checkin),
    path('checkin/today/', TodayCheckInsView.as_view()),
    path('recommendation/', RecommendedBedtimeView.as_view()),
]