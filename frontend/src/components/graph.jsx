import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import GraphBars from './GraphBars';
import { fetchSurveyData } from '../utils/sanityAPI';
import '../styles/graph.css'; // Graph-specific styles

const Graph = () => {
  const [surveyData, setSurveyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const initializeData = async () => {
      unsubscribe = fetchSurveyData((updatedData) => {
        setSurveyData(updatedData);
        setLoading(false); // Stop loading once the data is fetched
      });
    };

    initializeData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return <p className="graph-loading">Loading data...</p>;
  }

  return (
    <div className="graph-container" style={{ height: '100vh', width: '100%' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 33 }}>
        {/* Ambient light */}
        <ambientLight intensity={1} />

        {/* Directional light */}
        <directionalLight position={[10, 10, 10]} intensity={1.2} castShadow />

        {/* Spot light */}
        <spotLight
          position={[0, 10, 10]}
          intensity={1}
          angle={Math.PI / 16}
          penumbra={0.8}
          castShadow
        />

        <GraphBars data={surveyData} />
      </Canvas>
    </div>
  );
};

export default Graph;
