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
// Generate base-color theme
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

  if (weights.length === 0) return interpolateColor(0); 

  const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  return interpolateColor(avgWeight);
};

// Create accent colors from the color interpolation
const generateAccentColors = (baseColor) => {
  const [h, s, l] = rgbToHsl(baseColor);
  // Generate accent variations
  const accent1 = extractRGB(hslToRgb((h + 20) % 360, s, Math.min(l + 0.2, 1))); // Lighter
  const accent2 = extractRGB(hslToRgb((h - 20 + 360) % 360, s, Math.max(l - 0.2, 0))); // Darker
  const accent3 = extractRGB(hslToRgb(h, Math.min(s + 0.2, 1), l)); // More saturated

  return [accent1, accent2, accent3]; 
};
// Convert RGB to HSL
const rgbToHsl = (rgb) => {
  if (!rgb || typeof rgb !== "string" || !rgb.includes("rgb")) {
    console.error("Invalid RGB input in rgbToHsl:", rgb);
    return [0, 0, 0]; // Default to black or some fallback color
  }

  const [r, g, b] = rgb.match(/\d+/g).map(Number).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
};
// Convert HSL to RGB
const hslToRgb = (h, s, l) => {
  let r, g, b;
  if (s === 0) r = g = b = l;
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1 / 3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1 / 3);
  }
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
};
// Applying hue shift for effects
const applyHueShift = (baseRGB, shiftAmount) => {
  if (!baseRGB || typeof baseRGB !== "object" || baseRGB.r === undefined) {
    console.warn("Invalid baseRGB input in applyHueShift:", baseRGB);
    return { r: 255, g: 0, b: 0 }; // Debug fallback (red)
  }

  const [h, s, l] = rgbToHsl(`rgb(${baseRGB.r}, ${baseRGB.g}, ${baseRGB.b})`);
  const dynamicHue = (h + Math.sin(performance.now() * 0.004) * shiftAmount) % 360;

  return extractRGB(hslToRgb(dynamicHue, s, l));
};
// Honestly, this is to make p.draw work with opacity value alongside accent colors
const extractRGB = (rgbString) => {
  // If already an object, return it directly
  if (typeof rgbString === "object" && rgbString !== null) {
    return rgbString; 
  }

  // Ensure it's a string before applying match()
  if (typeof rgbString !== "string") {
    console.error("Invalid input to extractRGB:", rgbString);
    return { r: 0, g: 0, b: 0 }; // Fallback to black
  }

  const [r, g, b] = rgbString.match(/\d+/g).map(Number);
  return { r, g, b };
};

// Color transitioning system 1
const lerpColor = (color1, color2, t) => {
  const c1 = color1.match(/\d+/g).map(Number); // Extract RGB values
  const c2 = color2.match(/\d+/g).map(Number);

  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);

  return `rgb(${r}, ${g}, ${b})`;
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
// Opacity bump toggle behavior
const applyOpacityToggle = (baseOpacity, speed = 1, minOpacity = 100) => { 
  const timeFactor = performance.now() * speed; 
  const oscillation = (0.5 + 0.5 * Math.sign(Math.sin(timeFactor * 0.015))); // Square-wave flicker
  // Ensure opacity stays above the minimum level
  return Math.max(minOpacity, baseOpacity * oscillation);
};
// Apply scale random behavior effect
const applySquareWaveScale = (baseScale = 1, minScale = 1, maxScale = 1.7, interval = 333) => {
  const timeFactor = Math.floor(performance.now() / interval); 
  // Generate a new random scale only when timeFactor changes (prevents flickering)
  if (applySquareWaveScale.lastTimeFactor !== timeFactor) {
    applySquareWaveScale.lastTimeFactor = timeFactor;
    applySquareWaveScale.lastRandomScale = Math.random() * (maxScale - minScale) + minScale;
  }
  return applySquareWaveScale.lastRandomScale; // Return the stored random value
};
// random offset behavior effect
const applySquareWaveOffset = (maxOffset = 10, interval = 333) => {
  const timeFactor = Math.floor(performance.now() / interval);
  // Generate a new random offset only when timeFactor changes (prevents flickering)
  if (applySquareWaveOffset.lastTimeFactor !== timeFactor) {
    applySquareWaveOffset.lastTimeFactor = timeFactor;
    applySquareWaveOffset.lastOffset = {
      x: (Math.random() * 2 - 1) * maxOffset, // Random value between -maxOffset and +maxOffset
      y: (Math.random() * 2 - 1) * maxOffset
    };
  }
  return applySquareWaveOffset.lastOffset; // Return the stored offset
};

/* const applySquareWaveScale = (baseScale = 1, minScale = 1, maxScale = 1.7, speed = 0.02) => {
  const timeFactor = performance.now() * speed;
  const scaleVariation = (Math.sin(timeFactor) + 1) / 2; // Normalize sine wave between 0 and 1
  return minScale + scaleVariation * (maxScale - minScale); // Map to scale range
};*/


