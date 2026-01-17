import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import { METRO_LINES } from './MapLayers';
import metroData from './metro_data.json'; 
import './App.css';

const BANGALORE_CENTER = [12.9716, 77.5946];
const MAJESTIC_COORDS = { lat: 12.9778, lng: 77.5713 };

function MetroPage() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [stats, setStats] = useState(null);       
  const [roiStats, setRoiStats] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('connectivity'); 

  // --- AI STATE ---
  const [aiMode, setAiMode] = useState(false);
  const [clusters, setClusters] = useState([]);

  // --- HELPER: Distance ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  // --- LOAD STANDARD STATIONS ---
  const stations = [];
  if (metroData && metroData.features) {
      metroData.features.forEach(f => {
          if (f.geometry.type === "Point") {
             stations.push({
                 name: f.properties.Name,
                 lat: f.geometry.coordinates[1],
                 lng: f.geometry.coordinates[0]
             });
          }
      });
  }

  // --- TOGGLE AI MODE ---
  const toggleAiMode = async () => {
    if (!aiMode && clusters.length === 0) {
        // Fetch Clusters only if not loaded
        try {
            const res = await axios.get('https://transport-roi-engine.onrender.com/get-station-clusters');
            if(res.data.status === 'success') {
                setClusters(res.data.data);
            }
        } catch(err) {
            console.error("AI Cluster Error", err);
            alert("Ensure backend is running and clustering_engine.py is saved.");
        }
    }
    setAiMode(!aiMode);
  };

  // --- HANDLERS ---
  const handleStationClick = async (station) => {
      setSelectedStation(station);
      setStats(null);
      setRoiStats(null);
      setLoading(true);
      setActiveTab('connectivity'); 

      try {
          const response = await axios.post('https://transport-roi-engine.onrender.com/analyze-station', {
              name: station.name,
              lat: station.lat,
              lon: station.lng
          });
          setStats(response.data);
      } catch (err) { console.error("GIS Error:", err); } 
      finally { setLoading(false); }
  };

  const handleTabSwitch = async (tab) => {
    setActiveTab(tab);
    if (tab === 'roi' && !roiStats && stats) {
        try {
            const dist = calculateDistance(
                selectedStation.lat, selectedStation.lng, 
                MAJESTIC_COORDS.lat, MAJESTIC_COORDS.lng
            );
            const res = await axios.post('https://transport-roi-engine.onrender.com/predict-metro-roi', {
                feeder_count: stats.feeder_routes_count, 
                dist_center: dist
            });
            setRoiStats(res.data);
        } catch (err) {
            console.error("ROI ML Error:", err);
            setRoiStats({ error: "Failed to connect to ML Server" });
        }
    }
  };

  return (
    <div className="dashboard-container" style={{display:'flex', height:'calc(100vh - 50px)'}}>
        
        {/* SIDEBAR */}
        <div className="sidebar" style={{width:'400px', borderRight:'1px solid #ddd', display:'flex', flexDirection:'column', background:'white'}}>
            <div className="header-box" style={{borderLeft:'5px solid #9C27B0', padding:'20px', background:'#f3e5f5'}}>
                <h2 style={{margin:0, color:'#4a148c'}}>🚇 Station Analytics</h2>
                <small style={{color:'#6a1b9a'}}>Select a station on the map to analyze.</small>
            </div>

            {!selectedStation && (
                <div style={{padding:'40px', color:'#999', textAlign:'center', flex:1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
                    <div style={{fontSize:'40px', marginBottom:'10px'}}>👆</div>
                    <p>Click a station marker on the map<br/>to generate insights.</p>
                </div>
            )}

            {selectedStation && (
                <div style={{flex:1, display:'flex', flexDirection:'column'}}>
                    {/* TABS */}
                    <div style={{display:'flex', borderBottom:'1px solid #ddd'}}>
                        <div onClick={() => handleTabSwitch('connectivity')} style={{flex:1, padding:'15px', textAlign:'center', cursor:'pointer', background: activeTab === 'connectivity' ? '#fff' : '#f9f9f9', borderBottom: activeTab === 'connectivity' ? '3px solid #9C27B0' : 'none', color: activeTab === 'connectivity' ? '#9C27B0' : '#888', fontWeight: 'bold'}}>📡 Connectivity</div>
                        <div onClick={() => handleTabSwitch('roi')} style={{flex:1, padding:'15px', textAlign:'center', cursor:'pointer', background: activeTab === 'roi' ? '#fff' : '#f9f9f9', borderBottom: activeTab === 'roi' ? '3px solid #2e7d32' : 'none', color: activeTab === 'roi' ? '#2e7d32' : '#888', fontWeight: 'bold'}}>💰 ROI Forecast</div>
                    </div>

                    {/* CONTENT */}
                    <div style={{padding:'20px', overflowY:'auto'}}>
                        <h3 style={{marginTop:0, marginBottom:'20px'}}>{selectedStation.name}</h3>
                        {loading ? (<div style={{textAlign:'center', padding:'20px', color:'#666'}}><div className="loader"></div><p>Running Network Analysis...</p></div>) : stats ? (
                            <>
                                {activeTab === 'connectivity' && (
                                    <div className="fade-in">
                                        <div className="verdict-box" style={{padding:'15px', borderRadius:'8px', background: stats.connectivity_score > 6 ? '#e8f5e9' : '#ffebee', color: stats.connectivity_score > 6 ? '#2e7d32' : '#c62828', marginBottom:'20px'}}><strong>{stats.verdict}</strong></div>
                                        <div className="stat-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                            <div style={{background:'#f5f5f5', padding:'10px', borderRadius:'5px'}}><small style={{color:'#666'}}>Connectivity Score</small><div className="stat-val" style={{fontSize:'20px', fontWeight:'bold'}}>{stats.connectivity_score}/10</div></div>
                                            <div style={{background:'#f5f5f5', padding:'10px', borderRadius:'5px'}}><small style={{color:'#666'}}>Bus Corridors</small><div className="stat-val" style={{fontSize:'20px', fontWeight:'bold'}}>{stats.feeder_routes_count}</div></div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'roi' && (
                                    <div className="fade-in">
                                        {roiStats && !roiStats.error ? (
                                            <>
                                                <div style={{background:'#e3f2fd', padding:'15px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #bbdefb'}}><div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px'}}><span style={{fontSize:'16px'}}>🤖</span><strong style={{color:'#1565c0'}}>Real Data ML Model</strong></div></div>
                                                <div className="stat-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                                                    <div><small style={{color:'#666'}}>Pred. Ridership</small><div className="stat-val" style={{fontSize:'18px', fontWeight:'bold'}}>{roiStats.predictions.ridership.toLocaleString()}</div></div>
                                                    <div><small style={{color:'#666'}}>Net Profit</small><div className="stat-val" style={{fontSize:'18px', fontWeight:'bold', color: roiStats.predictions.profit > 0 ? 'green' : 'red'}}>{roiStats.predictions.profit > 0 ? '+' : ''}₹{(roiStats.predictions.profit/1000).toFixed(1)}k</div></div>
                                                </div>
                                            </>
                                        ) : <div style={{textAlign:'center', padding:'40px', color:'#666'}}><p>Loading Prediction...</p></div>}
                                    </div>
                                )}
                            </>
                        ) : <div style={{color:'red', textAlign:'center', marginTop:'20px'}}>Error loading station data.</div>}
                    </div>
                </div>
            )}
        </div>

        {/* MAP */}
        <div style={{flex:1, position:'relative'}}>
            
            {/* ✨ AI TOGGLE BUTTON ✨ */}
            <div 
                onClick={toggleAiMode}
                style={{
                    position:'absolute', top:'20px', right:'20px', zIndex:1000,
                    background: aiMode ? '#000' : '#fff', color: aiMode ? '#fff' : '#333',
                    padding:'10px 20px', borderRadius:'30px', cursor:'pointer',
                    boxShadow:'0 4px 10px rgba(0,0,0,0.2)', fontWeight:'bold',
                    display:'flex', alignItems:'center', gap:'10px', transition:'all 0.3s'
                }}
            >
                <span>✨</span>
                {aiMode ? "Disable AI Vision" : "Enable AI Segmentation"}
            </div>

            {/* AI LEGEND */}
            {aiMode && (
                <div style={{
                    position:'absolute', bottom:'30px', right:'20px', zIndex:1000,
                    background:'rgba(255,255,255,0.95)', padding:'15px', borderRadius:'10px',
                    boxShadow:'0 4px 15px rgba(0,0,0,0.1)', fontSize:'12px'
                }}>
                    <strong style={{display:'block', marginBottom:'10px'}}>🧠 AI Discovered Clusters</strong>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px'}}><div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#f44336'}}></div> High-Volume Hub</div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px'}}><div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#4CAF50'}}></div> Residential Origin</div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px'}}><div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#2196F3'}}></div> Corporate Dest.</div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#9C27B0'}}></div> Undervalued / Potential</div>
                </div>
            )}

            <MapContainer center={BANGALORE_CENTER} zoom={12} style={{height:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {METRO_LINES.map((line, idx) => (
                    <Polyline key={idx} positions={line.path} pathOptions={{ color: aiMode ? '#ddd' : line.color, weight: 5, opacity: 0.5 }} />
                ))}

                {/* RENDER STATIONS: EITHER STANDARD OR AI CLUSTERED */}
                {aiMode && clusters.length > 0 ? (
                    // AI MODE MARKERS
                    clusters.map((stn, idx) => (
                        <CircleMarker 
                            key={`ai-${idx}`} 
                            center={[stn.lat, stn.lon]} 
                            radius={8}
                            pathOptions={{ color: 'white', fillColor: stn.cluster_info.color, fillOpacity: 0.9, weight: 2 }}
                        >
                            <Popup>
                                <strong>{stn.name}</strong><br/>
                                <span style={{color: stn.cluster_info.color, fontWeight:'bold'}}>{stn.cluster_info.label}</span><br/>
                                <small>{stn.cluster_info.desc}</small>
                            </Popup>
                        </CircleMarker>
                    ))
                ) : (
                    // STANDARD MARKERS
                    stations.map((stn, idx) => (
                        <CircleMarker 
                            key={idx} 
                            center={[stn.lat, stn.lng]} 
                            radius={6}
                            pathOptions={{ color: 'white', fillColor: selectedStation?.name === stn.name ? '#FFEB3B' : '#333', fillOpacity: 1, weight: 2 }}
                            eventHandlers={{ click: () => handleStationClick(stn) }}
                        >
                            <Popup>{stn.name}</Popup>
                        </CircleMarker>
                    ))
                )}
            </MapContainer>
        </div>
    </div>
  );
}

export default MetroPage;