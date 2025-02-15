import React, { useState, useRef, useEffect } from 'react';
import DotGraph from './dotGraph/graph';
import BarGraph from './barGraph';
import '../styles/global-styles.css';
import '../styles/graph.css';

// Export these variables
export let isDragging = false;
export let setIsDragging = () => {};

const VisualizationPage = () => {
  const [isBarGraphVisible, setIsBarGraphVisible] = useState(true);
  const [dragState, setDragState] = useState(false);
  
// Get initial position based on viewport size
const getPositionByViewport = () => {
  const width = window.innerWidth;

  if (width < 768) {
    return { x: window.innerWidth * 0.3, y: window.innerHeight * 0.1 };
  } else if (width >= 768 && width < 1024) {
    return { x: window.innerWidth * 0.7, y: window.innerHeight * 0.08 };
  } else {
    return { x: window.innerWidth * 0.3, y: window.innerHeight * 0.1 };
  }
};

const [position, setPosition] = useState(getPositionByViewport);
const currentMediaQuery = useRef(getPositionByViewport()); // Stores the last known media query

useEffect(() => {
  // Run on mount to ensure correct initial positioning
  const initialPosition = getPositionByViewport();
  setPosition(initialPosition);
  currentMediaQuery.current = initialPosition; // Sync with media query reference

  const handleResize = () => {
    const newPosition = getPositionByViewport();

    // Update only if the media query threshold is crossed
    if (
      newPosition.x !== currentMediaQuery.current.x ||
      newPosition.y !== currentMediaQuery.current.y
    ) {
      setPosition(newPosition);
      currentMediaQuery.current = newPosition; // Update stored media query state
    }
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []); // Runs once on mount

  // Assign the state and setter to exports
  isDragging = dragState;
  setIsDragging = setDragState;

  const dragRef = useRef(null);
  const buttonRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false); // Tracks whether significant movement occurred
  const dragAnimationRef = useRef(null); // Store animation frame ID

  const toggleBarGraph = (e) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMoved.current = false;
      return;
    }
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

    hasMoved.current = false;
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

    // Detect if drag is happening
    if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) {
      hasMoved.current = true;
    }

    const horizontalOffset = 24;
    newX = Math.max(-horizontalOffset, Math.min(newX, viewportWidth - buttonRect.width - horizontalOffset));
    newY = Math.max(0, Math.min(newY, viewportHeight - buttonRect.height));

    // Cancel previous animation frame to prevent unnecessary renders
    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
    }

    // Smooth movement
    dragAnimationRef.current = requestAnimationFrame(() => {
      setPosition({ x: newX, y: newY });
    });
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
      document.addEventListener("selectstart", preventTextSelection);
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("selectstart", preventTextSelection);
      document.body.style.userSelect = "auto";
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener("selectstart", preventTextSelection);
      document.body.style.userSelect = "auto";
    };
  }, [isDragging]);

  return (
    <div>
      <DotGraph />
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
          onClick={toggleBarGraph}
        >
          <p>{isBarGraphVisible ? '- Close' : '+ Open'}</p>
        </div>

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
