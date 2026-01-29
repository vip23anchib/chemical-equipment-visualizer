from django.urls import path
from .views import health_check, upload_csv, upload_history

urlpatterns = [
    path('health/', health_check),
    path('upload/', upload_csv),
    path('history/', upload_history),
]
