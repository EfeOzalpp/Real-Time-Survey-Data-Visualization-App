/* Top Bar */
import React from 'react';

const CenteredLogo = () => {
  return (
    <div className="logo-container">
      <img
        src={`${process.env.PUBLIC_URL}/Butterfly-habits-logo-tp.svg`}
        alt="Butterfly Habits Logo"
        className="logo-image"
      />
    </div>
  );
};

export default CenteredLogo;

