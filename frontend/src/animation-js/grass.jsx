import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '../lottie-animations-json/grass.json'; // Ensure the path to your JSON is correct

const Grass = () => {
  const lottieInstanceRef = useRef();

  useEffect(() => {
    if (lottieInstanceRef.current) {
      const instance = lottieInstanceRef.current;

      // Play the initial segment (e.g., frames 0 to 90)
      instance.playSegments([0, 90], true); // Adjust frame numbers as needed
    }
  }, []);

  const handleComplete = () => {
    const instance = lottieInstanceRef.current;

    if (instance) {
      // Loop the segment (e.g., frames 60 to 90)
      instance.playSegments([60, 90], true); // Adjust frame numbers as needed
    }
  };

  return (
      <Lottie
        lottieRef={lottieInstanceRef}
        animationData={animationData}
        loop={false} // Disable automatic looping
        autoplay // Start automatically
        onComplete={handleComplete} // Trigger looping when the animation completes
      />
    );
   };

export default Grass;
