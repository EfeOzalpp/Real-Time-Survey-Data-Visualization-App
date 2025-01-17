import React, { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import '../../styles/graph.css';

const DotGraph = ({ isDragging = false, data = [] }) => {
  const [points, setPoints] = useState([]);
  const [rotationAngles, setRotationAngles] = useState({ x: 0, y: 0 });
  const [lastCursorPosition, setLastCursorPosition] = useState({ x: 0, y: 0 });
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [radius, setRadius] = useState(22);
  const { camera } = useThree();
  const isDraggingRef = useRef(isDragging);

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Linear interpolation function
  const lerp = (start, end, t) => start + (end - start) * t;

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

  const generatePositions = (numPoints, minDistance = 0.6, specialIndex = null, specialMinDistance = 1.5) => {
    const positions = [];
    const maxRetries = 1000;
    const bounds = 20;
    let expandedBounds = bounds;

    for (let i = 0; i < numPoints; i++) {
      let position;
      let overlapping;
      let retries = 0;

      const currentMinDistance = i === specialIndex ? specialMinDistance : minDistance;

      do {
        if (retries > maxRetries) {
          console.warn(`Failed to place point ${i} with minDistance ${currentMinDistance}. Expanding bounds.`);
          retries = 0;
          expandedBounds += 5;
        }

        position = [
          Math.random() * expandedBounds - expandedBounds / 2,
          Math.random() * expandedBounds - expandedBounds / 2,
          Math.random() * expandedBounds - expandedBounds / 2,
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

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    const calculatePoints = () => {
      const latestEntryId = data[0]?._id;
      const latestIndex = data.findIndex((response) => response._id === latestEntryId);

      const positions = generatePositions(data.length, 2, latestIndex, 6);

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
        x: normalizedY * Math.PI * 0.5,
        y: normalizedX * Math.PI,
      });

      setParallaxOffset({
        x: normalizedX * 4,
        y: normalizedY * 2,
      });

      setLastCursorPosition({ x: normalizedX, y: normalizedY });
    };

    const handleScroll = (event) => {
      setRadius((prevRadius) => clamp(prevRadius - event.deltaY * 0.1, 20, 200));
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
      x: lerp(prev.x, lastCursorPosition.y * Math.PI * 0.5, 0.1), // Adjust the 0.1 for slower/faster transition
      y: lerp(prev.y, lastCursorPosition.x * Math.PI, 0.1), // Adjust the 0.1 for slower/faster transition
    }));

    const { x, y } = rotationAngles;

    camera.position.x = radius * Math.sin(y) * Math.cos(x);
    camera.position.y = radius * Math.sin(x);
    camera.position.z = radius * Math.cos(y) * Math.cos(x);

    camera.lookAt(0, 0, 0);

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

  const latestEntryId = data[0]?._id;
  const latestPoint = points.find((point) => point._id === latestEntryId);

  return (
    <group>
      {points.map((point, index) => (
        <mesh key={index} position={point.position}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={point.color} />
        </mesh>
      ))}

      {latestPoint && (
        <Text
          position={[
            latestPoint.position[0] + 1.1,
            latestPoint.position[1] + 0.1,
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
