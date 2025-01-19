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
  const [radius, setRadius] = useState(100);
  const [hoveredDot, setHoveredDot] = useState(null);
  const [noHoverStartTime, setNoHoverStartTime] = useState(null); // Track when "no-hover" starts
  const hoverCheckInterval = useRef(null); // Store interval or requestAnimationFrame for periodic checks

  const { camera } = useThree();
  const isDraggingRef = useRef(isDragging);

  const spreadFactor = 75; // Default spread factor
  const minRadius = 20; // Calculating zoomed in and out states to adjust gamification offset
  const maxRadius = 300; // Zoomed out

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

  // Weight to color range
  const interpolateColor = (weight) => {
    let r, g, b;
    const darkYellow = { r: 175, g: 200, b: 0 };

    if (weight <= 0.5) {
      const normalizedWeight = weight / 0.5;
      r = Math.round(darkYellow.r * normalizedWeight);
      g = Math.round(255 - (255 - darkYellow.g) * normalizedWeight);
      b = 0;
    } else {
      const normalizedWeight = (weight - 0.5) / 0.5;
      r = Math.round(darkYellow.r + (255 - darkYellow.r) * normalizedWeight);
      g = Math.round(darkYellow.g * (1 - normalizedWeight));
      b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`;
  };

  const generatePositions = (numPoints, minDistance = 20, spreadFactor = 75) => {
    const positions = [];
    const maxRetries = 1000;
  
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

      setRotationAngles({
        x: normalizedY * Math.PI * 0.25,
        y: normalizedX * Math.PI * 0.5,
      });

      setLastCursorPosition({ x: normalizedX, y: normalizedY });
    };

    const handleScroll = (event) => {
      setRadius((prevRadius) => {
        const newRadius = prevRadius - event.deltaY * 0.1;
        return Math.max(minRadius, Math.min(maxRadius, newRadius));
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleScroll);
    };
  }, []);

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
    
    const latestPercentage = latestEntry
      ? calculatePercentage(latestWeight)
      : 0;
    
  
  
const handleHoverStart = (dot) => {
  if (hoverCheckInterval.current) {
    clearInterval(hoverCheckInterval.current);
    hoverCheckInterval.current = null;
  }

  if (hoveredDot?._id !== dot._id) {
    const percentage = calculatePercentage(dot.averageWeight); // Correctly calculate percentage
    setHoveredDot({ ...dot, percentage }); // Pass percentage as part of hoveredDot
    setNoHoverStartTime(null);
  }
};
  
  
  const handleHoverEnd = (dot) => {
    // Start tracking the "no-hover" time
    setNoHoverStartTime(Date.now());
  
    // Periodically check if the pointer has remained off for more than 1 second
    if (!hoverCheckInterval.current) {
      hoverCheckInterval.current = setInterval(() => {
        // Only clear the hover state if no other dot is hovered
        if (
          noHoverStartTime &&
          Date.now() - noHoverStartTime >= 1000 &&
          hoveredDot?._id === dot._id
        ) {
          console.log(`Hover no longer detected for dot with ID: ${dot._id}`);
          setHoveredDot(null); // Remove hover state after sustained "no-hover"
          clearInterval(hoverCheckInterval.current); // Stop further checks
          hoverCheckInterval.current = null;
        }
      }, 100); // Check every 100ms
    }
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
                handleHoverStart(point);
              }
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
  
              // Trigger hover end logic only if it is not the latest point
              if (!isLatestPoint) {
                handleHoverEnd(point);
              }
            }}
          >
            <sphereGeometry args={[1, 32, 32]} />
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
            <GamificationPersonalized userData={latestEntry} percentage={percentage} />
          </div>
        </Html>
      )}
  
      {hoveredDot && (
        <Html position={hoveredDot.position} 
          center
          zIndexRange={[120, 180]} 
          style={{
            pointerEvents: 'none',
          }}
        >
          <div style={{ transform: `translateX(${offsetPx}px)` }}>
            <GamificationGeneral hoveredDot={hoveredDot} />
          </div>
        </Html>
      )}
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
