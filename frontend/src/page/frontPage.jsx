import React, { useState } from 'react';
import '../styles/survey.css';
import '../styles/global-styles.css';
import '../styles/AnimationStyles.css';
import RadialBackground from '../components/static/radialBackground';
import Survey from '../components/survey.jsx';
import CenteredLogo from '../components/static/logo';
import Canvas from '../components/Canvas';
import DataVisualization from '../components/dataVisualization'; 

const FrontPage = () => {
  const [animationVisible, setAnimationVisible] = useState(false);
  const [graphVisible, setGraphVisible] = useState(false); // Controls visibility, not rendering

  return (
    <div className="main-section">
      <div className="logo-divider">
        <CenteredLogo />
      </div>
      <div className="animation-section-wrapper">
        {!animationVisible && <Canvas />} {/* Render Canvas only when animationVisible is true */}
      </div>
      {/* Graph always renders, visibility controlled by class */}
      <div className={`graph-wrapper ${graphVisible ? 'visible' : 'hidden'}`}>
        <DataVisualization />
      </div>
      <div className="survey-section-wrapper">
        <Survey
          setAnimationVisible={setAnimationVisible}
          setGraphVisible={setGraphVisible}
        />
      </div>
      <RadialBackground />
    </div>
  );
};

export default FrontPage;
