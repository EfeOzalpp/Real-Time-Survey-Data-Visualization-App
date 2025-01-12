import React, { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import '../styles/graph.css';

const GraphBars = ({ data = [] }) => {
  const [points, setPoints] = useState([]); // Points for the graph
  const [connections, setConnections] = useState([]); // Connections between points
  const [rotationAngles, setRotationAngles] = useState({ x: 0, y: 0 }); // Camera rotation
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 }); // Parallax effect
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

  const generatePositions = (numPoints, minDistance = 0.6) => {
    const positions = [];
    for (let i = 0; i < numPoints; i++) {
      let position;
      let overlapping;

      do {
        position = [
          Math.random() * 20 - 10, // X-coordinate between -10 and 10
          Math.random() * 20 - 10, // Y-coordinate between -10 and 10
          Math.random() * 20 - 10, // Z-coordinate between -10 and 10
        ];

        overlapping = positions.some((existing) => {
          const distance = Math.sqrt(
            (position[0] - existing[0]) ** 2 +
            (position[1] - existing[1]) ** 2 +
            (position[2] - existing[2]) ** 2
          );
          return distance < minDistance;
        });
      } while (overlapping);

      positions.push(position);
    }
    return positions;
  };

  useEffect(() => {
    // Recalculate points whenever `data` changes
    const calculatePoints = () => {
      const weightMap = { A: 0, B: 0.5, C: 1 };
      const positions = generatePositions(data.length);

      const newPoints = data.map((response, index) => {
        const weights = [
          weightMap[response.question1] || 0,
          weightMap[response.question2] || 0,
          weightMap[response.question3] || 0,
          weightMap[response.question4] || 0,
          weightMap[response.question5] || 0,
        ];

        const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;

        return {
          position: positions[index],
          originalPosition: positions[index], // For parallax
          color: interpolateColor(averageWeight),
          averageWeight,
          isLatest: index === 0, // Mark the first point as the latest
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
      const normalizedY = -(event.clientY / innerHeight) * 2 + 1; // Range [-1, 1]

      setRotationAngles({
        x: normalizedY * Math.PI * 0.5,
        y: normalizedX * Math.PI,
      });

      setParallaxOffset({
        x: normalizedX * 8,
        y: normalizedY * 8,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    const radius = 16;
    const { x, y } = rotationAngles;

    camera.position.x = radius * Math.sin(y) * Math.cos(x);
    camera.position.y = radius * Math.sin(x);
    camera.position.z = radius * Math.cos(y) * Math.cos(x);

    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      {points.map((point, index) => (
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
      {connections.map(([start, end], index) => (
        <Line key={index} points={[start, end]} color="gray" lineWidth={0.2} />
      ))}
    </group>
  );
};

export default GraphBars;
