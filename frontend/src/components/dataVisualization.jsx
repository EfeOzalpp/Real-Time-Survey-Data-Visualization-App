import React, { useState, useRef, useEffect } from 'react';
import Graph from './dotGraph/graph';
import BarGraph from './dragGraphs/barGraph';
import InfoGraph from './dragGraphs/infoGraph';
import '../styles/global-styles.css';
import '../styles/graph.css';
import '../styles/info-graph.css';

// Get initial position based on viewport size
const getPositionByViewport = (id = null, customX = null, customY = null) => {
  const width = window.innerWidth;

  // Ensure fallback positions
  let bar1Position = { x: 0, y: 0 };
  let bar2Position = { x: 0, y: 0 };

  // Define bar1's position
  if (width < 768) {
    bar1Position = { x: window.innerWidth * 0, y: window.innerHeight * 0.35 };
  } else if (width >= 768 && width < 1024) {
    bar1Position = { x: window.innerWidth * 0.2, y: window.innerHeight * 0.51 };
  } else {
    bar1Position = { x: window.innerWidth * 0.81, y: window.innerHeight * 0.14 };
  }

  // Define bar2's position
  if (width < 768) {
    bar2Position = { x: window.innerWidth * 0.05, y: window.innerHeight * 0.15 };
  } else if (width >= 768 && width < 1024) {
    bar2Position = { x: window.innerWidth * 0.05, y: window.innerHeight * 0.05 };
  } else {
    bar2Position = { x: window.innerWidth * 0.025, y: window.innerHeight * 0.175 };
  }

  // If requesting both bars, return an object containing both
  if (id === null) {
    return {
      bar1: { 
        x: customX !== null ? customX : bar1Position.x, 
        y: customY !== null ? customY : bar1Position.y 
      },
      bar2: { 
        x: customX !== null ? customX : bar2Position.x, 
        y: customY !== null ? customY : bar2Position.y 
      }
    };
  }

  // Return the requested bar's position
  return id === "bar1"
    ? { x: customX !== null ? customX : bar1Position.x, y: customY !== null ? customY : bar1Position.y }
    : { x: customX !== null ? customX : bar2Position.x, y: customY !== null ? customY : bar2Position.y };
};


