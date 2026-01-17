import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import { METRO_LINES, BUS_CORRIDORS } from './MapLayers'; // Import standard map layers
import 'leaflet/dist/leaflet.css';
import './App.css';

const BLR_BOUNDS = [[12.8340125, 77.4601025], [13.1436649, 77.7840515]];
const BANGALORE_CENTER = [12.9716, 77.5946];

function GapFinder() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Layer Toggles
  const [showMetro, setShowMetro] = useState(true); // Default to ON for context
  const [showBus, setShowBus] = useState(false);

  // Auto-load gaps when page opens
  useEffect(() => {
    const fetchGaps = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://transport-roi-engine.onrender.com/analyze-gaps');
            setGaps(response.data.gaps);
        } catch (err) {
            setError("Failed to load gap data. Is backend running?");
        } finally {
            setLoading(false);
        }
    };
    fetchGaps();
  }, []);

  return (
    <div className="dashboard-container" style={{height: 'calc(100vh - 70px)'}}>
      {/* Sidebar Info */}
      <div className="sidebar">
        <div className="header-box">
          <h2>Network Gap Finder</h2>
          <small>Identifies Metro Stations with poor bus connectivity.</small>
        </div>
        
        <div className="card" style={{borderLeft: '5px solid #dc3545'}}>
            <h3>📊 Analysis Logic</h3>
            <p style={{fontSize:'12px', color:'#555'}}>
                <strong>Gap Score = log(Demand / Supply)</strong>
                <br/><br/>
                We compare Metro Ridership (Demand) against Bus frequency (Supply).
                <br/>
                <span style={{color: '#dc3545'}}>🔴 High Score:</span> Critical shortage of buses.
            </p>
        </div>

        {loading && <div className="card">⏳ Scanning Network...</div>}
        {error && <div className="error-box">{error}</div>}

        <div className="gap-list" style={{overflowY: 'auto', flex: 1}}>
            {gaps.map((gap, idx) => (
                <div key={idx} className="card" style={{marginBottom:'10px', position:'relative'}}>
                    {/* Header: Name & Score */}
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <strong>{gap.name}</strong>
                        <span style={{
                            background: gap.gap_score > 85 ? '#dc3545' : '#ffc107',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            Gap: {gap.gap_score}
                        </span>
                    </div>

                    {/* Stats Grid with Safety Checks */}
                    <div style={{display:'flex', justifyContent:'space-between', marginTop:'8px', fontSize:'12px', color:'#666'}}>
                        <div>
                            <span>🚇 Demand</span>
                            <div style={{fontWeight:'bold', color:'#333'}}>
                                {(gap.demand || 0).toLocaleString()} pax
                            </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <span>🚌 Supply</span>
                            <div style={{fontWeight:'bold', color:'#333'}}>
                                {(gap.supply || 0)} trips
                            </div>
                        </div>
                    </div>

                    {/* Confidence Badge */}
                    <div style={{
                        marginTop:'8px', 
                        fontSize:'10px', 
                        padding:'4px', 
                        background: gap.confidence && gap.confidence.includes('LOW') ? '#fff3cd' : '#d4edda',
                        color: gap.confidence && gap.confidence.includes('LOW') ? '#856404' : '#155724',
                        borderRadius: '3px',
                        textAlign:'center',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        Confidence: {gap.confidence}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="map-container" style={{position:'relative'}}>
        
        {/* Floating Layer Controls */}
        <div className="map-controls" style={{
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            zIndex: 1000, 
            background: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontSize: '12px'
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
          {/* Grayscale-ish Map Tiles to make colors pop */}
          <TileLayer 
            attribution='&copy; OpenStreetMap' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            className="map-tiles"
          />
          
          {/* LAYER: Metro Lines */}
          {showMetro && METRO_LINES.map((line, idx) => (
                <Polyline 
                    key={`metro-${idx}`} 
                    positions={line.path} 
                    pathOptions={{ color: line.color, weight: 4, opacity: 0.5 }} 
                >
                    <Popup>{line.name}</Popup>
                </Polyline>
            ))}

            {/* LAYER: Bus Corridors */}
            {showBus && BUS_CORRIDORS.map((route, idx) => (
                <Polyline 
                    key={`bus-${idx}`} 
                    positions={route.path} 
                    pathOptions={{ color: route.color, weight: 3, dashArray: '5, 5', opacity: 0.5 }} 
                >
                    <Popup>{route.name}</Popup>
                </Polyline>
            ))}
          
          {/* LAYER: Gap Markers (Target Style) */}
          {gaps.map((gap, idx) => {
            // Dynamic Color Logic
            let color = '#FBC02D'; // Medium (Yellow)
            if (gap.gap_score > 85) color = '#D32F2F'; // Critical (Red)
            else if (gap.gap_score > 60) color = '#F57C00'; // High (Orange)

            return (
                <React.Fragment key={idx}>
                    {/* 1. Outer Ring (Radar Effect) */}
                    <CircleMarker 
                        center={[gap.lat, gap.lon]}
                        radius={gap.gap_score / 2.5} 
                        pathOptions={{ 
                            color: color,
                            fillColor: color, 
                            fillOpacity: 0.1, 
                            weight: 2,
                            dashArray: gap.gap_score > 85 ? null : '5, 5'
                        }}
                    >
                        <Popup>
                            <strong>{gap.name}</strong><br/>
                            Gap Score: <b>{gap.gap_score}</b>
                        </Popup>
                    </CircleMarker>

                    {/* 2. Inner Dot (Station Location) */}
                    <CircleMarker 
                        center={[gap.lat, gap.lon]}
                        radius={4} 
                        pathOptions={{ 
                            color: 'white', 
                            weight: 1,
                            fillColor: color, 
                            fillOpacity: 1 
                        }}
                    />
                </React.Fragment>
            )
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default GapFinder;