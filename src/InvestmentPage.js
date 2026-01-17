import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import './App.css';

const BANGALORE_CENTER = [12.9716, 77.5946];

function InvestmentPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        try {
            const res = await axios.get('https://transport-roi-engine.onrender.com/get-investment-recommendations');
            if (res.data.status === 'success') {
                setPlans(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch investments", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container" style={{display:'flex', height:'calc(100vh - 50px)', background:'#f4f7f6'}}>
            
            {/* LEFT PANEL: PROJECT LIST */}
            <div style={{width:'500px', padding:'20px', overflowY:'auto', background:'white', borderRight:'1px solid #ddd'}}>
                <div style={{marginBottom:'20px', borderLeft:'5px solid #009688', paddingLeft:'15px'}}>
                    <h2 style={{margin:0, color:'#00796b'}}>🏗️ Future Projects</h2>
                    <p style={{margin:'5px 0 0 0', color:'#666', fontSize:'13px'}}>
                        AI-Proposed Infrastructure Expansions based on Population Density & Connectivity Gaps.
                    </p>
                </div>

                {loading ? (
                    <div style={{textAlign:'center', padding:'40px', color:'#999'}}>
                        <div className="loader"></div>
                        <p>Simulating Network Expansions...</p>
                    </div>
                ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        {plans.map((item, idx) => (
                            <div key={idx} className="fade-in" style={{
                                padding:'15px', borderRadius:'8px', 
                                border:'1px solid #eee', background:'white',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                {/* HEADER */}
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                                    <div>
                                        <div style={{fontSize:'10px', color:'#999', textTransform:'uppercase', fontWeight:'bold'}}>
                                            {item.project_type}
                                        </div>
                                        <h3 style={{margin:0, color:'#333', fontSize:'16px'}}>{item.zone}</h3>
                                    </div>
                                    <span style={{
                                        fontSize:'11px', padding:'3px 8px', borderRadius:'10px',
                                        background: item.recommendation.priority === 'Critical' ? '#ffebee' : '#e3f2fd',
                                        color: item.recommendation.priority === 'Critical' ? '#c62828' : '#1565c0',
                                        fontWeight:'bold'
                                    }}>
                                        {item.recommendation.priority}
                                    </span>
                                </div>

                                {/* INVESTMENT DETAILS GRID */}
                                <div style={{background:'#e0f2f1', padding:'10px', borderRadius:'5px', marginBottom:'10px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'5px'}}>
                                    <div style={{textAlign:'center'}}>
                                        <div style={{fontSize:'10px', color:'#00695c'}}>COST</div>
                                        <div style={{fontWeight:'bold', color:'#004d40'}}>{item.investment.cost}</div>
                                    </div>
                                    <div style={{textAlign:'center', borderLeft:'1px solid #b2dfdb'}}>
                                        <div style={{fontSize:'10px', color:'#00695c'}}>TIME</div>
                                        <div style={{fontWeight:'bold', color:'#004d40'}}>{item.investment.duration}</div>
                                    </div>
                                    <div style={{textAlign:'center', borderLeft:'1px solid #b2dfdb'}}>
                                        <div style={{fontSize:'10px', color:'#00695c'}}>LENGTH</div>
                                        <div style={{fontWeight:'bold', color:'#004d40'}}>{item.investment.length}</div>
                                    </div>
                                </div>

                                {/* IMPACT METRICS */}
                                <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#555', marginBottom:'8px'}}>
                                    <span>👥 Impact Pop: <strong>{item.expected_impact.catchment_pop.toLocaleString()}</strong></span>
                                    <span>📈 ROI Score: <strong>{item.expected_impact.roi_index}/100</strong></span>
                                </div>

                                {/* RATIONALE */}
                                <div style={{fontSize:'12px', color:'#666', fontStyle:'italic', borderTop:'1px solid #eee', paddingTop:'8px'}}>
                                    "{item.recommendation.rationale}"
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT PANEL: MAP */}
            <div style={{flex:1}}>
                <MapContainer center={BANGALORE_CENTER} zoom={11} style={{height:'100%'}}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {plans.map((item, idx) => (
                        <CircleMarker 
                            key={idx} 
                            center={[item.coordinates.lat, item.coordinates.lon]} 
                            radius={8}
                            pathOptions={{ 
                                color: 'white', 
                                fillColor: '#009688', 
                                fillOpacity: 0.8, 
                                weight: 2 
                            }}
                        >
                            <Popup>
                                <strong>{item.zone}</strong><br/>
                                Cost: {item.investment.cost}<br/>
                                Length: {item.investment.length}
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

export default InvestmentPage;