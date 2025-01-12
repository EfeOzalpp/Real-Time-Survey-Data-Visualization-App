import React, { useState } from 'react';
import '../styles/survey.css';
import '../styles/global-styles.css';
import '../styles/top-bar.css';
import '../styles/RadialBackground.css';
import '../styles/AnimationStyles.css';
import RadialBackground from '../components/RadialBackground';
import Survey from '../components/survey.jsx';
import CenteredLogo from '../components/logo';
import Canvas from '../components/Canvas';
import Graph from '../components/graph';

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
        <Graph />
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
