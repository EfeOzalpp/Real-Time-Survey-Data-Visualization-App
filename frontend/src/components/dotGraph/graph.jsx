import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import DotGraph from './dotGraph'; 
import { fetchSurveyData } from '../../utils/sanityAPI';
import '../../styles/graph.css';
import { isDragging } from '../../components/dataVisualization'; 

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
    <div className="graph-container" style={{ height: '100svh',  width: '100%' }}>
      <Canvas camera={{ position: [0, 0, 25], fov: 20 }}>
        <ambientLight intensity={1.2} penumbra={1.5} />
        <directionalLight
          position={[13, 13, 13]}
          intensity={1.1}
          penumbra={2.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0005}
        />
        <spotLight   
          position={[0, 0, 0]} 
          intensity={2.1} // Keep it bright
          angle={Math.PI / 1} // Widen the beam (increase from Math.PI / 16)
          penumbra={7.5} 
          distance={10000} 
          decay={0.2} // No intensity falloff with distance
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          castShadow />

        <meshStandardMaterial metalness={0.8} roughness={0} />

        {/* Pass rewired surveyData to DotGraph */}
        <DotGraph data={surveyData} isDragging={isDragging} />
      </Canvas>
    </div>
  );
};

export default Graph;
