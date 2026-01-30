from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from django.http import FileResponse
from .pdf_utils import generate_pdf



import pandas as pd

from .models import UploadRecord

# Protect API and modify decorators to require authentication
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_check(request):
    return Response({
        "status": "ok",
        "message": "Backend is working"
    })


@api_view(['POST'])

def upload_csv(request):
    if 'file' not in request.FILES:
        return Response(
            {"error": "No file uploaded"},
            status=400
        )

    file = request.FILES['file']

    try:
        df = pd.read_csv(file)
    except Exception as e:
        return Response(
            {"error": f"Invalid CSV file: {str(e)}"},
            status=400
        )

    required_columns = {
        'Equipment Name',
        'Type',
        'Flowrate',
        'Pressure',
        'Temperature'
    }

    if not required_columns.issubset(df.columns):
        return Response(
            {"error": "CSV missing required columns"},
            status=400
        )

    summary = {
        "total_equipment": int(len(df)),
        "average_flowrate": round(df['Flowrate'].mean(), 2),
        "average_pressure": round(df['Pressure'].mean(), 2),
        "average_temperature": round(df['Temperature'].mean(), 2),
        "equipment_type_distribution": df['Type'].value_counts().to_dict()
    }

    # Save to database
    UploadRecord.objects.create(
        total_equipment=summary["total_equipment"],
        average_flowrate=summary["average_flowrate"],
        average_pressure=summary["average_pressure"],
        average_temperature=summary["average_temperature"],
        equipment_type_distribution=summary["equipment_type_distribution"]
    )

    # Keep only last 5 uploads
    if UploadRecord.objects.count() > 5:
        oldest = UploadRecord.objects.order_by('uploaded_at').first()
        oldest.delete()

    return Response(summary)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upload_history(request):
    records = UploadRecord.objects.order_by('-uploaded_at')[:5]

    data = []
    for record in records:
        data.append({
            "uploaded_at": record.uploaded_at,
            "total_equipment": record.total_equipment,
            "average_flowrate": record.average_flowrate,
            "average_pressure": record.average_pressure,
            "average_temperature": record.average_temperature,
            "equipment_type_distribution": record.equipment_type_distribution
        })

    return Response(data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_pdf(request):
    record = UploadRecord.objects.order_by('-uploaded_at').first()

    if not record:
        return Response({"error": "No data available"}, status=400)

    summary = {
        "total_equipment": record.total_equipment,
        "average_flowrate": record.average_flowrate,
        "average_pressure": record.average_pressure,
        "average_temperature": record.average_temperature,
        "equipment_type_distribution": record.equipment_type_distribution
    }

    pdf_buffer = generate_pdf(summary)
    return FileResponse(pdf_buffer, as_attachment=True, filename="report.pdf")

