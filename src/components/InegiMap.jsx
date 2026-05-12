import React, { useEffect, useRef } from 'react';

export default function InegiMap({ token }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!window.ol || mapInstance.current) return;

    // Source for INEGI WMS layers
    const inegiSource = new window.ol.source.TileWMS({
      url: 'https://mapaserver.inegi.org.mx/wms/mapabase/c611', // INEGI WMS Endpoint
      params: { 'LAYERS': 'limite_estatal,limite_municipal', 'TILED': true },
      serverType: 'geoserver',
      transition: 0,
    });

    const inegiLayer = new window.ol.layer.Tile({
      source: inegiSource,
      opacity: 0.7
    });

    const baseLayer = new window.ol.layer.Tile({
      source: new window.ol.source.OSM(),
    });

    mapInstance.current = new window.ol.Map({
      target: mapRef.current,
      layers: [baseLayer, inegiLayer],
      view: new window.ol.View({
        center: window.ol.proj.fromLonLat([-102.5528, 23.6345]), // Center of Mexico
        zoom: 5,
      }),
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem', position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}
      ></div>
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        background: 'rgba(15, 17, 26, 0.9)', 
        padding: '0.75rem', 
        borderRadius: '8px', 
        border: '1px solid var(--border-color)',
        fontSize: '0.75rem'
      }}>
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-color)' }}>Capas INEGI Activas</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }}></div>
          <span>División Estatal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div>
          <span>Límites Municipales</span>
        </div>
      </div>
      <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Utilizando OpenLayers 6.5 + WMS INEGI para análisis de ubicación estratégica.
      </p>
    </div>
  );
}
