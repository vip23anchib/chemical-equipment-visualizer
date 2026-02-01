from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from datetime import datetime


def generate_pdf(summary, equipment_list=None):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch,
                           leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#1a5490'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2c5aa0'),
        spaceAfter=8,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Title
    story.append(Paragraph("CHEMICAL EQUIPMENT ANALYSIS REPORT", title_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Date and time
    date_style = ParagraphStyle('DateStyle', parent=styles['Normal'], fontSize=10, 
                               textColor=colors.grey, alignment=TA_CENTER)
    story.append(Paragraph(f"Report Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", date_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Executive Summary Section
    story.append(Paragraph("EXECUTIVE SUMMARY", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Summary metrics in a nice table
    summary_data = [
        ['Metric', 'Value'],
        ['Total Equipment Count', f"{summary['total_equipment']}"],
        ['Average Flowrate', f"{summary['average_flowrate']:.2f} L/min"],
        ['Average Pressure', f"{summary['average_pressure']:.2f} bar"],
        ['Average Temperature', f"{summary['average_temperature']:.2f} °C"],
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a5490')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f0f0')]),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Equipment Type Distribution Chart
    story.append(Paragraph("EQUIPMENT TYPE DISTRIBUTION", heading_style))
    story.append(Spacer(1, 0.1*inch))
    
    equipment_dist = summary.get('equipment_type_distribution', {})
    if equipment_dist:
        # Create pie chart
        chart_buffer = _create_equipment_distribution_chart(equipment_dist)
        if chart_buffer:
            img = Image(chart_buffer, width=5*inch, height=3*inch)
            story.append(img)
    
    story.append(Spacer(1, 0.2*inch))
    
    # Equipment Type Details Table
    if equipment_dist:
        dist_data = [['Equipment Type', 'Count']]
        for eq_type, count in sorted(equipment_dist.items()):
            dist_data.append([str(eq_type), str(count)])
        
        dist_table = Table(dist_data, colWidths=[3*inch, 2*inch])
        dist_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5aa0')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(dist_table)
    
    # Equipment Details Section (if provided)
    if equipment_list and len(equipment_list) > 0:
        story.append(PageBreak())
        story.append(Paragraph("DETAILED EQUIPMENT LIST", heading_style))
        story.append(Spacer(1, 0.1*inch))
        
        # Build equipment details table
        eq_data = [['Name', 'Type', 'Flowrate (L/min)', 'Pressure (bar)', 'Temp (°C)']]
        for eq in equipment_list:
            eq_data.append([
                eq.get('name', 'N/A'),
                eq.get('type', 'N/A'),
                f"{eq.get('flowrate', 0):.2f}",
                f"{eq.get('pressure', 0):.2f}",
                f"{eq.get('temperature', 0):.2f}",
            ])
        
        eq_table = Table(eq_data, colWidths=[1.5*inch, 1.2*inch, 1.3*inch, 1.3*inch, 1.2*inch])
        eq_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a5490')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(eq_table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


def _create_equipment_distribution_chart(equipment_dist):
    """Create a pie chart for equipment distribution"""
    try:
        fig, ax = plt.subplots(figsize=(6, 4), facecolor='white')
        
        labels = list(equipment_dist.keys())
        sizes = list(equipment_dist.values())
        colors_list = ['#1a5490', '#2c5aa0', '#4a7cb8', '#6b94c4', '#8facce', '#a8c4d8']
        
        # Ensure we have enough colors
        while len(colors_list) < len(labels):
            colors_list.append(f'#{(sum([int(c[1+i*2:3+i*2], 16) for i in range(3)]) % (16**6)):06x}')
        
        wedges, texts, autotexts = ax.pie(sizes, labels=labels, autopct='%1.1f%%',
                                          colors=colors_list[:len(labels)],
                                          startangle=90, textprops={'fontsize': 10})
        
        # Make percentage text bold and white
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        ax.set_title('Equipment Type Distribution', fontsize=12, fontweight='bold', pad=20)
        
        # Save to buffer
        chart_buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(chart_buffer, format='png', dpi=150, bbox_inches='tight', facecolor='white')
        chart_buffer.seek(0)
        plt.close(fig)
        
        return chart_buffer
    except Exception as e:
        print(f"Error creating chart: {e}")
        plt.close('all')
        return None
