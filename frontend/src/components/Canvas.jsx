// Storytelling canvas main component
import React from 'react';
import House from '../animation-js/house'; 
import Grass from '../animation-js/grass'; 
import '../styles/lottie.css';

const Canvas = () => {

  return (
    <div className="canvas-wrapper">
        <House />
        <div className="grass1">
          <Grass/>
        </div>
        <div className="grass2">
          <Grass/>
        </div>
        <div className="grass3">
          <Grass/>
        </div>
    </div>
  );
};

export default Canvas;
