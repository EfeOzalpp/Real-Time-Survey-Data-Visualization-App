import React, { useState, useRef, useEffect } from 'react';
import DotGraph from './dotGraph/graph';
import BarGraph from './barGraph';
import '../styles/global-styles.css';
import '../styles/graph.css';

const VisualizationPage = () => {
  const [isBarGraphVisible, setIsBarGraphVisible] = useState(true);

  // State to track initial positions
  const [position, setPosition] = useState(() => {
    // Dynamically calculate starting position based on viewport size
    const initialX = window.innerWidth * 0.8; // 80% from the left
    const initialY = window.innerHeight * 0.1; // 10% from the top
    return { x: initialX, y: initialY };
  });

  const dragRef = useRef(null); // Ref for the draggable container
  const buttonRef = useRef(null); // Ref for the button
  const isDragging = useRef(false); // Drag state
  const dragOffset = useRef({ x: 0, y: 0 }); // Offset from the mouse click position

  const toggleBarGraph = () => {
    setIsBarGraphVisible((prevState) => !prevState); // Toggle bar graph visibility
  };

  const handleDragStart = (e) => {
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    isDragging.current = true;
  };

  const handleDrag = (e) => {
    if (!isDragging.current) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonRect = buttonRef.current.getBoundingClientRect(); // Get button size

    // Calculate new position
    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;

    // Boundary checks for the button
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + buttonRect.width > viewportWidth) newX = viewportWidth - buttonRect.width;
    if (newY + buttonRect.height > viewportHeight) newY = viewportHeight - buttonRect.height;

    // Update position
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e);
    const handleMouseUp = () => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div>
      <DotGraph />

      {/* Draggable container */}
      <div
        ref={dragRef}
        className="draggable-container"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 10,
        }}
        onMouseDown={handleDragStart}
      >
        {/* Toggle Button */}
        <div
          ref={buttonRef}
          className="toggle-button"
          style={{
            cursor: 'grab',
            left: '24px', // Offset applied only to the button
            position: 'relative', // Ensures the left offset is relative to its parent
          }}
          onClick={toggleBarGraph}
        >
          {isBarGraphVisible ? '- Close' : '+ Open'}
        </div>

        {/* Bar Graph */}
        {isBarGraphVisible && (
          <div className="draggable-bar-graph">
            <BarGraph isVisible />
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizationPage;
