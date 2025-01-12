import React, { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '../lottie-animations-json/house.json'; // Ensure the path is correct

const House = () => {
  const lottieInstanceRef = useRef();

  useEffect(() => {
    if (lottieInstanceRef.current) {
      const instance = lottieInstanceRef.current;

      // Play the initial segment (0 to 90)
      instance.playSegments([0, 90], true); // Play the first segment
    }
  }, []);

  const handleComplete = () => {
    const instance = lottieInstanceRef.current;

    if (instance) {
      // Loop the segment from frame 60 to 90
      instance.playSegments([60, 90], true);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '25%',
        width: '25%',
      }}
    >
      <Lottie
        lottieRef={lottieInstanceRef}
        animationData={animationData}
        loop={false} // Disable automatic looping
        autoplay // Start automatically
        onComplete={handleComplete} // Trigger looping when the animation completes
      />
    </div>
  );
};

export default House;
