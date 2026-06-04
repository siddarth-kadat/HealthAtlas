import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import api from '../services/api';
import { motion } from 'motion/react';
import AppLayout from '../components/AppLayout';

const PREVALENCE_LEGEND = [
 { label: 'Stable', range: '0-5% avg prevalence', color: '#10b981' },
 { label: 'Escalating', range: '5.1-10% avg prevalence', color: '#f59e0b' },
 { label: 'High Alert', range: '10.1-15% avg prevalence', color: '#f97316' },
 { label: 'Critical', range: '>15% avg prevalence', color: '#ef4444' },
 { label: 'No Data', range: 'No prevalence records', color: '#cbd5e1' }
];

const WorldMap = () => {
 const [geoData, setGeoData] = useState(null);
 const [healthData, setHealthData] = useState({});
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 // Fetch GeoJSON
 fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
 .then(res => res.json())
 .then(data => setGeoData(data));

 // Fetch Health Data
 const fetchHealth = async () => {
 try {
 const res = await api.get('/dashboard/map-data');
 setHealthData(res.data);
 } catch (err) {
 console.error('Error fetching map data:', err);
 } finally {
 setLoading(false);
 }
 };
 fetchHealth();
 }, []);

 const getColor = (countryName) => {
 const val = healthData[countryName];
 if (!val) return '#cbd5e1';
 if (val > 15) return '#ef4444';
 if (val > 10) return '#f97316';
 if (val > 5) return '#f59e0b';
 return '#10b981';
 };

 const mapStyle = (feature) => {
 return {
 fillColor: getColor(feature.properties.name),
 weight: 0.5,
 opacity: 1,
 color: 'white',
 fillOpacity: 0.6
 };
 };

 const onEachCountry = (country, layer) => {
 const countryName = country.properties.name;
 const prevalence = healthData[countryName];

 layer.on({
 mouseover: (e) => {
 const l = e.target;
 l.setStyle({ fillOpacity: 0.9, weight: 1.5 });
 },
 mouseout: (e) => {
 const l = e.target;
 l.setStyle({ fillOpacity: 0.6, weight: 0.5 });
 }
 });

 if (prevalence) {
 layer.bindTooltip(`
 <div class="px-2 py-1 font-sans">
 <p class="font-bold text-slate-800">${countryName}</p>
 <p class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Avg Prevalence: ${prevalence.toFixed(1)}%</p>
 </div>
 `);
 }
 };

 return (
 <AppLayout>
 <div className="space-y-6">
 <header>
 <h1 className="text-4xl font-extrabold text-slate-900 tracking-[-0.04em]">Infectious Disease Distribution Heatmap</h1>
 <p className="text-slate-500 mt-2">Spatial analysis of global pathogen transmission vectors.</p>
 </header>

 <div className="h-[650px] w-full rounded-[28px] overflow-hidden glass-card relative">
 <MapContainer 
 center={[20, 0]} 
 zoom={2} 
 className="h-full w-full"
 scrollWheelZoom={false}
 >
 <TileLayer
 url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
 />
 {geoData && (
 <GeoJSON 
 key={`map-${Object.keys(healthData).length}`}
 data={geoData}
 style={mapStyle}
 onEachFeature={onEachCountry}
 />
 )}
 </MapContainer>
 
 <div
 className="absolute top-5 right-5 rounded-[22px] border border-white/80 bg-white/95 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl w-[280px] max-w-[calc(100%-2.5rem)] pointer-events-auto"
 style={{ zIndex: 10000 }}
 >
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prevalence Index</p>
 <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
 Map colors show each country's average disease prevalence rate and corresponding risk condition.
 </p>
 <div className="flex flex-col gap-2.5">
 {PREVALENCE_LEGEND.map((item) => (
 <div key={item.label} className="flex items-center gap-3">
 <span
 className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
 style={{ backgroundColor: item.color }}
 ></span>
 <div className="min-w-0">
 <p className="text-[11px] text-slate-700 font-extrabold leading-none">{item.label}</p>
 <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{item.range}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="p-6 glass-card rounded-[24px] border border-slate-200">
 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Observation Stats</h4>
 <div className="space-y-3">
 {[
 { label: 'Active Clusters', value: '42' },
 { label: 'High Risk Zones', value: '18' },
 { label: 'Sentinel Nodes', value: '1,204' }
 ].map(item => (
 <div key={item.label} className="flex items-center justify-between">
 <span className="text-xs text-slate-600 font-medium">{item.label}</span>
 <span className="text-xs font-bold text-slate-900">{item.value}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </AppLayout>
 );
};

export default WorldMap;