const VisualizationPage = () => {
  const [isBarGraphVisible1, setIsBarGraphVisible1] = useState(true);
  const [isBarGraphVisible2, setIsBarGraphVisible2] = useState(true);

  const [dragStates, setDragStates] = useState({
    bar1: false,
    bar2: false,
  });

  const [positions, setPositions] = useState({
    bar1: { x: 0, y: 0 },
    bar2: { x: 0, y: 0 },
  });
  
  useEffect(() => {
    // Force an update in the next render cycle
    setTimeout(() => {
      setPositions({
        bar1: getPositionByViewport("bar1"),
        bar2: getPositionByViewport("bar2"),
      });
    }, 0); // Small delay ensures React registers the change
  
    const handleResize = () => {
      setPositions({
        bar1: getPositionByViewport("bar1"),
        bar2: getPositionByViewport("bar2"),
      });
    };
  
    window.addEventListener("resize", handleResize);
  
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
const dragRefs = {
  bar1: useRef(null),
  bar2: useRef(null),
};

const dragOffsets = useRef({
  bar1: { x: 0, y: 0 },
  bar2: { x: 0, y: 0 },
});

const buttonRefs = {
  bar1: useRef(null),
  bar2: useRef(null),
};

const hasMoved = useRef(false);
const dragAnimationRef = useRef(null);
const currentMediaQuery = useRef(getPositionByViewport());
const [topGraph, setTopGraph] = useState('bar2')

useEffect(() => {
  const initialPosition = getPositionByViewport();
  setPositions({ bar1: initialPosition, bar2: initialPosition });
  currentMediaQuery.current = initialPosition;

  const handleResize = () => {
    const newPosition = getPositionByViewport();
    if (
      newPosition.x !== currentMediaQuery.current.x ||
      newPosition.y !== currentMediaQuery.current.y
    ) {
      setPositions({ bar1: newPosition, bar2: newPosition });
      currentMediaQuery.current = newPosition;
    }
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

const handleDragStart = (id, e) => {
  const rect = dragRefs[id].current.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  dragOffsets.current[id] = {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };

  setTopGraph(id); // Bring the dragged graph to the top
  console.log(`🔼 Graph brought to top on drag: ${id}`);
  hasMoved.current = false;
  setDragStates((prev) => ({ ...prev, [id]: true }));
};

const handleDrag = (id, e) => {
  if (!dragStates[id]) return;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const buttonRect = buttonRefs[id].current.getBoundingClientRect();

  let newX = clientX - dragOffsets.current[id].x;
  let newY = clientY - dragOffsets.current[id].y;

  if (Math.abs(newX - positions[id].x) > 5 || Math.abs(newY - positions[id].y) > 5) {
    hasMoved.current = true;
  }

  const horizontalOffset = 24;
  newX = Math.max(-horizontalOffset, Math.min(newX, viewportWidth - buttonRect.width - horizontalOffset));
  newY = Math.max(0, Math.min(newY, viewportHeight - buttonRect.height));

  if (dragAnimationRef.current) {
    cancelAnimationFrame(dragAnimationRef.current);
  }

  dragAnimationRef.current = requestAnimationFrame(() => {
    setPositions((prev) => {
      const updatedPositions = { ...prev, [id]: { x: newX, y: newY } };
      console.log(`Updated ${id} position:`, updatedPositions[id]); // Debugging
      return updatedPositions;
    });
  });
};

const handleDragEnd = (id) => {
  setDragStates((prev) => ({ ...prev, [id]: false }));
};

useEffect(() => {
  if (!Object.values(dragStates).some((state) => state)) return;

  const handleMouseMove = (e) => {
    Object.keys(dragStates).forEach((id) => {
      if (dragStates[id]) handleDrag(id, e);
    });
  };

  const handleMouseUp = () => {
    Object.keys(dragStates).forEach((id) => handleDragEnd(id));
  };

  const preventTextSelection = (event) => event.preventDefault();

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('touchmove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('touchend', handleMouseUp);
  document.addEventListener('selectstart', preventTextSelection);
  document.body.style.userSelect = "none";

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchmove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchend', handleMouseUp);
    document.removeEventListener('selectstart', preventTextSelection);
    document.body.style.userSelect = "auto";
  };
}, [dragStates]);

const handleClick = (id) => {
  // If the same item is clicked, don't toggle anything.
  if (topGraph === id) return;

  // Set the clicked item to the top
  setTopGraph(id);
};

return (
  <div>
    <Graph isDragging={Object.values(dragStates).some((state) => state)} />

    {['bar1', 'bar2'].map((id) => (
<div
  key={id}
  ref={dragRefs[id]}
  className={id === 'bar1' ? "draggable-container" : "draggable-container2"}
  style={{
    position: 'absolute',
    left: `${positions[id].x}px`,
    top: `${positions[id].y}px`,
    zIndex: topGraph === id ? 20 : 5,
    cursor: dragStates[id] ? "grabbing" : "grab",
  }}
  onMouseDown={(e) => handleDragStart(id, e)}
  onTouchStart={(e) => handleDragStart(id, e)}
>
  <div
    ref={buttonRefs[id]}
    className="toggle-button"
    style={{
      cursor: dragStates[id] ? "grabbing" : "grab",
      left: '24px',
      position: 'relative',
    }}
    onClick={(e) => {
      if (hasMoved.current) {
        e.preventDefault();
        e.stopPropagation();
        hasMoved.current = false;
        return;
      }
      handleClick(id);
      if (id === 'bar1') setIsBarGraphVisible1((prev) => !prev);
      else setIsBarGraphVisible2((prev) => !prev);
    }}
  >
    <p>{id === 'bar1' ? (isBarGraphVisible1 ? 'close' : 'open') : (isBarGraphVisible2 ? 'close' : 'open')}</p>
  </div>

  {(id === 'bar1' ? isBarGraphVisible1 : isBarGraphVisible2) && (
    <div className={id === 'bar1' ? "draggable-bar-graph" : "draggable-info-graph"}>
      {id === 'bar1' ? <BarGraph isVisible /> : <InfoGraph isVisible />}
    </div>
  )}
</div>
  ))}
  </div>
 );
};

export default VisualizationPage;
