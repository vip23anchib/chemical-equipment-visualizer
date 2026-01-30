from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO


def generate_pdf(summary):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)

    y = 800
    p.setFont("Helvetica", 12)

    p.drawString(50, y, "Chemical Equipment Report")
    y -= 40

    for key, value in summary.items():
        p.drawString(50, y, f"{key}: {value}")
        y -= 20

    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer
