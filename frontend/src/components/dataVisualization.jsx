import React, { useState } from 'react';
import DotGraph from './dotGraph/graph';
import BarGraph from './barGraph';
import '../styles/global-styles.css'; // Import CSS styles
import '../styles/graph.css'; // Import CSS styles

const VisualizationPage = () => {
  const [isBarGraphVisible, setIsBarGraphVisible] = useState(true); // State to toggle BarGraph visibility

  const toggleBarGraph = () => {
    setIsBarGraphVisible((prevState) => !prevState); // Toggle the visibility
  };

  return (
    <div>
      <DotGraph />
      {/* Button to toggle visibility of BarGraph */}
      <button 
        onClick={toggleBarGraph} 
        className="toggle-button"
      ><p>
        {isBarGraphVisible ? '- Close' : '+ Open'}
        </p></button>

      {/* Conditionally render BarGraph based on visibility */}
      {isBarGraphVisible && <BarGraph isVisible={isBarGraphVisible} />}
    </div>
  );
};

export default VisualizationPage;
