// Storytelling canvas main component
import React, { useEffect, useState } from 'react';
import House from '../animation-js/house'; 
import Grass from '../animation-js/grass'; 

const Canvas = () => {
  const [housePosition, setHousePosition] = useState({ x: 0, y: 0 });
  const [grassElements, setGrassElements] = useState([]);

  useEffect(() => {
    // Initialize Grass components with specific positions
    setGrassElements([
      {
        transform: { translateX: -225, translateY: -275, scale: 0.2, rotate: 2 },
      },
      {
        transform: { translateX: 325, translateY: -300, scale: 0.175, rotate: -1 },
      },
      {
        transform: { translateX: 125, translateY: -250, scale: 0.225, rotate: 1 },
      },
    ]);
  }, []);

  return (
    <div
      className="canvas-wrapper"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Render the static House */}
      <div
        style={{
          position: 'absolute',
          top: housePosition.y,
          left: housePosition.x,
          transform: 'translate(37.5%, 17.5%)', // Retain the original transform logic for the House
        }}
      >
        <House />
      </div>

      {/* Render the manually positioned Grass components */}
      {grassElements.map((grass, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            transform: `translate(${grass.transform.translateX}px, ${grass.transform.translateY}px) scale(${grass.transform.scale}) rotate(${grass.transform.rotate}deg)`, // Apply scaling and rotation
          }}
        >
          <Grass />
        </div>
      ))}
    </div>
  );
};

export default Canvas;
