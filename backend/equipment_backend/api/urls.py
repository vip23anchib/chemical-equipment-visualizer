from django.urls import path
from .views import health_check, upload_csv, upload_history, get_summary, download_pdf, register_user

urlpatterns = [
    path('register/', register_user),
    path('health/', health_check),
    path('upload/', upload_csv),
    path('history/', upload_history),
    path('summary/<int:session_id>/', get_summary),
    path('report/', download_pdf),
    path('report/<int:session_id>/', download_pdf),
    path('download-pdf/', download_pdf),
]
