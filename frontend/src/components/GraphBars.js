// Graph 
import React, { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import '../styles/graph.css';

const GraphBars = ({ data = [] }) => {
  const [points, setPoints] = useState([]);
  const [connections, setConnections] = useState([]);
  const [rotationAngles, setRotationAngles] = useState({ x: 0, y: 0 }); // Rotation angles
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 }); // Parallax offset
  const { camera } = useThree();

  const interpolateColor = (weight) => {
    const rStart = 0; // Bright green
    const gStart = 255;
    const bStart = 0;

    const rEnd = 255; // Bright red
    const gEnd = 102;
    const bEnd = 102;

    const r = Math.round(rStart + (rEnd - rStart) * weight);
    const g = Math.round(gStart + (gEnd - gStart) * weight);
    const b = Math.round(bStart + (bEnd - bStart) * weight);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const generateNonOverlappingPosition = (existingPositions, minDistance = 0.6) => {
    let position;
    let overlapping;

    do {
      position = [
        Math.random() * 20 - 10, // X-coordinate between -10 and 10
        Math.random() * 20 - 10, // Y-coordinate between -10 and 10
        Math.random() * 20 - 10, // Z-coordinate between -10 and 10
      ];

      // Check for overlap with existing positions
      overlapping = existingPositions.some((existing) => {
        const distance = Math.sqrt(
          (position[0] - existing[0]) ** 2 +
          (position[1] - existing[1]) ** 2 +
          (position[2] - existing[2]) ** 2
        );
        return distance < minDistance;
      });
    } while (overlapping);

    return position;
  };

  useEffect(() => {
    const calculatePoints = () => {
      const weightMap = { A: 0, B: 0.5, C: 1 };
      const existingPositions = points.map((p) => p.originalPosition);

      const newPoints = data.slice(points.length).map((response, index) => {
        const weights = [
          weightMap[response.question1],
          weightMap[response.question2],
          weightMap[response.question3],
          weightMap[response.question4],
          weightMap[response.question5],
        ];

        const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;

        // Place the latest point closer to the center
        const position = index === 0 && data.length > points.length
          ? [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1] // Closer to the center
          : generateNonOverlappingPosition(existingPositions, 0.6);

        existingPositions.push(position);

        return {
          originalPosition: position, // Save original position for parallax
          position,
          color: interpolateColor(averageWeight), // Color reflects the weight
          averageWeight, // Store weight for debugging or further use
          isLatest: index === 0 && data.length > points.length, // Mark as latest
        };
      });

      setPoints((prev) => [...prev, ...newPoints]);
    };

    calculatePoints();
  }, [data]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const { innerWidth, innerHeight } = window;

      // Calculate normalized mouse position relative to the center
      const normalizedX = (event.clientX / innerWidth) * 2 - 1; // Range [-1, 1]
      const normalizedY = -(event.clientY / innerHeight) * 2 + 1; // Range [-1, 1]

      // Calculate rotation angles based on mouse position
      setRotationAngles({
        x: normalizedY * Math.PI * 0.5, // Vertical rotation mapped to [-π/4, π/4]
        y: normalizedX * Math.PI, // Horizontal rotation mapped to [-π/2, π/2]
      });

      // Calculate parallax offset
      setParallaxOffset({
        x: normalizedX * 8, // Max parallax offset in x-direction
        y: normalizedY * 8, // Max parallax offset in y-direction
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    const radius = 16; // Distance from the center
    const { x, y } = rotationAngles;

    // Update camera position based on rotation angles
    camera.position.x = radius * Math.sin(y) * Math.cos(x);
    camera.position.y = radius * Math.sin(x);
    camera.position.z = radius * Math.cos(y) * Math.cos(x);

    camera.lookAt(0, 0, 0);

    // Apply parallax to both points and connections
    const updatedPoints = points.map((point) => ({
      ...point,
      position: [
        point.originalPosition[0] + parallaxOffset.x * point.originalPosition[2] * 0.1, // Parallax X
        point.originalPosition[1] + parallaxOffset.y * point.originalPosition[2] * 0.1, // Parallax Y
        point.originalPosition[2],
      ],
    }));

    setPoints(updatedPoints);

    const dynamicConnections = updatedPoints.map((point, i) => {
      const distances = updatedPoints
        .map((otherPoint, j) => {
          if (i === j) return null;
          const distance = Math.sqrt(
            (point.position[0] - otherPoint.position[0]) ** 2 +
            (point.position[1] - otherPoint.position[1]) ** 2 +
            (point.position[2] - otherPoint.position[2]) ** 2
          );
          return { index: j, distance };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      return distances.slice(0, 1).map((nearest) => [
        point.position,
        updatedPoints[nearest.index].position,
      ]);
    });

    setConnections(dynamicConnections.flat());
  });

  return (
    <group>
      {points?.map((point, index) => (
        <React.Fragment key={index}>
          <mesh position={point.position}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={point.color} />
          </mesh>
          {point.isLatest && (
            <Text
              position={[
                point.position[0] + 0.7,
                point.position[1] + 0.05,
                point.position[2],
              ]}
              fontSize={0.4}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              Me
            </Text>
          )}
        </React.Fragment>
      ))}
      {connections?.map(([start, end], index) => (
        <Line
          key={index}
          points={[start, end]}
          color="gray"
          lineWidth={0.2}
        />
      ))}
    </group>
  );
};

export default GraphBars;
