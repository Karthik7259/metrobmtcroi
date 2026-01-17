import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import jsPDF from 'jspdf';          // <--- NEW
import html2canvas from 'html2canvas'; // <--- NEW
import { METRO_LINES, BUS_CORRIDORS } from './MapLayers';
import 'leaflet/dist/leaflet.css';
import './App.css';

const BLR_BOUNDS = [[12.8340125, 77.4601025], [13.1436649, 77.7840515]];
const BANGALORE_CENTER = [12.9716, 77.5946];

function Dashboard() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [frequency, setFrequency] = useState(40);
  const [isElectric, setIsElectric] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Layer Toggles
  const [showMetro, setShowMetro] = useState(false);
  const [showBus, setShowBus] = useState(false);

  // --- PDF GENERATOR ---
  const handleDownloadReport = async () => {
    const input = document.getElementById('printable-report'); // We will add this ID below
    if (!input) return;

    // Visual feedback
    const btn = document.getElementById('pdf-btn');
    if(btn) btn.innerText = "Generating...";

    try {
        // 1. Capture the DOM element as a canvas
        const canvas = await html2canvas(input, { scale: 2 }); // Scale 2 for high res
        const imgData = canvas.toDataURL('image/png');

        // 2. Initialize PDF (Portrait, mm, A4)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // 3. Add Header
        pdf.setFontSize(18);
        pdf.setTextColor(40, 44, 52);
        pdf.text("BMTC Network Feasibility Report", 10, 15);
        
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 10, 22);
        pdf.line(10, 25, 200, 25); // Horizontal line

        // 4. Add the Screenshot of the Analysis
        pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, pdfHeight);

        // 5. Add Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text("Powered by Transport ROI Engine | AI-Driven Planning", 10, 290);

        // 6. Save
        pdf.save(`Route_Report_${Date.now()}.pdf`);
    } catch (err) {
        alert("Failed to generate report");
        console.error(err);
    } finally {
        if(btn) btn.innerText = "📄 Download Official Report";
    }
  };

  const handleSearch = async (type) => {
    if (!searchQuery) return;
    const query = searchQuery; 
    try {
        const localResp = await axios.get(`https://transport-roi-engine.onrender.com/search-location?query=${query}`);
        if (localResp.data && !localResp.data.error) {
            const { lat, lon, name, type: locType } = localResp.data;
            const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
            if (type === 'start') setStartPoint(coords);
            else setEndPoint(coords);
            setSearchQuery(`${name} (${locType})`);
            setResult(null);
            return;
        }
    } catch (err) {}

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}, Bengaluru&limit=1`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        if (type === 'start') setStartPoint(coords);
        else setEndPoint(coords);
        setResult(null);
        setSearchQuery(""); 
      } else {
        alert(`Location '${query}' not found.`);
      }
    } catch (err) { alert("Search failed."); }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (!startPoint) { setStartPoint(e.latlng); } 
        else if (!endPoint) { setEndPoint(e.latlng); } 
        else { setStartPoint(e.latlng); setEndPoint(null); setResult(null); }
      },
    });
    return null;
  }

  const handlePredict = async () => {
    if (!startPoint || !endPoint) { alert("Please select both points!"); return; }
    setLoading(true); setError(null);
    try {
      const response = await axios.post('https://transport-roi-engine.onrender.com/predict-roi', {
        start_lat: startPoint.lat, start_lon: startPoint.lng,
        end_lat: endPoint.lat, end_lon: endPoint.lng,
        frequency: parseInt(frequency), is_electric: parseInt(isElectric)
      });
      setResult(response.data);
    } catch (err) { setError("Failed to fetch prediction."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="dashboard-container" style={{height: 'calc(100vh - 70px)'}}>
      <div className="sidebar">
        <div className="header-box">
            <h2>📍 Route Planner</h2>
            <small>Design a new feeder route & analyze profitability.</small>
        </div>

        <div className="card control-panel">
            <div className="search-section">
                <input type="text" placeholder="Search (e.g. Shivajinagar)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                <div style={{display: 'flex', gap: '5px'}}>
                    <button onClick={() => handleSearch('start')} className="secondary-btn">Set Start</button>
                    <button onClick={() => handleSearch('end')} className="secondary-btn">Set End</button>
                </div>
            </div>
            <hr/>
            <div className="status-row">
                <span className={startPoint ? "status-ok" : "status-waiting"}>{startPoint ? "✅ Start" : "Wait Start.."}</span>
                <span className={endPoint ? "status-ok" : "status-waiting"}>{endPoint ? "✅ End" : "Wait End.."}</span>
            </div>
            <label>Frequency (Trips/Day):</label>
            <input type="number" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
            <label>Bus Type:</label>
            <select value={isElectric} onChange={(e) => setIsElectric(e.target.value)}>
              <option value="1">Electric (GCC Model - Recommended)</option>
              <option value="0">Diesel (Standard)</option>
            </select>
            <button onClick={handlePredict} disabled={loading} className="primary-btn">
              {loading ? "Calculating..." : "🚀 Analyze Investment"}
            </button>
            <button onClick={() => { setStartPoint(null); setEndPoint(null); setResult(null); }} className="reset-btn">Reset All</button>
        </div>

        {error && <div className="error-box" style={{color: 'red'}}>{error}</div>}

        {result && (
            <div className="results-area fade-in">
              {/* THIS ID 'printable-report' IS WHAT GETS PRINTED */}
              <div id="printable-report"> 
                  <div className="card result-card">
                    <h3>💰 Financial Forecast</h3>
                    <div className="stat-grid">
                        <div><small>Daily Cost</small><div className="stat-val">₹{result.predictions.daily_cost.toLocaleString()}</div></div>
                        <div><small>Daily Revenue</small><div className="stat-val">₹{result.predictions.daily_revenue.toLocaleString()}</div></div>
                    </div>
                    <div className="roi-display" style={{ color: result.predictions.roi_percent > 0 ? '#28a745' : '#dc3545' }}>
                      ROI: {result.predictions.roi_percent}%
                    </div>
                  </div>

                  {result.explanation && (
                    <div className="card">
                        <h3>🧠 Why this Result?</h3>
                        <p style={{fontSize:'10px', color:'#666', marginBottom:'5px'}}>AI attribution of profit drivers:</p>
                        <div style={{ width: '100%', height: 160, fontSize: '10px' }}>
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={result.explanation} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="feature" width={70} tick={{fontSize: 10}} />
                            <Tooltip contentStyle={{fontSize: '12px'}}/>
                            <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
                                {result.explanation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                  )}

                  <div className="verdict-box" style={{ borderLeft: `5px solid ${result.verdict.color}`, backgroundColor: '#f8f9fa' }}>
                    <h4 style={{color: result.verdict.color}}>{result.verdict.status}</h4>
                    <p>{result.verdict.reason}</p>
                  </div>
              </div>

              {/* DOWNLOAD BUTTON */}
              <button 
                id="pdf-btn" 
                onClick={handleDownloadReport} 
                className="primary-btn" 
                style={{marginTop: '10px', backgroundColor: '#343a40', border:'none'}}
              >
                📄 Download Official Report
              </button>
            </div>
        )}
      </div>

      <div className="map-container" style={{position:'relative'}}>
        <div className="map-controls" style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 1000, 
            background: 'white', padding: '10px', borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)', fontSize: '12px'
        }}>
            <strong>Show Context:</strong>
            <div style={{marginTop:'5px'}}>
                <label style={{display:'block', cursor:'pointer'}}>
                    <input type="checkbox" checked={showMetro} onChange={e => setShowMetro(e.target.checked)} /> 
                    🚇 Metro Lines
                </label>
                <label style={{display:'block', cursor:'pointer', marginTop:'3px'}}>
                    <input type="checkbox" checked={showBus} onChange={e => setShowBus(e.target.checked)} /> 
                    🚌 Major Bus Routes
                </label>
            </div>
        </div>

        <MapContainer center={BANGALORE_CENTER} zoom={12} scrollWheelZoom={true} maxBounds={BLR_BOUNDS} minZoom={11}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles" />
            <LocationMarker />
            {startPoint && <Marker position={startPoint}><Popup>Start</Popup></Marker>}
            {endPoint && <Marker position={endPoint}><Popup>End</Popup></Marker>}
            
            {result && result.route_details.path_geometry.length > 0 && (
                <Polyline positions={result.route_details.path_geometry} pathOptions={{ color: 'blue', weight: 6, opacity: 0.7 }} />
            )}
            {startPoint && endPoint && !result && (
                <Polyline positions={[startPoint, endPoint]} pathOptions={{ color: 'gray', dashArray: '10, 10' }} />
            )}

            {showMetro && METRO_LINES.map((line, idx) => (
                <Polyline key={`metro-${idx}`} positions={line.path} pathOptions={{ color: line.color, weight: 4, opacity: 0.6 }} >
                    <Popup>{line.name}</Popup>
                </Polyline>
            ))}
            {showBus && BUS_CORRIDORS.map((route, idx) => (
                <Polyline key={`bus-${idx}`} positions={route.path} pathOptions={{ color: route.color, weight: 2, opacity: 0.6 }} >
                    <Popup>{route.name}</Popup>
                </Polyline>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Dashboard;