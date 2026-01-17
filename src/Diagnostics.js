import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';
import busData from './routes.2018.json'; 

const BLR_BOUNDS = [[12.8340125, 77.4601025], [13.1436649, 77.7840515]];
const BANGALORE_CENTER = [12.9716, 77.5946];

// Helper to zoom map to route
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
}

function Diagnostics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isElectric, setIsElectric] = useState(0); 

  // 1. Search Logic
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 1) {
        const matches = busData.features.filter(f => 
            f.properties.route && f.properties.route.toLowerCase().includes(term.toLowerCase())
        ).slice(0, 10);
        setSearchResults(matches);
    } else {
        setSearchResults([]);
    }
  };

  // 2. Select a Route
  const selectRoute = (feature) => {
    const path = feature.geometry.coordinates.map(c => [c[1], c[0]]);
    const center = path[Math.floor(path.length / 2)];
    
    setSelectedRoute({
        name: feature.properties.route,
        origin: feature.properties.origin,
        dest: feature.properties.destination,
        trips: feature.properties.trips || 20, 
        path: path,
        center: center,
        raw_feature: feature
    });
    setSearchResults([]);
    setAnalysis(null); 
  };

  // 3. Run Diagnostics
  const runDiagnostics = async () => {
    if (!selectedRoute) return;
    setLoading(true);
    setAnalysis(null); // Clear previous results
    try {
        const response = await axios.post('https://transport-roi-engine.onrender.com/analyze-existing-route', {
            path_coords: selectedRoute.path,
            frequency: selectedRoute.trips,
            is_electric: parseInt(isElectric)
        });
        setAnalysis(response.data);
    } catch (err) {
        setAnalysis({ error: "Network Error: Could not connect to server." });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{height: 'calc(100vh - 70px)'}}>
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="header-box" style={{borderLeft: '5px solid #ff9800'}}>
            <h2>🩺 Route Health Check</h2>
            <small>Analyze existing BMTC corridors.</small>
        </div>

        {/* SEARCH BOX */}
        <div className="card">
            <label>Search Route Number (e.g. 335, 500)</label>
            <input 
                type="text" 
                placeholder="Type route number..." 
                value={searchTerm}
                onChange={handleSearch}
                style={{width: '100%', padding:'8px', boxSizing:'border-box'}}
            />
            {searchResults.length > 0 && (
                <div style={{background:'white', border:'1px solid #ddd', maxHeight:'200px', overflowY:'auto'}}>
                    {searchResults.map((res, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => selectRoute(res)}
                            style={{padding:'8px', borderBottom:'1px solid #eee', cursor:'pointer', fontSize:'12px'}}
                            className="search-item"
                        >
                            <strong>{res.properties.route}</strong>: {res.properties.origin} ➝ {res.properties.destination}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {selectedRoute && (
            <div className="card fade-in">
                <h3>Selected: {selectedRoute.name}</h3>
                <p style={{fontSize:'12px', color:'#666'}}>
                    {selectedRoute.origin} ➝ {selectedRoute.dest}<br/>
                    <strong>Current Frequency:</strong> {selectedRoute.trips} trips/day
                </p>
                
                <hr/>
                <label>Simulate Fleet Type:</label>
                <select value={isElectric} onChange={e => setIsElectric(e.target.value)} style={{width:'100%', marginBottom:'10px'}}>
                    <option value="0">Diesel (Current Status)</option>
                    <option value="1">Upgrade to Electric (Projection)</option>
                </select>

                <button onClick={runDiagnostics} disabled={loading} className="primary-btn">
                    {loading ? "Analyzing..." : "🚀 Run Diagnostics"}
                </button>
            </div>
        )}

        {/* ANALYSIS RESULTS (CRASH FIX APPLIED HERE) */}
        {analysis && (
            <div className="card result-card fade-in">
                {analysis.error ? (
                     <div style={{color: 'red', padding: '10px', textAlign: 'center'}}>
                        ⚠️ <strong>Analysis Failed</strong><br/>
                        <small>{analysis.error}</small>
                     </div>
                ) : (
                    <>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h3>Health Report</h3>
                            <span style={{
                                padding:'4px 8px', borderRadius:'4px', fontWeight:'bold', fontSize:'12px',
                                backgroundColor: (analysis.verdict || '').includes('Healthy') ? '#d4edda' : '#f8d7da',
                                color: (analysis.verdict || '').includes('Healthy') ? '#155724' : '#721c24'
                            }}>
                                {analysis.verdict || "Unknown Status"}
                            </span>
                        </div>

                        <div className="stat-grid" style={{marginTop:'10px'}}>
                            <div>
                                <small>Daily Cost</small>
                                <div className="stat-val">₹{(analysis.financials?.daily_cost || 0).toLocaleString()}</div>
                            </div>
                            <div>
                                <small>Profit/Loss</small>
                                <div className="stat-val" style={{color: (analysis.financials?.profit || 0) > 0 ? 'green' : 'red'}}>
                                    {(analysis.financials?.profit || 0) > 0 ? '+' : ''}₹{(analysis.financials?.profit || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div style={{marginTop:'10px', fontSize:'12px', background:'#f1f3f5', padding:'8px', borderRadius:'5px'}}>
                            <strong>Network Stats:</strong><br/>
                            📏 Length: {analysis.route_stats?.distance_km} km<br/>
                            🚇 Metro Connected: {analysis.route_stats?.metro_connectivity}<br/>
                            (Nearest Stn: {analysis.route_stats?.nearest_metro_dist} km)
                        </div>
                    </>
                )}
            </div>
        )}

      </div>

      {/* MAP */}
      <div className="map-container">
        <MapContainer center={BANGALORE_CENTER} zoom={11} scrollWheelZoom={true} maxBounds={BLR_BOUNDS}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles" />
            
            <MapUpdater center={selectedRoute ? selectedRoute.center : null} />

            {selectedRoute && (
                <Polyline 
                    positions={selectedRoute.path} 
                    pathOptions={{ color: '#FF9800', weight: 5 }} 
                >
                    <Popup>
                        <strong>{selectedRoute.name}</strong><br/>
                        {selectedRoute.origin} - {selectedRoute.dest}
                    </Popup>
                </Polyline>
            )}
        </MapContainer>
      </div>
    </div>
  );
}

export default Diagnostics;