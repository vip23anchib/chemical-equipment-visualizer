# Chemical Equipment Visualizer

A comprehensive system for uploading, analyzing, and visualizing chemical equipment data with professional PDF reports. This project consists of three main components: a Django backend API, a React web frontend, and a PySide6 desktop application.

## Project Overview

- **Backend**: Django REST API for data management and PDF report generation
- **Frontend**: React web application for data upload and visualization
- **Desktop Frontend**: PySide6 desktop application for offline access and management

---

## Prerequisites

Before setting up any component, ensure you have the following installed:

- **Python 3.8+** - For backend and desktop frontend
- **Node.js 16+** - For React frontend
- **pip** - Python package manager
- **npm** - Node package manager
- **Git** - Version control

---

## Backend Setup (Django)

### 1. Navigate to Backend Directory

```bash
cd backend/equipment_backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Database Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Start Development Server

```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

**Key Endpoints:**
- `POST /api/upload/` - Upload CSV file
- `GET /api/history/` - Get upload history
- `GET /api/summary/<session_id>/` - Get summary for specific session
- `GET /api/download/<session_id>/` - Download PDF report

---

## Frontend Setup (React)

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Endpoint (If Needed)

Edit `src/services/api.js` and update the API base URL if your backend is running on a different port:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### 4. Start Development Server

```bash
npm start
```

The frontend will open at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

**Features:**
- CSV file upload with validation
- Real-time data visualization with charts
- Equipment statistics and summaries
- Upload history tracking
- PDF report download
- Responsive design with Tailwind CSS

---

## Desktop Frontend Setup (PySide6)

### 1. Navigate to Desktop Frontend Directory

```bash
cd desktop-frontend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

Install from the backend requirements (or create a separate requirements file):

```bash
pip install PySide6 requests pandas matplotlib
```

### 4. Configure Backend Connection

Edit `main.py` and update the API base URL if needed:

```python
API_BASE_URL = "http://localhost:8000/api"
```

### 5. Run the Desktop Application

```bash
python main.py
```

**Features:**
- Standalone desktop application
- Upload CSV files with file browser dialog
- View equipment statistics and distributions
- Download PDF reports
- Upload history in sidebar
- Material-designed UI with icons

---

## Complete Setup Script

For convenience, here's a complete setup script for all components:

### Windows (Batch)

Create `setup.bat`:

```batch
@echo off
echo Installing Backend...
cd backend\equipment_backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
python manage.py migrate
cd ..\..

echo Installing Frontend...
cd frontend
call npm install
cd ..

echo Installing Desktop Frontend...
cd desktop-frontend
python -m venv venv
call venv\Scripts\activate.bat
pip install PySide6 requests pandas matplotlib
cd ..

echo Setup complete!
```

### macOS/Linux (Bash)

Create `setup.sh`:

```bash
#!/bin/bash

echo "Installing Backend..."
cd backend/equipment_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
cd ../..

echo "Installing Frontend..."
cd frontend
npm install
cd ..

echo "Installing Desktop Frontend..."
cd desktop-frontend
python3 -m venv venv
source venv/bin/activate
pip install PySide6 requests pandas matplotlib
cd ..

echo "Setup complete!"
```

Run with: `chmod +x setup.sh && ./setup.sh`

---

## Running All Components Together

### Terminal 1 - Backend

```bash
cd backend/equipment_backend
venv\Scripts\activate  # or source venv/bin/activate
python manage.py runserver
```

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

### Terminal 3 - Desktop Frontend

```bash
cd desktop-frontend
venv\Scripts\activate  # or source venv/bin/activate
python main.py
```

---

## Project Structure

```
chemical-equipment-visualizer/
├── backend/
│   └── equipment_backend/
│       ├── api/
│       │   ├── models.py          # Database models
│       │   ├── views.py           # API endpoints
│       │   ├── urls.py            # URL routing
│       │   ├── pdf_utils.py       # PDF report generation
│       │   └── tests.py           # Unit tests
│       ├── requirements.txt
│       └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API services
│   │   └── App.js                 # Main app component
│   ├── package.json
│   └── tailwind.config.js
└── desktop-frontend/
    └── main.py                    # PySide6 desktop app
