from django.urls import path
from .views import health_check, upload_csv, upload_history

from .views import download_pdf


urlpatterns = [
    path('health/', health_check),
    path('upload/', upload_csv),
    path('history/', upload_history),
    path('report/', download_pdf),

]
