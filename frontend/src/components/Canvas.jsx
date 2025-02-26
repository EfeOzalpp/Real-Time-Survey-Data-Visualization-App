import React, { useEffect, useRef } from 'react';
import q5 from 'q5';

const Canvas = ({ answers }) => {
  const shapeRef = useRef('square'); // Store shape WITHOUT re-rendering
  const canvasRef = useRef(null);

  useEffect(() => {
    // Update shapeRef without triggering re-renders
    if (answers.question1 === 'A' || answers.question2 === 'A' || answers.question3 === 'A') {
      shapeRef.current = 'triangle';
    } else if (answers.question1 === 'B' || answers.question2 === 'B' || answers.question3 === 'B') {
      shapeRef.current = 'square';
    } else {
      shapeRef.current = 'circle';
    }
  }, [answers]); // Only runs when answers change

  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.P2D);
        p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      p.draw = () => {
        // Base background color (to match #8bbad2)
        p.background('#8bbad2');

        // Adjust gradient properties based on viewport width
        let innerRadius, outerRadius;
        
        if (p.width < 768) {
          // Mobile: More concentrated gradient
          innerRadius = p.width * 0.1;
          outerRadius = p.width * 1.6;
        } else if (p.width >= 768 && p.width <= 1024) {
          // Tablet: Balanced gradient
          innerRadius = p.width * 0.1;
          outerRadius = p.width * 1.1;
        } else {
          // Desktop: More spread-out gradient
          innerRadius = p.width * 0.1;
          outerRadius = p.width * 0.6;
        }

        // Create viewport-specific radial gradient background
        let gradient = p.drawingContext.createRadialGradient(
          p.width / 2, p.height / 2, innerRadius,
          p.width / 2, p.height / 2, outerRadius
        );
        gradient.addColorStop(0.1, 'rgba(215,215,215,0.8)');
        gradient.addColorStop(0.3, 'rgba(205,205,205,0.6)');
        gradient.addColorStop(0.5, 'rgba(197,197,197,0.3)');
        gradient.addColorStop(1, 'transparent');

        // Apply gradient fill
        p.drawingContext.fillStyle = gradient;
        p.drawingContext.fillRect(0, 0, p.width, p.height);

        // Draw shape in the center
        p.fill(100, 100, 255);
        p.noStroke();
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        const size = Math.min(p.width, p.height) / 4;

        // Use shapeRef to prevent reinitializing canvas
        const shape = shapeRef.current;

        if (shape === 'square') {
          p.rectMode(p.CENTER);
          p.rect(centerX, centerY - size / 3, size, size); // Move square up
        } else if (shape === 'circle') {
          p.ellipse(centerX, centerY - size / 3, size, size); // Move circle up
        } else if (shape === 'triangle') {
          p.triangle(
            centerX - size / 2, centerY + size / 2 - size / 3,  // Adjust bottom points
            centerX + size / 2, centerY + size / 2 - size / 3,  // Adjust bottom points
            centerX, centerY - size / 2 - size / 3  // Adjust top point
          );
        }
      };
    };

    // Only create q5 instance once (NO FLASHING!)
    const q5Instance = new q5(sketch, canvasRef.current);
    return () => q5Instance.remove();
  }, []); // Runs only ONCE (not on shape changes!)

  return (
    <div className="q5Canvas" ref={canvasRef} style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }} />
  );
};

export default Canvas;