```

---

## Execution Flow & Error Handling

### Application Initialization Flow

1. **User Launch**: Application starts (Django backend, React frontend, or PySide6 desktop app)
2. **Authentication**: User provides credentials for secure access to API
3. **Backend Verification**: Application verifies backend server connectivity and authentication
4. **State Initialization**: Application initializes data structures for uploads, history, and display

### Core Execution Flow

**Desktop Application (PySide6):**
1. Login dialog displays and validates user credentials against backend
2. Application loads upload history from backend API
3. User selects and uploads CSV file from local system
4. Backend processes file, calculates statistics, and stores in database
5. Application retrieves summary data (equipment counts, averages, distributions)
6. Charts and data tables render with processed information
7. User can download PDF report or access previous uploads from history

**Web Frontend (React):**
1. User uploads CSV file through drag-and-drop or file selector
2. File is transmitted to backend with progress tracking
3. Backend response triggers data refresh and visualization
4. History is fetched and displayed in sidebar
5. Summary statistics update automatically

**Backend (Django):**
1. Receives CSV file and validates format
2. Parses equipment data and extracts critical fields (name, type, flowrate, pressure, temperature)
3. Calculates aggregated statistics (averages, distributions, totals)
4. Stores session data and equipment records in database
5. Generates PDF reports on demand with comprehensive analysis

### Data Processing Pipeline

- **Input Validation**: CSV format and required columns verified
- **Data Cleaning**: Invalid/empty fields safely handled without stopping processing
- **Aggregation**: Numeric values converted safely, non-numeric values replaced with defaults
- **Statistics Calculation**: Averages, distributions computed on validated data
- **Visualization**: Charts and tables generated from processed data

### Graceful Error Handling

**Backend Unavailability**
- Application detects connection errors and timeouts
- User-friendly message displays instead of crash
- Application remains responsive and functional
- Users can retry operations or continue with cached data

**Empty or Invalid Data**
- Empty CSV files detected and rejected with clear message
- Non-numeric values in critical fields safely converted to defaults (0.0)
- NaN, Infinity, and null values handled gracefully
- Invalid rows skipped; valid rows processed and displayed
- Charts and tables render with available data, placeholders for missing data

**Network Failures**
- Connection timeouts protected by 10-60 second request limits
- HTTP error codes (401, 403, 500, etc.) handled with specific user messages
- Network unavailability shows actionable guidance (e.g., "Ensure backend is running")
- Application continues operating; user can retry without restarting

**Data Integrity Issues**
- Missing required fields in API responses detected and logged
- Corrupted JSON responses caught and reported safely
- Incomplete datasets handled without crashing display
- Invalid equipment records excluded from visualization

**User-Centric Design**
- All errors display as clear, human-readable dialogs
- Technical details and stack traces never exposed to users
- Graceful degradation: app continues running with partial functionality
- Non-blocking error messages allow users to dismiss and proceed
- Status bar provides real-time feedback on operation outcomes

---

## Technologies Used

### Backend
- Django 5.0+
- Django REST Framework
- PostgreSQL/SQLite
- ReportLab (PDF generation)
- Matplotlib (Charts)
- Pandas (Data processing)

### Frontend
- React 19+
- Tailwind CSS
- Chart.js
- Lucide React (Icons)
- Craco (Configuration)

### Desktop
- PySide6
- Matplotlib
- Pandas
- Requests

---

## Environment Variables (Optional)

Create a `.env` file in the backend directory:

```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## Troubleshooting

### Backend Issues
- **Module not found**: Ensure virtual environment is activated
- **Database errors**: Run `python manage.py migrate`
- **Port already in use**: Use `python manage.py runserver 8001`

### Frontend Issues
- **npm errors**: Delete `node_modules` and run `npm install` again
- **Port 3000 in use**: Use `PORT=3001 npm start`
- **API connection**: Check CORS settings in backend

### Desktop Issues
- **PySide6 import error**: Reinstall with `pip install --upgrade PySide6`
- **Connection refused**: Ensure backend is running

---

## License

ISC

---

## Support

For issues or questions, please create an issue in the repository.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
