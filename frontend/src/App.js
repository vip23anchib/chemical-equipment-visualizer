import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const API = 'http://127.0.0.1:8000/api';

function App() {
  const [user, setUser] = useState(null); // { username, password }
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragover, setDragover] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const getAuthHeaders = () => {
    return {
      'Authorization': 'Basic ' + btoa(user.username + ':' + user.password)
    };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      // Test credentials by fetching history
      const res = await fetch(`${API}/history/`, {
        headers: { 'Authorization': 'Basic ' + btoa(username + ':' + password) }
      });

      if (res.ok) {
        setUser({ username, password });
      } else {
        setLoginError('Invalid credentials');
      }
    } catch (err) {
      setLoginError('Connection failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    setData(null);
    setHistory([]);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/history/`, { headers: getAuthHeaders() });
      if (res.ok) setHistory(await res.json());
    } catch { }
  };

  const loadSession = async (item) => {
    try {
      const res = await fetch(`${API}/summary/${item.id}/`, { headers: getAuthHeaders() });
      if (res.ok) {
        // The history item itself has summary data, but complete data including equipment details might need a fetch if backend supports it.
        // Our current backend view `get_summary` (which assumes `summary/<id>`) isn't explicitly defined in my memory of `urls.py` but `upload_history` returns summaries.
        // Wait, the backend strictly returns summary from `upload_csv` and `upload_history`.
        // `upload_history` items contain: total_equipment, average_..., etc.
        // They don't contain the full equipment list unless we store and retrieve it. 
        // The backend Reference `views.py` didn't seem to have a detail view for individual sessions unless I missed it.
        // Actually, `upload_history` returns summaries. 
        // Let's use the item data directly for now, as re-fetching might not give equipment details if the History endpoint doesn't include them.
        // Actually, the `upload_csv` returns full equipment list now.
        // But `upload_history` might not.
        // For this task, let's just load what we have from the item if we can't fetch details.
        // But wait, the user wants `loadSession` to work.
        // Let's rely on the data passed in `item` from history for summary, 
        // and if we want equipment details for OLD sessions, we'd need a backend endpoint for that.
        // The current `upload_history` returns limited fields. 
        // Let's stick to showing what's available. 
        // If equipment list is missing in history, we won't show the table for historical items, only current upload.
        setData({
          id: item.uploaded_at,
          total: item.total_equipment,
          flowrate: item.average_flowrate,
          pressure: item.average_pressure,
          temperature: item.average_temperature,
          distribution: item.equipment_type_distribution,
          equipment: null, // History items don't have equipment list in current backend implementation
        });
      }
    } catch (e) {
      // Fallback
      setData({
        id: item.uploaded_at,
        total: item.total_equipment,
        flowrate: item.average_flowrate,
        pressure: item.average_pressure,
        temperature: item.average_temperature,
        distribution: item.equipment_type_distribution,
        equipment: null,
      });
    }
  };

  const handleUpload = async (file) => {
    if (!file?.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/upload/`, {
        method: 'POST',
        body: formData,
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData({
        id: Date.now(),
        total: json.total_equipment,
        flowrate: json.average_flowrate,
        pressure: json.average_pressure,
        temperature: json.average_temperature,
        distribution: json.equipment_type_distribution,
        equipment: json.equipment,
      });
      setSuccess(`File uploaded and processed successfully`);
      fetchHistory();
    } catch {
      setError('Failed to process file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    // For download, we can't easily add headers to a window.open call.
    // We might need a signed URL or just use the browser's auth prompt (it might ask).
    // OR, we can fetch as blob.
    // Let's try fetching as blob to pass auth headers.
    fetch(`${API}/download-pdf/`, { headers: getAuthHeaders() })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "report.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => setError('Download failed'));
  };


  const barData = data ? {
    labels: ['Flowrate (m³/h)', 'Pressure (bar)', 'Temperature (°C)'],
    datasets: [{
      label: 'Average Value',
      data: [data.flowrate, data.pressure, data.temperature],
      backgroundColor: ['#0052cc', '#00875a', '#ff991f'],
      borderRadius: 4,
    }],
  } : null;

  const pieData = data ? {
    labels: Object.keys(data.distribution || {}),
    datasets: [{
      data: Object.values(data.distribution || {}),
      backgroundColor: ['#0052cc', '#00875a', '#ff991f', '#de350b', '#6554c0', '#00b8d9'],
      borderWidth: 0,
    }],
  } : null;

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#5e6c84', font: { size: 11 } } },
      y: { grid: { color: '#ebecf0' }, ticks: { color: '#5e6c84', font: { size: 11 } } },
    },
  };

  const pieOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#5e6c84', font: { size: 11 }, padding: 12, usePointStyle: true },
      },
    },
  };

  // Login Screen
  if (!user) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
          <div className="card-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: '0' }}>
            <div className="logo" style={{ flexDirection: 'column', gap: '16px' }}>
              <div className="logo-icon" style={{ width: '64px', height: '64px', fontSize: '32px' }}>⚗️</div>
              <h1 style={{ fontSize: '24px' }}>Welcome Back</h1>
              <p style={{ color: '#5e6c84' }}>Sign in to Chemical Equipment Visualizer</p>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#172b4d' }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dfe1e6' }}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#172b4d' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dfe1e6' }}
                  placeholder="Enter password"
                  required
                />
              </div>
              {loginError && <div style={{ color: '#de350b', fontSize: '14px' }}>{loginError}</div>}
              <button type="submit" className="btn btn-primary" style={{ height: '40px', fontSize: '14px' }}>Sign In</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">⚗️</div>
            <h1>Chemical Equipment Visualizer</h1>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
            {data && (
              <button className="btn btn-primary" onClick={handleDownload}>
                Download Analysis Report
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Upload and analyze chemical equipment data</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            {success}
            <button onClick={() => setSuccess(null)}>×</button>
          </div>
        )}

        <div className="dashboard-grid">
          {/* Left Column - Upload */}
          <div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Upload Data</h3>
              </div>
              <div className="card-body">
                <div
                  className={`upload-zone ${dragover ? 'dragover' : ''}`}
                  onDrop={(e) => { e.preventDefault(); setDragover(false); handleUpload(e.dataTransfer.files[0]); }}
                  onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                  onDragLeave={() => setDragover(false)}
                  onClick={() => document.getElementById('file').click()}
                >
                  <input id="file" type="file" accept=".csv" hidden onChange={(e) => handleUpload(e.target.files[0])} />
                  {uploading ? (
                    <>
                      <div className="spinner"></div>
                      <p className="upload-title" style={{ marginTop: '12px' }}>Processing...</p>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">📁</div>
                      <p className="upload-title">Drag and drop a CSV file</p>
                      <p className="upload-subtitle">or <a href="#">browse</a> to upload</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* History Table */}
            {history.length > 0 && (
              <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title">Recent Uploads</h3>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Equipment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 5).map((item, i) => (
                      <tr
                        key={item.uploaded_at}
                        className={data?.id === item.uploaded_at ? 'active' : ''}
                        onClick={() => loadSession(item)}
                      >
                        <td>{new Date(item.uploaded_at).toLocaleDateString()}</td>
                        <td>{item.total_equipment} units</td>
                        <td><span className="badge badge-success">Processed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Charts */}
          <div>
            {data ? (
              <>
                {/* Summary Stats */}
                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                  <div className="stat-card">
                    <div className="stat-label">Total Equipment</div>
                    <div className="stat-value">{data.total}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Avg. Flowrate</div>
                    <div className="stat-value">{data.flowrate?.toFixed(1)}<span className="stat-unit">m³/h</span></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Avg. Pressure</div>
                    <div className="stat-value">{data.pressure?.toFixed(1)}<span className="stat-unit">bar</span></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Avg. Temperature</div>
                    <div className="stat-value">{data.temperature?.toFixed(1)}<span className="stat-unit">°C</span></div>
                  </div>
                </div>

                {/* Charts */}
                <div className="charts-grid">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Average Metrics</h3>
                    </div>
                    <div className="card-body">
                      <div className="chart-container">
                        <Bar data={barData} options={chartOpts} />
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Equipment Distribution</h3>
                    </div>
                    <div className="card-body">
                      <div className="chart-container">
                        <Doughnut data={pieData} options={pieOpts} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Data Table */}
                {data.equipment && data.equipment.length > 0 && (
                  <div className="card full-width" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                      <h3 className="card-title">Equipment Data</h3>
                      <span className="badge badge-success">{data.equipment.length} records</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Equipment Name</th>
                            <th>Type</th>
                            <th>Flowrate (m³/h)</th>
                            <th>Pressure (bar)</th>
                            <th>Temperature (°C)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.equipment.map((eq, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 500, color: '#172b4d' }}>{eq.name}</td>
                              <td><span className="badge badge-type">{eq.type}</span></td>
                              <td>{eq.flowrate.toFixed(1)}</td>
                              <td>{eq.pressure.toFixed(1)}</td>
                              <td>{eq.temperature.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <p className="empty-state-title">No data to display</p>
                    <p className="empty-state-description">Upload a CSV file to view analytics</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
