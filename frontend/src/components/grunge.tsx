// Grunge texture 

import React, { useState, useEffect } from "react";
import texture1 from "../textures/grain1.png";
import texture2 from "../textures/grain2.png";

const textures = [texture1, texture2];

const GrungeOverlay: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % textures.length);
    }, 200000); // Switch texture every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="grunge-overlay"
      style={{ backgroundImage: `url(${textures[currentIndex]})` }}
    />
  );
};

export default GrungeOverlay;

