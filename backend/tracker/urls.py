from django.urls import path
from .views import record_wake, record_sleep, DailyLogListView

urlpatterns = [
    path('wake/', record_wake),
    path('sleep/', record_sleep),
    path('logs/', DailyLogListView.as_view()),
]