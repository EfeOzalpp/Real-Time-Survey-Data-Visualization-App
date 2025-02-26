import React, { useEffect, useRef } from 'react';
import q5 from 'q5';

// Canvas Background style extracted
const drawBackground = (p) => {
  p.background('#8bbad2');
  let innerRadius, outerRadius;
  
  if (p.width < 768) {
    innerRadius = p.width * 0.1;
    outerRadius = p.width * 1.6;
  } else if (p.width >= 768 && p.width <= 1024) {
    innerRadius = p.width * 0.1;
    outerRadius = p.width * 1.1;
  } else {
    innerRadius = p.width * 0.1;
    outerRadius = p.width * 0.6;
  }

  let gradient = p.drawingContext.createRadialGradient(
    p.width / 2, p.height / 2, innerRadius,
    p.width / 2, p.height / 2, outerRadius
  );
  gradient.addColorStop(0.1, 'rgba(215,215,215,0.8)');
  gradient.addColorStop(0.3, 'rgba(205,205,205,0.6)');
  gradient.addColorStop(0.5, 'rgba(197,197,197,0.3)');
  gradient.addColorStop(1, 'transparent');
  
  p.drawingContext.fillStyle = gradient;
  p.drawingContext.fillRect(0, 0, p.width, p.height);
};
// Non-server-side real time color and behavior calculation based on weight for 2D graphics
const answerRewiring = {
  question1: { A: 0, B: 0.5, C: 1 },
  question2: { C: 0, A: 0.5, B: 1 },
  question3: { C: 0, A: 0.5, B: 1 },
  question4: { A: 0, B: 0.5, C: 1 },
  question5: { A: 0, B: 0.5, C: 1 },
};
const interpolateColor = (weight) => {
  const flippedWeight = 1 - weight; 

  const colorStops = [
    { stop: 0.0, color: { r: 245, g: 4, b: 8 } }, 
    { stop: 0.46, color: { r: 241, g: 142, b: 4 } }, 
    { stop: 0.58, color: { r: 241, g: 233, b: 4 } }, 
    { stop: 0.75, color: { r: 186, g: 241, b: 4 } }, 
    { stop: 1, color: { r: 3, g: 235, b: 8 } } 
  ];

  let lower = colorStops[0], upper = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (flippedWeight >= colorStops[i].stop && flippedWeight <= colorStops[i + 1].stop) {
      lower = colorStops[i];
      upper = colorStops[i + 1];
      break;
    }
  }

  const range = upper.stop - lower.stop;
  const normalizedWeight = range === 0 ? 0 : (flippedWeight - lower.stop) / range;

  const r = Math.round(lower.color.r + (upper.color.r - lower.color.r) * normalizedWeight);
  const g = Math.round(lower.color.g + (upper.color.g - lower.color.g) * normalizedWeight);
  const b = Math.round(lower.color.b + (upper.color.b - lower.color.b) * normalizedWeight);

  return `rgb(${r}, ${g}, ${b})`;
};
// Color pop! 
const calculateFinalColor = (answers) => {
  const weights = [];
  
  Object.keys(answers).forEach((question) => {
    const answer = answers[question];
    if (answer && answerRewiring[question]) {
      weights.push(answerRewiring[question][answer]);
    }
  });

  if (weights.length === 0) return interpolateColor(0.5); 

  const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  return interpolateColor(avgWeight);
};
// Behavior pop instead of color
const computeBehaviorScore = (answers) => {
  let totalWeight = 0;
  let count = 0;

  Object.keys(answers).forEach((question) => {
    const answer = answers[question];
    if (answer && answerRewiring[question]) {
      totalWeight += answerRewiring[question][answer]; // Sum up weights
      count++;
    }
  });

  if (count === 0) return 0.5; // Neutral default if no answers

  return totalWeight / count; // Average weight
};
const lerpColor = (color1, color2, t) => {
  const c1 = color1.match(/\d+/g).map(Number); // Extract RGB values
  const c2 = color2.match(/\d+/g).map(Number);

  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
};

const Canvas = ({ answers }) => {
  const shapesRef = useRef([]); 
  const colorsRef = useRef([]); 
  const canvasRef = useRef(null);
  const transitionDuration = 20; // Transition speed in frames
  const colorTransitionRef = useRef(0); // Transition progress
  const previousColorRef = useRef('rgb(150, 150, 150)'); // Start from neutral color

// Define what to do with the weight we got
  useEffect(() => {
    const behaviorScore = computeBehaviorScore(answers); // Get numerical weight
  
    if (Object.keys(answers).length === 0) {
      shapesRef.current = ['circle'];
      colorsRef.current = ['rgb(0, 255, 255)']; // Start with cyan
    } else {
      // Use weight to determine shape
      let shape;
      
      if (behaviorScore < 0.3) {
        shape = 'triangle'; // Good behavior (Green)
      } else if (behaviorScore < 0.7) {
        shape = 'square'; // Neutral (Yellow)
      } else {
        shape = 'circle'; // Bad behavior (Red)
      }
      const newColor = calculateFinalColor(answers); // Still using color logic separately
      previousColorRef.current = colorsRef.current[0] || 'rgb(0, 255, 255)';
      colorTransitionRef.current = 0;
  
      shapesRef.current = [shape]; 
      colorsRef.current = [newColor]; 
    }
  }, [answers]);
  
useEffect(() => {
const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    drawBackground(p);
  
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const size = Math.min(p.width, p.height) / 6;
  
    if (colorsRef.current.length === 0) return;
  
    if (colorTransitionRef.current < 1) {
      colorTransitionRef.current += 1 / transitionDuration;
    }
  
    const blendedColor = lerpColor(previousColorRef.current, colorsRef.current[0], colorTransitionRef.current);
  
    if (colorTransitionRef.current >= 1) {
      previousColorRef.current = colorsRef.current[0];
    }
  
    p.fill(blendedColor);
    p.noStroke();
  
    const behaviorScore = computeBehaviorScore(answers); // Correctly get weight now
  
    shapesRef.current.forEach((shape) => {
      p.push();
      p.translate(centerX, centerY);
  
      if (behaviorScore < 0.3) {
        p.rotate(p.frameCount * 0.01); // Slow rotation for good behavior
      } else if (behaviorScore > 0.7) {
        p.scale(1 + Math.sin(p.frameCount * 0.05) * 0.1); // Pulsing effect for bad behavior
      }
  
      if (shape === 'square') {
        p.rectMode(p.CENTER);
        p.rect(0, 0, size, size);
      } else if (shape === 'circle') {
        p.ellipse(0, 0, size, size);
      } else if (shape === 'triangle') {
        p.triangle(
          -size / 2, size / 2,
          size / 2, size / 2,
          0, -size / 2
        );
      }
  
      p.pop();
    });
  };
};

  const q5Instance = new q5(sketch, canvasRef.current);
  return () => q5Instance.remove();
}, []); 

  return (
    <div
      className="q5Canvas"
      ref={canvasRef}
      style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
    />
  );
};

export default Canvas;
