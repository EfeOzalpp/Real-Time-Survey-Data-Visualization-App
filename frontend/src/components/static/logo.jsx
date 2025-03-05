/* Top Bar */
import React from 'react';

const CenteredLogo = () => {
  return (
    <><div className="logo-container">
      <div className="logo-divider">
      <img
        src={`${process.env.PUBLIC_URL}/Butterfly-habits-logo-tp.svg`}
        alt="Butterfly Habits Logo"
        className="logo-image" />
        </div><div className="feedback">
        <p><a
          href="https://docs.google.com/document/d/1lBKllYBu-OS34sMtGmJuJjTZlcN09QRPo5EdhCTQueM/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Write feedback x 
        </a></p>
      </div></div></>
  );
};

export default CenteredLogo;

