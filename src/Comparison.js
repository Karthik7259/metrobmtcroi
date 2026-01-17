import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { METRO_LINES, BUS_CORRIDORS } from './MapLayers';
import 'leaflet/dist/leaflet.css';
import './App.css';

const BLR_BOUNDS = [[12.8340125, 77.4601025], [13.1436649, 77.7840515]];
const BANGALORE_CENTER = [12.9716, 77.5946];

function Comparison() {
  // --- STATE FOR ROUTE A (Blue) ---
  const [routeA, setRouteA] = useState({ start: null, end: null, result: null });
  const [freqA, setFreqA] = useState(40);
  const [elecA, setElecA] = useState(1);

  // --- STATE FOR ROUTE B (Purple) ---
  const [routeB, setRouteB] = useState({ start: null, end: null, result: null });
  const [freqB, setFreqB] = useState(40);
  const [elecB, setElecB] = useState(0); // Default to Diesel for contrast

  // UI State
  const [activeSelector, setActiveSelector] = useState('A_start'); // 'A_start', 'A_end', 'B_start', 'B_end'
  const [loading, setLoading] = useState(false);
  
  // Layers
  const [showMetro, setShowMetro] = useState(false);

  // --- HELPER: MAP CLICK HANDLER ---
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const coords = e.latlng;
        if (activeSelector === 'A_start') {
            setRouteA(prev => ({ ...prev, start: coords, result: null }));
            setActiveSelector('A_end');
        } else if (activeSelector === 'A_end') {
            setRouteA(prev => ({ ...prev, end: coords, result: null }));
            setActiveSelector('B_start'); // Jump to Route B
        } else if (activeSelector === 'B_start') {
            setRouteB(prev => ({ ...prev, start: coords, result: null }));
            setActiveSelector('B_end');
        } else if (activeSelector === 'B_end') {
            setRouteB(prev => ({ ...prev, end: coords, result: null }));
            setActiveSelector(null); // Done
        }
      },
    });
    return null;
  }

  // --- API CALL ---
  const handleCompare = async () => {
    if (!routeA.start || !routeA.end || !routeB.start || !routeB.end) {
        alert("Please define both routes on the map.");
        return;
    }

    setLoading(true);
    try {
        // Run both predictions in parallel
        const [resA, resB] = await Promise.all([
            axios.post('https://transport-roi-engine.onrender.com/predict-roi', {
                start_lat: routeA.start.lat, start_lon: routeA.start.lng,
                end_lat: routeA.end.lat, end_lon: routeA.end.lng,
                frequency: parseInt(freqA), is_electric: parseInt(elecA)
            }),
            axios.post('https://transport-roi-engine.onrender.com/predict-roi', {
                start_lat: routeB.start.lat, start_lon: routeB.start.lng,
                end_lat: routeB.end.lat, end_lon: routeB.end.lng,
                frequency: parseInt(freqB), is_electric: parseInt(elecB)
            })
        ]);

        setRouteA(prev => ({ ...prev, result: resA.data }));
        setRouteB(prev => ({ ...prev, result: resB.data }));

    } catch (err) {
        alert("Comparison failed. Check backend.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{height: 'calc(100vh - 70px)'}}>
      
      {/* SIDEBAR - SPLIT VIEW */}
      <div className="sidebar" style={{width: '400px'}}>
        <div className="header-box">
          <h2>⚖️ Route Comparison</h2>
          <small>A/B Testing Lab</small>
        </div>

        {/* INPUTS ROW */}
        <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
            {/* ROUTE A CONTROLS */}
            <div className="card" style={{flex: 1, borderTop: '4px solid #007bff'}}>
                <h4>Route A (Blue)</h4>
                <div className="status-row" style={{fontSize: '11px'}}>
                    <span className={routeA.start ? "status-ok" : "status-waiting"} 
                          onClick={() => setActiveSelector('A_start')} style={{cursor:'pointer'}}>
                          {routeA.start ? "Start Set" : "Set Start"}
                    </span>
                    <span className={routeA.end ? "status-ok" : "status-waiting"}
                          onClick={() => setActiveSelector('A_end')} style={{cursor:'pointer'}}>
                          {routeA.end ? "End Set" : "Set End"}
                    </span>
                </div>
                <label>Freq:</label>
                <input type="number" value={freqA} onChange={e => setFreqA(e.target.value)} style={{width:'100%'}}/>
                <select value={elecA} onChange={e => setElecA(e.target.value)} style={{width:'100%', marginTop:'5px'}}>
                    <option value="1">Electric</option>
                    <option value="0">Diesel</option>
                </select>
            </div>

            {/* ROUTE B CONTROLS */}
            <div className="card" style={{flex: 1, borderTop: '4px solid #9C27B0'}}>
                <h4>Route B (Purple)</h4>
                <div className="status-row" style={{fontSize: '11px'}}>
                    <span className={routeB.start ? "status-ok" : "status-waiting"}
                          onClick={() => setActiveSelector('B_start')} style={{cursor:'pointer'}}>
                          {routeB.start ? "Start Set" : "Set Start"}
                    </span>
                    <span className={routeB.end ? "status-ok" : "status-waiting"}
                          onClick={() => setActiveSelector('B_end')} style={{cursor:'pointer'}}>
                          {routeB.end ? "End Set" : "Set End"}
                    </span>
                </div>
                <label>Freq:</label>
                <input type="number" value={freqB} onChange={e => setFreqB(e.target.value)} style={{width:'100%'}}/>
                <select value={elecB} onChange={e => setElecB(e.target.value)} style={{width:'100%', marginTop:'5px'}}>
                    <option value="1">Electric</option>
                    <option value="0">Diesel</option>
                </select>
            </div>
        </div>

        <button onClick={handleCompare} disabled={loading} className="primary-btn" style={{width: '100%', marginBottom:'10px'}}>
            {loading ? "Simulating Both..." : "⚔️ Run Comparison"}
        </button>
        
        <div style={{textAlign:'center', fontSize:'12px', color:'#666', background:'#f8f9fa', padding:'5px', borderRadius:'4px'}}>
            Targeting: <strong>{activeSelector ? activeSelector.replace('_', ' ').toUpperCase() : "Ready"}</strong>
        </div>

        {/* COMPARISON RESULTS TABLE */}
        {routeA.result && routeB.result && (
            <div className="card fade-in">
                <h3>🏆 The Verdict</h3>
                <table style={{width: '100%', fontSize: '13px', textAlign: 'center', borderCollapse:'collapse'}}>
                    <thead>
                        <tr style={{borderBottom:'1px solid #eee'}}>
                            <th style={{textAlign:'left'}}>Metric</th>
                            <th style={{color:'#007bff'}}>Route A</th>
                            <th style={{color:'#9C27B0'}}>Route B</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{textAlign:'left', padding:'8px 0'}}>Daily Cost</td>
                            <td>₹{routeA.result.predictions.daily_cost.toLocaleString()}</td>
                            <td>₹{routeB.result.predictions.daily_cost.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{textAlign:'left', padding:'8px 0'}}>Revenue</td>
                            <td>₹{routeA.result.predictions.daily_revenue.toLocaleString()}</td>
                            <td>₹{routeB.result.predictions.daily_revenue.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{textAlign:'left', padding:'8px 0'}}><strong>ROI</strong></td>
                            <td style={{fontWeight:'bold', color: routeA.result.predictions.roi_percent > 0 ? 'green' : 'red'}}>
                                {routeA.result.predictions.roi_percent}%
                            </td>
                            <td style={{fontWeight:'bold', color: routeB.result.predictions.roi_percent > 0 ? 'green' : 'red'}}>
                                {routeB.result.predictions.roi_percent}%
                            </td>
                        </tr>
                        <tr>
                            <td style={{textAlign:'left', padding:'8px 0'}}>Result</td>
                            <td style={{fontSize:'10px'}}>{routeA.result.verdict.status}</td>
                            <td style={{fontSize:'10px'}}>{routeB.result.verdict.status}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )}

      </div>

      {/* MAP AREA */}
      <div className="map-container" style={{position:'relative'}}>
         <div className="map-controls" style={{position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background:'white', padding:'10px', borderRadius:'5px'}}>
            <label style={{display:'block', cursor:'pointer'}}>
                <input type="checkbox" checked={showMetro} onChange={e => setShowMetro(e.target.checked)} /> 
                🚇 Metro Lines
            </label>
         </div>

        <MapContainer center={BANGALORE_CENTER} zoom={12} scrollWheelZoom={true} maxBounds={BLR_BOUNDS} minZoom={11}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles" />
            
            <LocationMarker />

            {/* ROUTE A - BLUE */}
            {routeA.start && <Marker position={routeA.start}><Popup>A Start</Popup></Marker>}
            {routeA.end && <Marker position={routeA.end}><Popup>A End</Popup></Marker>}
            {routeA.result && (
                <Polyline positions={routeA.result.route_details.path_geometry} pathOptions={{ color: '#007bff', weight: 6 }} />
            )}

            {/* ROUTE B - PURPLE */}
            {routeB.start && <Marker position={routeB.start}><Popup>B Start</Popup></Marker>}
            {routeB.end && <Marker position={routeB.end}><Popup>B End</Popup></Marker>}
            {routeB.result && (
                <Polyline positions={routeB.result.route_details.path_geometry} pathOptions={{ color: '#9C27B0', weight: 6, dashArray: '10, 10' }} />
            )}
            
            {/* Context Layers */}
            {showMetro && METRO_LINES.map((line, idx) => (
                <Polyline key={`metro-${idx}`} positions={line.path} pathOptions={{ color: line.color, weight: 3, opacity: 0.5 }} />
            ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Comparison;