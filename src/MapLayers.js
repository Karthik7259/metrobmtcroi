import metroData from './metro_data.json';
import busData from './routes.2018.json'; // <--- Import your new file

// --- HELPER: Process GeoJSON to Leaflet Format ---
const processMetroLines = (data) => {
  const lines = [];
  
  if (!data || !data.features) return lines;

  data.features.forEach(feature => {
    if (feature.geometry.type === 'LineString') {
        let color = '#555'; 
        const desc = (feature.properties.description || "").toLowerCase();
        const name = (feature.properties.Name || "").toLowerCase();

        if (desc.includes('purple') || name.includes('purple')) color = '#9C27B0';
        else if (desc.includes('green') || name.includes('green')) color = '#2E7D32';
        else if (desc.includes('yellow') || name.includes('yellow')) color = '#FBC02D';
        else if (desc.includes('blue') || name.includes('blue')) color = '#1565C0';
        else if (desc.includes('pink') || name.includes('pink')) color = '#E91E63';

        // Swap [Lon, Lat] -> [Lat, Lon]
        const path = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        lines.push({
            name: feature.properties.Name,
            color: color,
            path: path
        });
    }
  });
  return lines;
};

// --- NEW HELPER: Process Bus Routes ---
const processBusRoutes = (data) => {
    const routes = [];
    
    if (!data || !data.features) return routes;

    // 1. Sort routes by 'trips' (Frequency) to show only the busiest ones
    // This prevents the map from becoming unreadable with 2000+ lines
    const sortedFeatures = data.features.sort((a, b) => {
        return (b.properties.trips || 0) - (a.properties.trips || 0);
    });

    // 2. Take Top 50 Busiest Routes
    const topRoutes = sortedFeatures.slice(0, 50);

    topRoutes.forEach(feature => {
        if (feature.geometry.type === 'LineString') {
            // Swap [Lon, Lat] -> [Lat, Lon]
            const path = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            // Format Name: "335-E: Majestic -> Kadugodi (120 trips)"
            const name = `${feature.properties.route}: ${feature.properties.origin} ➝ ${feature.properties.destination} (${feature.properties.trips} trips)`;

            routes.push({
                name: name,
                color: '#000000ff', // BMTC Orange
                weight: 2,        // Thinner lines for buses
                path: path
            });
        }
    });

    return routes;
};

// --- EXPORTS ---
export const METRO_LINES = processMetroLines(metroData);
export const BUS_CORRIDORS = processBusRoutes(busData); // <--- Now uses real data