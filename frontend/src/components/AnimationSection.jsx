import React from 'react';
import Lottie from 'lottie-react';

const AnimationSection = ({ animationData, visible }) => {
  if (!visible) return null; // Do not render if not visible

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Lottie animationData={animationData} style={{ height: '300px', width: '300px' }} />
    </div>
  );
};

export default AnimationSection;
