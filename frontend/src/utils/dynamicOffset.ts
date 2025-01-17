import { useEffect, useState } from 'react';

export const useDynamicOffset = (): number => {
  const [dynamicOffset, setDynamicOffset] = useState<number>(10); // Default offset value

  // Define minimum and maximum viewport dimensions
  const landscapeMinViewport = { width: 100, height: 66 }; // Minimum supported viewport
  const landscapeMaxViewport = { width: 5000, height: 3067 }; // Maximum supported viewport

  const portraitMinViewport = { width: 66, height: 100 }; // Minimum supported viewport
  const portraitMaxViewport = { width: 3067, height: 5000 }; // Maximum supported viewport

  // Set the range for dynamic offset (landscape mode)
  const landscapeMinOffset = 50; // Minimum offset value for landscape
  const landscapeMaxOffset = 250; // Maximum offset value for landscape

  // Set the range for dynamic offset (portrait mode)
  const portraitMinOffset = 160; // Minimum offset value for portrait
  const portraitMaxOffset = 360; // Maximum offset value for portrait

  // Bezier curve for fine-grained control
  const cubicBezier = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
    const u = 1 - t;
    return (
      u ** 3 * p0 +
      3 * u ** 2 * t * p1 +
      3 * u * t ** 2 * p2 +
      t ** 3 * p3
    );
  };

  useEffect(() => {
    const handleResize = () => {
      // Get current viewport dimensions
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // Normalize width and height to the range [0, 1] Landscape
      const landscapeNormalizedWidth = Math.min(
        Math.max((currentWidth - landscapeMinViewport.width) / (landscapeMaxViewport.width - landscapeMinViewport.width), 0),
        1
      );

      const landscapeNormalizedHeight = Math.min(
        Math.max((currentHeight - landscapeMinViewport.height) / (landscapeMaxViewport.height - landscapeMinViewport.height), 0),
        1
      );

      // Normalize width and height to the range [0, 1] Portrait
      const portraitNormalizedWidth = Math.min(
        Math.max((currentWidth - portraitMinViewport.width) / (portraitMaxViewport.width - portraitMinViewport.width), 0),
        1
      );

      const portraitNormalizedHeight = Math.min(
        Math.max((currentHeight - portraitMinViewport.height) / (portraitMaxViewport.height - portraitMinViewport.height), 0),
        1
      );

      // Check orientation
      const isPortrait = currentHeight > currentWidth;

      // Calculate dynamic offset based on orientation
      let offset: number;
      if (isPortrait) {
        // Portrait mode: Use normalized height
        offset = cubicBezier(portraitNormalizedWidth, portraitMinOffset, 80, 180, portraitMaxOffset);
      } else {
        // Landscape mode: Use normalized width
        offset = cubicBezier(landscapeNormalizedWidth, landscapeMinOffset, 80, 150, landscapeMaxOffset);
      }

      setDynamicOffset(offset); // Update the dynamic offset
    };

    // Initial calculation
    handleResize();

    // Add event listener for resizing
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup on unmount
    };
  }, []);

  return dynamicOffset; // Return the computed dynamic offset
};
