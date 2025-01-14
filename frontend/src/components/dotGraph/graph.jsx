import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import DotGraph from './dotGraph'; 
import { fetchSurveyData } from '../../utils/sanityAPI';
import '../../styles/graph.css';

const Graph = () => {
  const [surveyData, setSurveyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const initializeData = async () => {
      // Fetch and subscribe to survey data
      unsubscribe = fetchSurveyData((updatedData) => {
        setSurveyData(updatedData);
        setLoading(false);
      });
    };

    initializeData();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return <p className="graph-loading">Loading data...</p>;
  }

  return (
    <div className="graph-container" style={{ height: '100vh', width: '100%' }}>
      <Canvas camera={{ position: [0, 0, 25], fov: 33 }}>
        {/* Ambient light */}
        <ambientLight intensity={1.1} />

        {/* Directional light */}
        <directionalLight position={[13, 13, 13]} intensity={1.3} castShadow />

        {/* Spot light */}
        <spotLight
          position={[0, 10, 10]}
          intensity={1}
          angle={Math.PI / 16}
          penumbra={0.8}
          castShadow
        />
        
        {/* Pass rewired surveyData to DotGraph */}
        <DotGraph data={surveyData} />
      </Canvas>
    </div>
  );
};

export default Graph;
