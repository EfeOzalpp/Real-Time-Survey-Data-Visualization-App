import React, { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import '../styles/graph.css';

const DotGraph = ({ data = [] }) => {
  const [points, setPoints] = useState([]);
  const [rotationAngles, setRotationAngles] = useState({ x: 0, y: 0 }); // Camera rotation
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 }); // Parallax effect
  const { camera, gl } = useThree();

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
        x: normalizedX * 5, // Adjust parallax strength
        y: normalizedY * 5, 
      });
    };
  
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useFrame(() => {
    const radius = 125; // Camera distance
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

  return (
    <group>
      {points.map((point, index) => (
        <mesh key={index} position={point.position}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color={point.color} />
        </mesh>
      ))}
    </group>
  );
};

export default DotGraph;
