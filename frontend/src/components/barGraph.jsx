import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { fetchSurveyData } from '../utils/sanityAPI';
import '../styles/graph.css';

// Import Lottie animation files
import tree1 from '../lottie-for-UI/tree1.json'; 
import tree2 from '../lottie-for-UI/tree2.json'; 
import tree3 from '../lottie-for-UI/tree3.json'; 

const BarGraph = ({ isVisible }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationState, setAnimationState] = useState(false); // Track the animation state
  const [animateBars, setAnimateBars] = useState(false); 


  // Refs for Lottie animations
  const greenLottieRef = useRef(null);
  const yellowLottieRef = useRef(null);
  const redLottieRef = useRef(null);

  useEffect(() => {
    // Fetch data from Sanity
    const fetchData = async () => {
      const unsubscribe = fetchSurveyData((updatedData) => {
        setData(updatedData);
        setLoading(false); // Set loading to false when data is fetched
        setTimeout(() => setAnimateBars(true), 10);
      });

      return () => {
        if (unsubscribe) unsubscribe(); // Clean up subscription
      };
    };

    fetchData();
  }, []);

  // Categorize data into groups
  const categories = { green: 0, yellow: 0, red: 0 };
  data.forEach((item) => {
    const averageWeight = Object.values(item.weights).reduce((sum, w) => sum + w, 0) / Object.values(item.weights).length;
    if (averageWeight <= 0.33) {
      categories.green++;
    } else if (averageWeight < 0.6) {
      categories.yellow++;
    } else {
      categories.red++;
    }
  });

  // Determine maxItems for graph scaling
  const maxItems = Math.max(categories.green, categories.yellow, categories.red) + 15;


  // Function to apply animation speed
  const applySpeed = () => {
    if (greenLottieRef.current) greenLottieRef.current.setSpeed(0.2);
    if (yellowLottieRef.current) yellowLottieRef.current.setSpeed(0.2);
    if (redLottieRef.current) redLottieRef.current.setSpeed(0.2);
  };

  // Apply speed on component mount (Fixes F5 refresh issue)
  useEffect(() => {
    const timeout = setTimeout(applySpeed, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Apply speed when `BarGraph` becomes visible
  useEffect(() => {
    if (isVisible) {
      setTimeout(applySpeed, 50);
    }
  }, [isVisible]);

  // Track when the first animation completes to switch segment
  useEffect(() => {
    if (!animationState) {
      setTimeout(() => setAnimationState(true), 200); // After first play, switch to loop segment [5–55]
    }
  }, [animationState]);

  if (loading) return null;

  return (
    <>
      <div className="bar-graph-container">
        {Object.entries(categories).map(([color, count]) => {
          const heightPercentage = (count / maxItems) * 100;
          return (
            <div className="bar-graph-bar" key={color}>
              <span className="bar-graph-label">
                <p>{count} People</p>
              </span>
              <div
                className={`bar-graph-fill ${color}-animation`}
                style={{ height: animateBars ? `${heightPercentage}%` : '0%', backgroundColor: color }}
              ></div>
            </div>
          );
        })}
      </div>

      <div className="bar-graph-icons">
        {/* Lottie animation for green */}
        <div className="bar-icon">
          <Lottie
            animationData={tree1}
            loop
            autoplay
            lottieRef={greenLottieRef}
            initialSegment={animationState ? [5, 55] : [0, 55]}
          />
        </div>
        {/* Lottie animation for yellow */}
        <div className="bar-icon">
          <Lottie
            animationData={tree2}
            loop
            autoplay
            lottieRef={yellowLottieRef}
            initialSegment={animationState ? [5, 55] : [0, 55]}
          />
        </div>
        {/* Lottie animation for red */}
        <div className="bar-icon">
          <Lottie
            animationData={tree3}
            loop
            autoplay
            lottieRef={redLottieRef}
            initialSegment={animationState ? [5, 55] : [0, 55]}
          />
        </div>
      </div>
    </>
  );
};

export default BarGraph;
