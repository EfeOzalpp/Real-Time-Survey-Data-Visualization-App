import React, { useState, useRef, useEffect } from 'react';
import DotGraph from './dotGraph/graph';
import BarGraph from './barGraph';
import '../styles/global-styles.css';
import '../styles/graph.css';

// Export these variables
export let isDragging = false;
export let setIsDragging = () => {};

const VisualizationPage = () => {
  const [isBarGraphVisible, setIsBarGraphVisible] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth * 0.8,
    y: window.innerHeight * 0.06,
  }));
  const [dragState, setDragState] = useState(false);

  // Assign the state and setter to exports
  isDragging = dragState;
  setIsDragging = setDragState;

  const dragRef = useRef(null);
  const buttonRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false); // Tracks whether significant movement occurred

  const toggleBarGraph = (e) => {
    if (hasMoved.current) {
      // Prevent toggling if a drag occurred
      e.preventDefault();
      e.stopPropagation();
      hasMoved.current = false; // Reset movement tracking
      return;
    }

    // Toggle the bar graph visibility
    setIsBarGraphVisible((prevState) => !prevState);
  };

  const handleDragStart = (e) => {
    const rect = dragRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragOffset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    hasMoved.current = false; // Reset movement tracking
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonRect = buttonRef.current.getBoundingClientRect();

    let newX = clientX - dragOffset.current.x;
    let newY = clientY - dragOffset.current.y;

    // Check if movement exceeds a small threshold (to detect dragging)
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
      hasMoved.current = true; // Mark as a drag
    }

    const horizontalOffset = 24; // Offset to counteract left: 24px
    newX = Math.max(-horizontalOffset, Math.min(newX, viewportWidth - buttonRect.width - horizontalOffset));
    newY = Math.max(0, Math.min(newY, viewportHeight - buttonRect.height));

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e);
    const handleTouchMove = (e) => handleDrag(e);

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    const preventTextSelection = (event) => event.preventDefault();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    if (isDragging) {
      document.addEventListener("selectstart", preventTextSelection); // Prevents text selection
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("selectstart", preventTextSelection);
      document.body.style.userSelect = "auto"; // Restore selection
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);

      document.removeEventListener("selectstart", preventTextSelection);
      document.body.style.userSelect = "auto"; // Clean up when unmounting
    };
  }, [isDragging]);

  return (
    <div>
      <DotGraph 
      />
      <div
        ref={dragRef}
        className="draggable-container"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 10,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div
          ref={buttonRef}
          className="toggle-button"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            left: '24px',
            position: 'relative',
          }}
          onClick={toggleBarGraph} // Prevent click if dragging occurred
        ><p>
          {isBarGraphVisible ? '- Close' : '+ Open'}
          </p></div>

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