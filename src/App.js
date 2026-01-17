import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Navbar from './Navbar';
import Home from './Home';
import BMTCPage from './BMTCPage';
import MetroPage from './MetroPage';
import IntegrationPage from './IntegrationPage';
import Dashboard from './Dashboard';
import GapFinder from './GapFinder';
import Comparison from './Comparison';
import Diagnostics from './Diagnostics';
import InvestmentPage from './InvestmentPage';
import ChatWidget from './ChatWidget'; 
import './App.css';

// Fix for Leaflet Icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navbar />
          
          {/* Main Content - FIXED: Added proper padding for navbar */}
          <div className="main-content" style={{
            paddingTop: '80px', // Space for fixed navbar (64px mobile, 80px desktop)
            minHeight: '100vh'
          }}>
            <Routes>
              {/* MAIN LANDING PAGES */}
              <Route path="/" element={<Home />} />
              <Route path="/bmtc" element={<BMTCPage />} />
              <Route path="/metro" element={<MetroPage />} />
              <Route path="/integration" element={<IntegrationPage />} />
              <Route path="/investment" element={<InvestmentPage />} />
              
              {/* FUNCTIONAL TOOLS */}
              <Route path="/planner" element={<Dashboard />} />
              <Route path="/gaps" element={<GapFinder />} />
              <Route path="/compare" element={<Comparison />} />
              <Route path="/diagnose" element={<Diagnostics />} />
            </Routes>
          </div>
          
          {/* Chat Widget (Floating) */}
          <ChatWidget />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;