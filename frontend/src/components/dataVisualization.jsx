// Visualization Component
import React from 'react';
import DotGraph from './dotGraph/graph';
import BarGraph from './barGraph';
import '../styles/global-styles.css'; // Import CSS styles

const VisualizationPage = () => {
  return (
    <div>
      <DotGraph />
      <BarGraph />
    </div>
  );
};

export default VisualizationPage;
