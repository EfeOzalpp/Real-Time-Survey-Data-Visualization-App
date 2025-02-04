import React, { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import GamificationPersonalized from './gamificationPersonalized'; 
import GamificationGeneral from './gamificationGeneral'; 
import '../../styles/graph.css';
import '../../styles/survey.css';
import CompleteButton from '../completeButton.jsx'; 
import { useDynamicOffset } from '../../utils/dynamicOffset.ts';

const DotGraph = ({ isDragging = false, data = [] }) => {
  const [points, setPoints] = useState([]);
  const [rotationAngles, setRotationAngles] = useState({ x: 0, y: 0 });
  const [lastCursorPosition, setLastCursorPosition] = useState({ x: 0, y: 0 });
  const [hoveredDot, setHoveredDot] = useState(null);
  const hoverCheckInterval = useRef(null); // Store interval or requestAnimationFrame for periodic checks
  const [viewportClass, setViewportClass] = useState(''); // Track proximity to edges to add class
  const { camera } = useThree();
  const isDraggingRef = useRef(isDragging);
  const touchStartDistance = useRef(null);

  const spreadFactor = 75; // Default spread factor

  const minRadius = 20; // Calculating zoomed in and out states to adjust gamification offset
  const maxRadius = 300; // Zoomed out

  const [radius, setRadius] = useState(() => {
    const baseRadius = 100; // Default starting radius
    const scalingFactor = 0.5; // Adjust based on desired spread
    const dynamicRadius = baseRadius + data.length * scalingFactor;
    // Clamp within min/max range
    return Math.max(minRadius, Math.min(maxRadius, dynamicRadius));
  });

  // Use the dynamic offset hook
  const dynamicOffset = useDynamicOffset();
  // Nonlinear interpolation function with clamping

  const nonlinearLerp = (start, end, t) => {
  // Apply an easing function (ease-in)
  const easedT = 1 - Math.pow(1 - t, 5); // Adjust this function for different skew effects

  // Perform the interpolation
  const value = start + (end - start) * easedT;

  // Clamp the result to stay within [start, end]
  return Math.min(Math.max(value, Math.min(start, end)), Math.max(start, end));
  };

  // Linear interpolation function
  const lerp = (start, end, t) => start + (end - start) * t;

  // Map radius to a 0..1 range for gamification offset
  const zoomFactor = (radius - minRadius) / (maxRadius - minRadius);

  // Get current viewport dimensions
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;

  // Check the current aspect ratio
  const isPortrait = currentHeight > currentWidth;

  let offsetOne;

  if (isPortrait) {
    offsetOne = 160;
  } else {
    offsetOne = 120;
  }

  // Use the dynamicOffset in the lerp function
  const offsetPx = nonlinearLerp(offsetOne, dynamicOffset, zoomFactor);

  const interpolateColor = (weight) => {
    // Flip weight first to match the original logic
    const flippedWeight = 1 - weight; 
  
    // Define color stops (Red → Orange → Yellow → Lime-Yellow → Green)
    const colorStops = [
      { stop: 0.0, color: { r: 255, g: 0, b: 0 } },       // Red
      { stop: 0.45, color: { r: 241, g: 142, b: 4 } },   // Orange
      { stop: 0.5, color: { r: 241, g: 233, b: 4 } },    // Yellow
      { stop: 0.70, color: { r: 186, g: 241, b: 4 } },   // Lime-Yellow
      { stop: 1.0, color: { r: 0, g: 255, b: 0 } }       // Green
    ];
  
    // Find two closest color stops
    let lower = colorStops[0], upper = colorStops[colorStops.length - 1];
  
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (flippedWeight >= colorStops[i].stop && flippedWeight <= colorStops[i + 1].stop) {
        lower = colorStops[i];
        upper = colorStops[i + 1];
        break;
      }
    }
  
    // Normalize weight between lower and upper stops
    const range = upper.stop - lower.stop;
    const normalizedWeight = range === 0 ? 0 : (flippedWeight - lower.stop) / range;
  
    // Interpolate RGB values linearly
    const r = Math.round(lower.color.r + (upper.color.r - lower.color.r) * normalizedWeight);
    const g = Math.round(lower.color.g + (upper.color.g - lower.color.g) * normalizedWeight);
    const b = Math.round(lower.color.b + (upper.color.b - lower.color.b) * normalizedWeight);
  
    return `rgb(${r}, ${g}, ${b})`;
  };  
  

  const generatePositions = (numPoints, minDistance = 24) => {
    const positions = [];
    const maxRetries = 1000;
  
    // Dynamically adjust spreadFactor based on number of points
    const baseSpread = 76; // Minimum spread
    const scalingFactor = 0.26; // Spread increases by 0.26 per point
    const spreadFactor = baseSpread + numPoints * scalingFactor;
  
    for (let i = 0; i < numPoints; i++) {
      let position;
      let overlapping;
      let retries = 0;
  
      do {
        if (retries > maxRetries) {
          console.warn(`Failed to place point ${i} after ${maxRetries} retries.`);
          break;
        }
  
        position = [
          (Math.random() - 0.5) * spreadFactor,
          (Math.random() - 0.5) * spreadFactor,
          (Math.random() - 0.5) * spreadFactor,
        ];
  
        overlapping = positions.some((existing) => {
          const distance = Math.sqrt(
            (position[0] - existing[0]) ** 2 +
            (position[1] - existing[1]) ** 2 +
            (position[2] - existing[2]) ** 2
          );
          return distance < minDistance;
        });
  
        retries++;
      } while (overlapping);
  
      if (!overlapping) {
        positions.push(position);
      }
    }
  
    // Validation step
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = Math.sqrt(
          (positions[i][0] - positions[j][0]) ** 2 +
          (positions[i][1] - positions[j][1]) ** 2 +
          (positions[i][2] - positions[j][2]) ** 2
        );
        if (distance < minDistance) {
          console.error(`Points ${i} and ${j} are too close! Distance: ${distance}`);
        }
      }
    }
  
    return positions;
  };
  

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    const calculatePoints = () => {
      const positions = generatePositions(data.length, 2, spreadFactor);
  
      // Map data to points
      const newPoints = data.map((response, index) => {
        const weights = Object.values(response.weights);
        const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  
        return {
          position: positions[index],
          originalPosition: positions[index],
          color: interpolateColor(averageWeight),
          averageWeight,
          _id: response._id,
        };
      });
  
      // Ensure latest point is at the center
      const latestEntryId = data[0]?._id;
      if (latestEntryId) {
        const latestPointIndex = newPoints.findIndex((point) => point._id === latestEntryId);
        if (latestPointIndex !== -1) {
          newPoints[latestPointIndex].position = [0, 0, 0]; // Move latest point to the center
          newPoints[latestPointIndex].originalPosition = [0, 0, 0]; // Update its original position as well
        }
      }
  
      setPoints(newPoints);
    };
  
    calculatePoints();
  }, [data]);


  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isDraggingRef.current) return;
  
      const { innerWidth, innerHeight } = window;
      const normalizedX = (event.clientX / innerWidth) * 2 - 1;
      const normalizedY = -(event.clientY / innerHeight) * 2 + 1;
  
      setRotationAngles((prev) => ({
        x: prev.x + (normalizedY - lastCursorPosition.y) * Math.PI * 0.1,
        y: prev.y + (normalizedX - lastCursorPosition.x) * Math.PI * 0.1,
      }));
  
      setLastCursorPosition({ x: normalizedX, y: normalizedY });
    };
  
    const handleScroll = (event) => {
      if (event.ctrlKey) {
        // Likely a pinch gesture
        console.log("Pinch detected!");
        setRadius((prevRadius) => {
          const newRadius = prevRadius - event.deltaY * 0.9; // Adjust for pinch sensitivity
          return Math.max(minRadius, Math.min(maxRadius, newRadius));
        });
      } else {
        // Regular scroll wheel
        console.log("Mouse wheel detected!");
        setRadius((prevRadius) => {
          const newRadius = prevRadius - event.deltaY * 0.15; // Keep this lower for smooth scrolling
          return Math.max(minRadius, Math.min(maxRadius, newRadius));
        });
      }
    };    
  
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        // Single finger touch for rotation
        const touch = event.touches[0];
        setLastCursorPosition({
          x: (touch.clientX / window.innerWidth) * 2 - 1,
          y: -(touch.clientY / window.innerHeight) * 2 + 1,
        });
      } else if (event.touches.length === 2) {
        // Two fingers touch for pinch-to-zoom
        const [touch1, touch2] = event.touches;
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        touchStartDistance.current = distance; // Save initial pinch distance
      }
    };
  
    const handleTouchMove = (event) => {
      if (event.touches.length === 1) {
        // Rotate camera using single finger drag
        const touch = event.touches[0];
        const normalizedX = (touch.clientX / window.innerWidth) * 2 - 1;
        const normalizedY = -(touch.clientY / window.innerHeight) * 2 + 1;
  
        setRotationAngles((prev) => ({
          x: prev.x + (normalizedY - lastCursorPosition.y) * Math.PI * 0.1,
          y: prev.y + (normalizedX - lastCursorPosition.x) * Math.PI * 0.1,
        }));
  
        setLastCursorPosition({ x: normalizedX, y: normalizedY });
      } else if (event.touches.length === 2) {
        // Zoom in/out using pinch gesture
        const [touch1, touch2] = event.touches;
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
  
        const pinchDelta = distance - touchStartDistance.current;
        setRadius((prevRadius) => {
          const newRadius = prevRadius - pinchDelta * 0.9; // Adjust zoom sensitivity
          return Math.max(minRadius, Math.min(maxRadius, newRadius));
        });
  
        touchStartDistance.current = distance; // Update the pinch distance
      }
    };
  
    const handleTouchEnd = () => {
      touchStartDistance.current = null; // Reset pinch distance
    };
  
    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("wheel", handleScroll);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  
    return () => {
      // Cleanup event listeners
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [lastCursorPosition, minRadius, maxRadius]);


  useFrame(() => {
    if (isDraggingRef.current) return;

    // Smoothly transition to the target rotationAngles using lerp
    setRotationAngles((prev) => ({
      x: lerp(prev.x, lastCursorPosition.y * Math.PI * 0.25, 0.05),
      y: lerp(prev.y, lastCursorPosition.x * Math.PI * 0.5, 0.05),
    }));

    const { x, y } = rotationAngles;

    camera.position.x = radius * Math.sin(y) * Math.cos(x);
    camera.position.y = radius * Math.sin(x);
    camera.position.z = radius * Math.cos(y) * Math.cos(x);

    camera.lookAt(0, 0, 0);
  });

  const latestEntryId = data[0]?._id;
  const latestPoint = points.find((point) => point._id === latestEntryId);
  const latestEntry = data.find((entry) => entry._id === latestEntryId);

  let percentage = 0;
  // Did better than % of users calculation
  const latestWeight =
      Object.values(latestEntry.weights).reduce((sum, w) => sum + w, 0) /
      Object.keys(latestEntry.weights).length;
  
    const usersWithHigherWeight = data.filter((entry) => {
      const averageWeight =
        Object.values(entry.weights).reduce((sum, w) => sum + w, 0) /
        Object.keys(entry.weights).length;
      return averageWeight > latestWeight;
    });
  
    percentage = Math.round(
      (usersWithHigherWeight.length / data.length) * 100
    );

    const calculatePercentage = (averageWeight) => {
      const usersWithHigherWeight = points.filter(
        (point) => point.averageWeight > averageWeight
      );
      return Math.round((usersWithHigherWeight.length / points.length) * 100);
    };
    
  
    // Helper to determine proximity to viewport edges
    const calculateViewportProximity = (x, y) => {
      const verticalEdgeThreshold = 150; // Adjust threshold for top and bottom
      const horizontalEdgeThreshold = 300; // Wider threshold for left and right edges
      const isLeftThreshold = window.innerWidth * 0.4; // 40% of viewport width (40vw) for is-right
      const width = window.innerWidth;
      const height = window.innerHeight;
      const midLeftThreshold = window.innerWidth * 0.4; // Start of 40%-60% range
      const midRightThreshold = window.innerWidth * 0.6; // End of 40%-60% range
      
      const isTop = y < verticalEdgeThreshold;
      const isBottom = y > height - verticalEdgeThreshold;
      const isLeft = x < isLeftThreshold;
      const isRight = x > width - horizontalEdgeThreshold;
      const isMidHorizontal = x >= midLeftThreshold && x <= midRightThreshold; // Between 40% and 60% of viewport width

      let newClass = '';
      if (isTop) newClass += ' is-top';
      if (isBottom) newClass += ' is-bottom';
      if (isLeft) newClass += ' is-left';
      if (isRight) newClass += ' is-right';
      if (isMidHorizontal) newClass += ' is-mid';

      return newClass.trim();
    };

    const handleHoverStart = (dot, event) => {
      const { clientX, clientY } = event.nativeEvent;
      const proximityClass = calculateViewportProximity(clientX, clientY);
      setViewportClass(proximityClass);
    
      // Ensure we store full dot details (including dotId)
      setHoveredDot({
        dotId: dot._id, // Store unique dot identifier
        percentage: calculatePercentage(dot.averageWeight),
        color: dot.color,
      });
    };
    
    const handleHoverEnd = () => {
      setHoveredDot(null);
      setViewportClass(''); // Reset the class on hover end
    };
          

  useEffect(() => {
    // Cleanup interval or animation frame on component unmount
    return () => {
      if (hoverCheckInterval.current) {
        clearInterval(hoverCheckInterval.current);
      }
    };
  }, []);
  
  return (
    <group>
      {points.map((point, index) => {
        const isLatestPoint = point._id === latestEntryId;
  
        return (
          <mesh
            key={index}
            position={point.position}
            onPointerOver={(event) => {
              event.stopPropagation();
          
              // Trigger hover start logic only if it is not the latest point
              if (!isLatestPoint) {
                handleHoverStart(point, event);
              }
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
          
              // Trigger hover end logic only if it is not the latest point
              if (!isLatestPoint) {
                handleHoverEnd(point);
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
          
              // Simulate hover start logic on click for touch-based devices
              if (!isLatestPoint) {
                handleHoverStart(point, event);
              }
            }}
          >
            <sphereGeometry args={[1.1, 48, 48]} />
            <meshStandardMaterial color={point.color} />
          </mesh>
        );
      })}
  
      {latestPoint && (
        <Html
          position={latestPoint.position}
          center
          zIndexRange={[110, 130]} // fixed z-index for components
          style={{
            pointerEvents: 'none',
          }}
        >
          <div style={{ transform: `translateX(${offsetPx}px)` }}>
            <GamificationPersonalized userData={latestEntry} percentage={percentage} color={latestPoint.color}/>
          </div>
        </Html>
      )}
  
          {hoveredDot && (() => {
          const hoveredData = points.find(dot => dot._id === hoveredDot.dotId);
          if (!hoveredData) return null;

          return (
            <Html
              position={hoveredData.position}
              center
              zIndexRange={[120, 180]}
              style={{
                pointerEvents: "none",
                transition: "opacity 0.2s ease-in-out",
                '--offset-px': `${offsetPx}px`,
              }}
              className={`fade-in ${viewportClass}`}
            >
              <div>
                <GamificationGeneral 
                  dotId={hoveredDot.dotId} // ✅ Pass dotId for unique caching
                  percentage={hoveredDot.percentage} 
                  color={hoveredDot.color} 
                />
              </div>
            </Html>
          );
        })()}
          {/* Add CompleteButton */}
          <Html zIndexRange={[12, 12]} style={{
           pointerEvents: 'none', 
              }}>
            <div className="z-index-respective" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', height: '100vh', pointerEvents: 'none'}}>
            <CompleteButton/>
            </div>
           </Html>
    </group>
  );
};

export default DotGraph;