const Canvas = ({ answers }) => {
  const shapesRef = useRef([]); 
  const colorsRef = useRef([]); 
  const canvasRef = useRef(null);
  const transitionDuration = 20; // Transition speed in frames
  const colorTransitionRef = useRef(0); // Transition progress
  const previousColorRef = useRef('rgb(150, 150, 150)'); // Start from neutral color

// Define what to do with the weight we got
useEffect(() => {
  const behaviorScore = computeBehaviorScore(answers);
  const newColor = calculateFinalColor(answers);

  if (Object.keys(answers).length === 0) {
    shapesRef.current = ['neutral-land'];
    colorsRef.current = [newColor];
  } else {
    let shape;
    if (behaviorScore < 0.2) shape = 'lush-environment';
    else if (behaviorScore < 0.4) shape = 'fewer-trees';
    else if (behaviorScore < 0.6) shape = 'chimneys';
    else if (behaviorScore < 0.8) shape = 'acid-rain';
    else shape = 'fireworld';

    previousColorRef.current = colorsRef.current[0] || newColor;
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
    if (colorTransitionRef.current >= 1) {
      previousColorRef.current = colorsRef.current[0];
    }

    const blendedColor = lerpColor(previousColorRef.current, colorsRef.current[0], colorTransitionRef.current);

    // Non-weight based color transitioning
    const getTransitioningColor = (baseColor, staticColor, transitionProgress) => {
      return lerpColor(baseColor, staticColor, transitionProgress);
    };    
  
    // Generate accent colors from blendedColor
    const [accent1, accent2, accent3] = generateAccentColors(blendedColor);

    // Generate oscillating versions of existing colors
    const blendedRGB = extractRGB(blendedColor); // Convert before applying shift
    const accent1RGB = extractRGB(accent1);
    const accent2RGB = extractRGB(accent2);
    const accent3RGB = extractRGB(accent3);
    
    const oscillatingBlended = applyHueShift(blendedRGB, 20);
    const oscillatingAccent1 = applyHueShift(accent1RGB, 15);
    const oscillatingAccent2 = applyHueShift(accent2RGB, 10);
    const oscillatingAccent3 = applyHueShift(accent3RGB, 5);
    
    // example use: p.fill(getTransitioningColor(blendedColor, 'rgb(50, 50, 50)', colorTransitionRef.current)); for non-weight transition
    // example use with opacity toggle and blended: p.fill(oscillatingBlended.r, oscillatingBlended.g, oscillatingBlended.b, opacityValue);
    // Without opacity toggle but blended: p.fill(oscillatingBlended.r, oscillatingBlended.g, oscillatingBlended.b);

    // Scale example: const topFlameScale = applySquareWaveScale(); // Only top flame will scale
    // p.scale(topFlameScale);
    
    
    // Opacity toggle bumpy behavior
    const opacityValue = applyOpacityToggle(255, 1);
    p.noStroke();
  
    shapesRef.current.forEach((shape) => {
      p.push();
      p.translate(centerX, centerY);
  
      // New environment states declared (not drawn yet)
      if (shape === 'neutral-land') {
        // Placeholder: Balanced environment (some trees, some clouds)    
        p.push();

        // Generate the offset values (randomly changes every interval)
        const { x: offsetX, y: offsetY } = applySquareWaveOffset();
      
        // Apply offset and scale
        p.translate(offsetX, offsetY);
        const topFlameScale = applySquareWaveScale(); // Only top flame will scale
        p.scale(topFlameScale);
      
        // Apply fill and draw the triangle
        p.fill(oscillatingBlended.r, oscillatingBlended.g, oscillatingBlended.b, opacityValue);
        p.triangle(-size / 3, size / 3, size / 3, size / 3, 0, -size / 3);
        
        p.pop();

      } else if (shape === 'lush-environment') {
        // Placeholder: More trees, denser clouds
      } else if (shape === 'fewer-trees') {
        // Placeholder: Fewer trees, some squares appearing
      } else if (shape === 'chimneys') {
        // Placeholder: Chimneys emitting particles
      } else if (shape === 'acid-rain') {
        // Placeholder: Dark clouds, acid rain effect
      } else if (shape === 'fireworld') {
        // Placeholder: Balanced environment (some trees, some clouds)
        p.fill(oscillatingBlended.r, oscillatingBlended.g, oscillatingBlended.b, opacityValue);
        p.triangle(
          -size / 2, size / 2,   // Left corner
          size / 2, size / 2,    // Right corner
          0, -size / 2           // Top corner
        );
        // Draw 2-3 slightly overlapping triangles (stacked vertically)
        p.fill(oscillatingBlended.r, oscillatingBlended.g, oscillatingBlended.b);
        p.triangle(
          -size / 2, size / 2 - size * 0.3,
          size / 2, size / 2 - size * 0.3,
          0, -size / 2 - size * 0.3
        );
        p.triangle(
          -size / 2, size / 2 - size * 0.6,
          size / 2, size / 2 - size * 0.6,
          0, -size / 2 - size * 0.6
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
