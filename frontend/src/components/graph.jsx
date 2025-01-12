import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import GraphBars from './GraphBars';
import { fetchSurveyData } from '../utils/sanityAPI';
import '../styles/graph.css'; // Graph-specific styles

const Graph = () => {
  const [surveyData, setSurveyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSurveyData(); // Fetch data from Sanity
        setSurveyData(data);
      } catch (error) {
        console.error('Error fetching survey data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadData();

    // Poll for updates every 10 seconds
    const interval = setInterval(loadData, 100);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (loading) {
    return <p className="graph-loading"></p>; // Loading message styling
  }

  return (
    <div className="graph-container" style={{ height: '100vh', width: '100%' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 33 }}>
        {/* Ambient light for overall illumination */}
        <ambientLight intensity={1} />

        {/* Wider directional light */}
        <directionalLight
          position={[10, 10, 10]}
          intensity={1.2}
          castShadow
        />

        {/* Spot light with wider spread */}
        <spotLight
          position={[0, 10, 10]}
          intensity={1}
          angle={Math.PI / 16} // Adjust the angle for a wider spread
          penumbra={0.8} // Softer edges
          castShadow
        />

        <GraphBars data={surveyData} />
      </Canvas>
    </div>
  );
};

export default Graph;
