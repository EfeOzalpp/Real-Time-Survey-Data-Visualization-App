import React, { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import '../../styles/graph.css';

const DotGraph = ({ data = [] }) => {
  const [points, setPoints] = useState([]);
  const [rotationAngles, setRotationAngles] = useState({ x: 0, y: 0 }); // Camera rotation
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 }); // Parallax effect
  const [radius, setRadius] = useState(22); // Camera distance
  const { camera } = useThree();

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  
  // Color interpolation function
  const interpolateColor = (weight) => {
    let r, g, b;
  
    // Define clamped yellow color
    const darkYellow = { r: 175, g: 200, b: 0 }; // Darker yellow
  
    if (weight <= 0.5) {
      // Green to Dark Yellow (0 to 0.5)
      const normalizedWeight = weight / 0.5; // Normalize weight to [0, 1]
      r = Math.round(darkYellow.r * normalizedWeight); // Red increases to dark yellow
      g = Math.round(255 - (255 - darkYellow.g) * normalizedWeight); // Green decreases slightly
      b = 0; // Blue stays at 0
    } else {
      // Dark Yellow to Red (0.5 to 1)
      const normalizedWeight = (weight - 0.5) / 0.5; // Normalize weight to [0, 1]
      r = Math.round(darkYellow.r + (255 - darkYellow.r) * normalizedWeight); // Red increases to max
      g = Math.round(darkYellow.g * (1 - normalizedWeight)); // Green decreases to 0
      b = 0; // Blue stays at 0
    }
  
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Generate random positions for dots
  const generatePositions = (numPoints, minDistance = 0.6, specialIndex = null, specialMinDistance = 1.5) => {
    const positions = [];
    const maxRetries = 1000; // Limit retries
    const bounds = 20; // Initial bounds
    let expandedBounds = bounds; // Allow dynamic expansion
  
    for (let i = 0; i < numPoints; i++) {
      let position;
      let overlapping;
      let retries = 0;
  
      const currentMinDistance = i === specialIndex ? specialMinDistance : minDistance;
  
      do {
        if (retries > maxRetries) {
          console.warn(`Failed to place point ${i} with minDistance ${currentMinDistance}. Expanding bounds.`);
          retries = 0; // Reset retries
          expandedBounds += 5; // Expand bounds
        }
  
        position = [
          Math.random() * expandedBounds - expandedBounds / 2, // X-coordinate
          Math.random() * expandedBounds - expandedBounds / 2, // Y-coordinate
          Math.random() * expandedBounds - expandedBounds / 2, // Z-coordinate
        ];
  
        overlapping = positions.some((existing) => {
          const distance = Math.sqrt(
            (position[0] - existing[0]) ** 2 +
            (position[1] - existing[1]) ** 2 +
            (position[2] - existing[2]) ** 2
          );
          return distance < currentMinDistance;
        });
  
        retries++;
      } while (overlapping && retries <= maxRetries);
  
      positions.push(position);
    }
  
    return positions;
  };  

  // In DotGraph
  useEffect(() => {
    const calculatePoints = () => {
      const latestEntryId = data[0]?._id; // Assume data is sorted by `submittedAt`
      const latestIndex = data.findIndex((response) => response._id === latestEntryId); // Find the index of the latest entry
    
      // Generate positions with a larger minDistance for the latest point
      const positions = generatePositions(
        data.length,
        2, // Default minDistance
        latestIndex, // Index of the latest point
        6 // Larger minDistance for "Me" point
      );
    
      const newPoints = data.map((response, index) => {
        const weights = Object.values(response.weights);
        const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    
        return {
          position: positions[index],
          originalPosition: positions[index], // For parallax
          color: interpolateColor(averageWeight),
          averageWeight,
          _id: response._id,
        };
      });
    
      setPoints(newPoints);
    };    
    
    calculatePoints();
  }, [data]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = (event.clientX / innerWidth) * 2 - 1; // Range [-1, 1]
      const normalizedY = -(event.clientY / innerHeight) * 2 + 1; 
  
      setRotationAngles({
        x: normalizedY * Math.PI * 0.5,
        y: normalizedX * Math.PI,
      });

      setParallaxOffset({
        x: normalizedX * 9, // Adjust parallax strength
        y: normalizedY * 5, 
      });
    };

    const handleScroll = (event) => {
      setRadius((prevRadius) => clamp(prevRadius - event.deltaY * 0.1, 20, 200));
    };
  
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleScroll); // Add scroll listener
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleScroll); // Cleanup scroll listener
    };
  }, []);
  
  useFrame(() => {
    const { x, y } = rotationAngles;
  
    camera.position.x = radius * Math.sin(y) * Math.cos(x);
    camera.position.y = radius * Math.sin(x);
    camera.position.z = radius * Math.cos(y) * Math.cos(x);
  
    camera.lookAt(0, 0, 0);

    // Apply parallax to points
    setPoints((currentPoints) =>
      currentPoints.map((point) => ({
        ...point,
        position: [
          point.originalPosition[0] + parallaxOffset.x,
          point.originalPosition[1] + parallaxOffset.y,
          point.originalPosition[2],
        ],
      }))
    );
  });

  // Find the top-most point (based on y-coordinate)
  const topMostPoint = points.reduce((max, point) => {
    return point.position[1] > max.position[1] ? point : max;
  }, points[0] || { position: [0, 0, 0] }); // Default in case points are empty

    // Find the latest point based on the latest data entry
  const latestEntryId = data[0]?._id; // Assume data is sorted by `submittedAt` in descending order
  const latestPoint = points.find((point) => point._id === latestEntryId);

  return (
    <group>
      {points.map((point, index) => (
        <mesh key={index} position={point.position}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={point.color} />
        </mesh>
      ))}

      {/* Add "Me" text next to the top-most point */}
      {latestPoint && (
        <Text
          position={[
            latestPoint.position[0] + 1.1, // Offset slightly on the x-axis
            latestPoint.position[1] + 0.1, // Offset slightly above the point
            latestPoint.position[2],
          ]}
          fontSize={0.6}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          You
        </Text>
      )}
    </group>
  );
};

export default DotGraph;
