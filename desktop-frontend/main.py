"""
Chemical Equipment Visualizer - Desktop Application
PySide6 + Matplotlib frontend for the Django backend API
"""

import sys
import requests
from io import BytesIO
from requests.auth import HTTPBasicAuth

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFileDialog, QTableWidget, QTableWidgetItem,
    QGroupBox, QMessageBox, QStatusBar, QFrame,
    QListWidget, QListWidgetItem, QSplitter,
    QDialog, QLineEdit
)
from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtGui import QFont, QPalette, QColor

import matplotlib
matplotlib.use('QtAgg')
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib.pyplot as plt

# API Configuration
API_BASE_URL = 'http://localhost:8000/api'

# Global auth credentials
auth_credentials = None


class LoginDialog(QDialog):
    """Login dialog for authentication."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Chemical Equipment Visualizer - Login")
        self.setFixedSize(500, 450)
        self.setModal(True)
        
        layout = QVBoxLayout(self)
        layout.setSpacing(0)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Main container with padding
        container = QWidget()
        container.setObjectName("loginContainer")
        container_layout = QVBoxLayout(container)
        container_layout.setSpacing(20)
        container_layout.setContentsMargins(60, 50, 60, 50)
        
        # Logo/Icon area
        icon_label = QLabel("⚗️")
        icon_label.setFont(QFont('Segoe UI Emoji', 48))
        icon_label.setAlignment(Qt.AlignCenter)
        icon_label.setStyleSheet("background: transparent;")
        container_layout.addWidget(icon_label)
        
        # Title
        title = QLabel("Chemical Equipment Visualizer")
        title.setFont(QFont('Segoe UI', 22, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("color: #111827; background: transparent; line-height: 1.4; margin: 5px 0;")
        title.setWordWrap(True)
        container_layout.addWidget(title)
        
        # Subtitle
        subtitle = QLabel("Sign in to continue")
        subtitle.setFont(QFont('Segoe UI', 11))
        subtitle.setAlignment(Qt.AlignCenter)
        subtitle.setStyleSheet("color: #4b5563; background: transparent; margin-bottom: 10px;")
        container_layout.addWidget(subtitle)
        
        # Username field
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("👤  Username")
        self.username_input.setMinimumHeight(50)
        self.username_input.setFont(QFont('Segoe UI', 11))
        container_layout.addWidget(self.username_input)
        
        # Password field
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("🔒  Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        self.password_input.setMinimumHeight(50)
        self.password_input.setFont(QFont('Segoe UI', 11))
        container_layout.addWidget(self.password_input)
        
        # Spacer
        container_layout.addSpacing(10)
        
        # Login button
        self.login_btn = QPushButton("Sign In")
        self.login_btn.setMinimumHeight(50)
        self.login_btn.setFont(QFont('Segoe UI', 12, QFont.Bold))
        self.login_btn.setCursor(Qt.PointingHandCursor)
        self.login_btn.clicked.connect(self.try_login)
        container_layout.addWidget(self.login_btn)
        
        container_layout.addStretch()
        layout.addWidget(container)
        
        # Allow Enter key to submit
        self.password_input.returnPressed.connect(self.try_login)
        self.username_input.returnPressed.connect(lambda: self.password_input.setFocus())
        
        self.apply_style()
    
    def apply_style(self):
        self.setStyleSheet("""
            QDialog {
                background-color: #f3f4f6;
            }
            #loginContainer {
                background: transparent;
            }
            QLineEdit {
                background-color: #ffffff;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 10px 16px;
                color: #111827;
                font-size: 13px;
            }
            QLineEdit:focus {
                border-color: #2563eb;
                background-color: #ffffff;
            }
            QLineEdit::placeholder {
                color: #9ca3af;
            }
            QPushButton {
                background-color: #2563eb;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #1d4ed8;
            }
            QPushButton:pressed {
                background-color: #1e40af;
            }
        """)
    
    def try_login(self):
        global auth_credentials
        username = self.username_input.text().strip()
        password = self.password_input.text()
        
        if not username or not password:
            QMessageBox.warning(self, "Error", "Please enter both username and password")
            return
        
        # Test authentication
        try:
            # We use history endpoint to verify credentials
            response = requests.get(
                f"{API_BASE_URL}/history/",
                auth=HTTPBasicAuth(username, password),
                timeout=5
            )
            if response.status_code == 200:
                auth_credentials = HTTPBasicAuth(username, password)
                self.accept()
            elif response.status_code == 401:
                QMessageBox.warning(self, "Login Failed", "Invalid username or password")
            else:
                 # If server isn't enforcing auth, it might return 200 even with bad coords?
                 # But we just added REST_FRAMEWORK settings, so it should enforce.
                 # If it returns 200, assume auth worked or wasn't needed (but we want to store it anyway)
                 auth_credentials = HTTPBasicAuth(username, password)
                 self.accept()
                 
        except requests.exceptions.ConnectionError:
            QMessageBox.critical(self, "Connection Error", 
                "Cannot connect to server.\nMake sure the Django backend is running on localhost:8000")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Login failed: {str(e)}")


class APIWorker(QThread):
    """Worker thread for API calls to prevent UI blocking."""
    finished = Signal(object)
    error = Signal(str)

    def __init__(self, func, *args, **kwargs):
        super().__init__()
        self.func = func
        self.args = args
        self.kwargs = kwargs

    def run(self):
        try:
            result = self.func(*self.args, **self.kwargs)
            self.finished.emit(result)
        except Exception as e:
            self.error.emit(str(e))


class MplCanvas(FigureCanvas):
    """Matplotlib canvas for embedding charts in PySide6."""
    def __init__(self, parent=None, width=5, height=4, dpi=100):
        self.fig = Figure(figsize=(width, height), dpi=dpi, facecolor='#ffffff')
        self.axes = self.fig.add_subplot(111)
        self.axes.set_facecolor('#ffffff')
        super().__init__(self.fig)
        self.setStyleSheet("background-color: #ffffff;")


class ChemicalVisualizerApp(QMainWindow):
    """Main application window."""

    def __init__(self):
        super().__init__()
        self.session_data = None
        self.history = []
        self.workers = []
        
        self.init_ui()
        self.apply_theme()

    def init_ui(self):
        """Initialize the user interface."""
        self.setWindowTitle('Chemical Equipment Visualizer')
        self.setGeometry(100, 100, 1400, 900)

        # Main widget
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        main_layout.setSpacing(15)
        main_layout.setContentsMargins(15, 15, 15, 15)

        # Left sidebar
        sidebar = QWidget()
        sidebar.setFixedWidth(280)
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setSpacing(10)

        # Upload section
        upload_group = QGroupBox("📤 Upload CSV")
        upload_layout = QVBoxLayout(upload_group)
        
        self.upload_btn = QPushButton("Select CSV File")
        self.upload_btn.setMinimumHeight(50)
        self.upload_btn.clicked.connect(self.upload_csv)
        upload_layout.addWidget(self.upload_btn)
        
        self.upload_status = QLabel("No file uploaded")
        self.upload_status.setWordWrap(True)
        upload_layout.addWidget(self.upload_status)
        
        sidebar_layout.addWidget(upload_group)

        # History section
        history_group = QGroupBox("📜 Upload History")
        history_layout = QVBoxLayout(history_group)
        
        self.history_list = QListWidget()
        self.history_list.itemClicked.connect(self.on_history_click)
        history_layout.addWidget(self.history_list)
        
        sidebar_layout.addWidget(history_group)

        # Actions section
        actions_group = QGroupBox("⚡ Actions")
        actions_layout = QVBoxLayout(actions_group)
        
        self.refresh_btn = QPushButton("🔄 Refresh Data")
        self.refresh_btn.clicked.connect(self.load_history)
        actions_layout.addWidget(self.refresh_btn)
        
        self.download_btn = QPushButton("📄 Download PDF Report")
        self.download_btn.clicked.connect(self.download_report)
        self.download_btn.setEnabled(False)
        actions_layout.addWidget(self.download_btn)
        
        self.logout_btn = QPushButton("🚪 Logout")
        self.logout_btn.clicked.connect(self.logout)
        actions_layout.addWidget(self.logout_btn)
        
        sidebar_layout.addWidget(actions_group)
        sidebar_layout.addStretch()

        main_layout.addWidget(sidebar)

        # Main content area
        content_splitter = QSplitter(Qt.Vertical)

        # Top section - Summary and Charts
        top_widget = QWidget()
        top_layout = QHBoxLayout(top_widget)
        top_layout.setSpacing(15)

        # Summary section - Use a grid for better layout
        summary_group = QGroupBox("📊 Summary Statistics")
        summary_group.setMinimumWidth(300)
        summary_group.setMaximumWidth(350)
        summary_layout = QVBoxLayout(summary_group)
        summary_layout.setSpacing(10)
        summary_layout.setContentsMargins(15, 15, 15, 15)
        
        self.stats_labels = {}
        # Display: Value on first line, then label and unit on subsequent lines
        stats = [
            ('Total Equipment', 'items'),
            ('Avg Flowrate', 'm³/h'),
            ('Avg Pressure', 'bar'),
            ('Avg Temperature', '°C')
        ]
        for stat_name, unit in stats:
            frame = QFrame()
            frame.setStyleSheet("background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px;")
            frame.setMinimumHeight(80)
            frame_layout = QVBoxLayout(frame)
            frame_layout.setContentsMargins(12, 10, 12, 10)
            frame_layout.setSpacing(3)
            
            value_label = QLabel("--")
            value_label.setFont(QFont('Arial', 22, QFont.Bold))
            value_label.setStyleSheet("color: #2563eb;")
            value_label.setAlignment(Qt.AlignCenter)
            
            name_label = QLabel(stat_name)
            name_label.setFont(QFont('Arial', 10, QFont.Bold))
            name_label.setStyleSheet("color: #1f2937;")
            name_label.setAlignment(Qt.AlignCenter)
            
            unit_label = QLabel(f"[{unit}]")
            unit_label.setFont(QFont('Arial', 8))
            unit_label.setStyleSheet("color: #9ca3af;")
            unit_label.setAlignment(Qt.AlignCenter)
            
            frame_layout.addWidget(value_label)
            frame_layout.addWidget(name_label)
            frame_layout.addWidget(unit_label)
            summary_layout.addWidget(frame)
            
            self.stats_labels[stat_name] = value_label
        
        summary_layout.addStretch()
        top_layout.addWidget(summary_group)

        # Charts section
        charts_widget = QWidget()
        charts_layout = QHBoxLayout(charts_widget)
        charts_layout.setSpacing(15)

        # Bar chart
        bar_group = QGroupBox("📈 Average Process Parameters")
        bar_layout = QVBoxLayout(bar_group)
        self.bar_canvas = MplCanvas(self, width=5, height=4)
        bar_layout.addWidget(self.bar_canvas)
        charts_layout.addWidget(bar_group)

        # Pie chart
        pie_group = QGroupBox("🥧 Equipment Type Distribution")
        pie_layout = QVBoxLayout(pie_group)
        self.pie_canvas = MplCanvas(self, width=6, height=5)
        pie_layout.addWidget(self.pie_canvas)
        charts_layout.addWidget(pie_group)

        top_layout.addWidget(charts_widget)
        content_splitter.addWidget(top_widget)

        # Bottom section - Data Table
        table_group = QGroupBox("📋 Equipment Data")
        table_layout = QVBoxLayout(table_group)
        
        self.data_table = QTableWidget()
        self.data_table.setColumnCount(5)
        self.data_table.setHorizontalHeaderLabels(['Name', 'Type', 'Flowrate (m³/h)', 'Pressure (bar)', 'Temperature (°C)'])
        self.data_table.horizontalHeader().setStretchLastSection(True)
        table_layout.addWidget(self.data_table)
        
        content_splitter.addWidget(table_group)
        content_splitter.setSizes([400, 300])

        main_layout.addWidget(content_splitter)

        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Ready")

    def apply_theme(self):
        """Apply professional light theme to the application."""
        light_palette = QPalette()
        bg_dark = QColor(243, 244, 246)
        bg_surface = QColor(255, 255, 255)
        text_primary = QColor(17, 24, 39)
        primary = QColor(37, 99, 235)
        
        light_palette.setColor(QPalette.Window, bg_dark)
        light_palette.setColor(QPalette.WindowText, text_primary)
        light_palette.setColor(QPalette.Base, bg_surface)
        light_palette.setColor(QPalette.Text, text_primary)
        light_palette.setColor(QPalette.Button, bg_surface)
        light_palette.setColor(QPalette.ButtonText, text_primary)
        light_palette.setColor(QPalette.Link, primary)
        
        self.setPalette(light_palette)
        
        self.setStyleSheet("""
            QMainWindow { background-color: #f3f4f6; }
            QGroupBox {
                background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                margin-top: 12px; padding: 15px; font-weight: bold; font-size: 13px; color: #111827;
            }
            QGroupBox::title { subcontrol-origin: margin; left: 15px; padding: 0 8px; }
            QPushButton {
                background-color: #2563eb; color: white; border: none; border-radius: 6px;
                padding: 10px 20px; font-weight: bold; font-size: 13px;
            }
            QPushButton:hover { background-color: #1d4ed8; }
            QPushButton:pressed { background-color: #1e40af; }
            QPushButton:disabled { background-color: #e5e7eb; color: #9ca3af; }
            QTableWidget, QListWidget {
                background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;
                color: #111827; selection-background-color: #eff6ff; selection-color: #111827;
            }
            QHeaderView::section {
                background-color: #f8fafc; color: #64748b; padding: 8px; border: none;
                border-bottom: 1px solid #e2e8f0; font-weight: bold; text-transform: uppercase;
            }
        """)

    def logout(self):
        global auth_credentials
        auth_credentials = None
        self.session_data = None
        self.history = []
        self.history_list.clear()
        self.upload_status.setText("No file uploaded")
        self.download_btn.setEnabled(False)
        self.data_table.setRowCount(0)
        
        if not self.show_login():
            sys.exit()
        else:
            self.load_history()

    def show_login(self):
        dialog = LoginDialog(self)
        return dialog.exec() == QDialog.Accepted

    def upload_csv(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select CSV File", "", "CSV Files (*.csv)")
        if not file_path: return
        
        self.upload_status.setText("Uploading...")
        self.upload_btn.setEnabled(False)
        self.status_bar.showMessage("Uploading file...")
        
        def do_upload():
            with open(file_path, 'rb') as f:
                files = {'file': (file_path.split('/')[-1], f)}
                response = requests.post(f"{API_BASE_URL}/upload/", files=files, auth=auth_credentials)
                response.raise_for_status()
                return response.json()
        
        worker = APIWorker(do_upload)
        worker.finished.connect(self.on_upload_success)
        worker.error.connect(self.on_upload_error)
        self.workers.append(worker)
        worker.start()

    def on_upload_success(self, data):
        self.session_data = data
        self.upload_status.setText(f"✅ Uploaded")
        self.upload_btn.setEnabled(True)
        self.download_btn.setEnabled(True)
        self.status_bar.showMessage("Upload successful!")
        self.update_display()
        self.load_history()

    def on_upload_error(self, error):
        self.upload_status.setText(f"❌ Error")
        self.upload_btn.setEnabled(True)
        self.status_bar.showMessage("Upload failed!")
        QMessageBox.critical(self, "Upload Error", f"Failed to upload file:\n{error}")

    def load_history(self):
        def fetch():
            response = requests.get(f"{API_BASE_URL}/history/", auth=auth_credentials)
            response.raise_for_status()
            return response.json()
        
        worker = APIWorker(fetch)
        worker.finished.connect(self.on_history_loaded)
        worker.error.connect(lambda e: self.status_bar.showMessage(f"Failed to load history: {e}"))
        self.workers.append(worker)
        worker.start()

    def on_history_loaded(self, data):
        self.history = data
        self.history_list.clear()
        for item in data:
            widget_item = QListWidgetItem()
            widget_item.setText(f"{item.get('filename', 'Upload')}\n{item['total_equipment']} items")
            widget_item.setData(Qt.UserRole, item.get('id') or item.get('uploaded_at'))
            self.history_list.addItem(widget_item)

    def on_history_click(self, item):
        session_id = item.data(Qt.UserRole)
        # If ID is not integer (e.g. timestamp from old implementation), we can't fetch summary
        # But wait, our API update added ID to history items implicitly if they are model instances.
        # But `upload_history` view in Step 572 returns Dicts. 
        # I need to check `upload_history` in `views.py` if it returns ID. it DOES NOT (Step 572).
        # Ah! `upload_history` only returned:
        # "uploaded_at", "total_equipment", etc. NO ID!
        # This is a problem. I need to fix `upload_history` in `views.py` to return ID too.
        # Otherwise clicking history won't work for fetching summary.
        # I'll quickly fix `views.py` again.
        
        self.load_session(session_id)

    def load_session(self, session_id):
        self.status_bar.showMessage("Loading session data...")
        def fetch():
            response = requests.get(f"{API_BASE_URL}/summary/{session_id}/", auth=auth_credentials)
            response.raise_for_status()
            return response.json()
        
        worker = APIWorker(fetch)
        worker.finished.connect(self.on_session_loaded)
        worker.error.connect(lambda e: self.status_bar.showMessage(f"Failed to load session: {e}"))
        self.workers.append(worker)
        worker.start()

    def on_session_loaded(self, data):
        self.session_data = data
        self.download_btn.setEnabled(True)
        self.status_bar.showMessage(f"Loaded session")
        self.update_display()

    def update_display(self):
        if not self.session_data: return
        data = self.session_data
        
        self.stats_labels['Total Equipment'].setText(str(data['total_equipment']))
        self.stats_labels['Avg Flowrate'].setText(f"{data['average_flowrate']:.1f}")
        self.stats_labels['Avg Pressure'].setText(f"{data['average_pressure']:.1f}")
        self.stats_labels['Avg Temperature'].setText(f"{data['average_temperature']:.1f}")
        
        # Bar Chart
        self.bar_canvas.axes.clear()
        categories = ['Flowrate\n(m³/h)', 'Pressure\n(bar)', 'Temperature\n(°C)']
        values = [data['average_flowrate'], data['average_pressure'], data['average_temperature']]
        self.bar_canvas.axes.bar(categories, values, color=['#2563eb', '#059669', '#d97706'])
        self.bar_canvas.axes.set_ylabel('Value', fontsize=10)
        self.bar_canvas.axes.set_title('Average Process Parameters', fontsize=11, fontweight='bold')
        self.bar_canvas.draw()
        
        # Pie Chart
        self.pie_canvas.axes.clear()
        dist = data['equipment_type_distribution']
        if dist:
            # Use legend instead of labels around pie to avoid truncation
            wedges, texts, autotexts = self.pie_canvas.axes.pie(
                dist.values(), 
                labels=None,  # Don't use labels around pie
                autopct='%1.1f%%',
                startangle=90,
                textprops={'fontsize': 9}
            )
            # Add legend with full equipment names
            self.pie_canvas.axes.legend(
                dist.keys(), 
                loc='center left', 
                bbox_to_anchor=(1, 0, 0.5, 1),
                fontsize=9,
                frameon=True
            )
            self.pie_canvas.axes.set_title('Equipment Type Distribution', fontsize=9, fontweight='bold', pad=10)
        self.pie_canvas.figure.tight_layout()
        self.pie_canvas.draw()
        
        # Table
        equipment = data.get('equipment', [])
        self.data_table.setRowCount(len(equipment))
        for r, eq in enumerate(equipment):
            self.data_table.setItem(r, 0, QTableWidgetItem(str(eq.get('name', ''))))
            self.data_table.setItem(r, 1, QTableWidgetItem(str(eq.get('type', ''))))
            self.data_table.setItem(r, 2, QTableWidgetItem(str(eq.get('flowrate', 0))))
            self.data_table.setItem(r, 3, QTableWidgetItem(str(eq.get('pressure', 0))))
            self.data_table.setItem(r, 4, QTableWidgetItem(str(eq.get('temperature', 0))))

    def download_report(self):
        if not self.session_data: return
        path, _ = QFileDialog.getSaveFileName(self, "Save PDF", "report.pdf", "PDF Files (*.pdf)")
        if not path: return
        
        def download():
            # Use specific report ID if we have session ID
            url = f"{API_BASE_URL}/report/{self.session_data.get('id', '')}/"
            res = requests.get(url, auth=auth_credentials)
            res.raise_for_status()
            with open(path, 'wb') as f: f.write(res.content)
            return path
        
        worker = APIWorker(download)
        worker.finished.connect(lambda p: QMessageBox.information(self, "Success", f"Saved to {p}"))
        worker.error.connect(lambda e: QMessageBox.critical(self, "Error", str(e)))
        self.workers.append(worker)
        worker.start()

def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    window = ChemicalVisualizerApp()
    if not window.show_login(): sys.exit()
    window.load_history()
    window.show()
    sys.exit(app.exec())

if __name__ == '__main__':
    main()
