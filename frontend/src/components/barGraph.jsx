import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { fetchSurveyData } from '../utils/sanityAPI';
import '../styles/graph.css';

// Import Lottie animation
import tree1 from '../lottie-for-UI/tree1.json'; // Ensure the correct path to the JSON file

const BarGraph = ({ isVisible }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationState, setAnimationState] = useState(false); // Track the animation state

  const lottieRef = useRef(null);

  useEffect(() => {
    // Fetch data from Sanity
    const fetchData = async () => {
      const unsubscribe = fetchSurveyData((updatedData) => {
        setData(updatedData);
        setLoading(false); // Set loading to false when data is fetched
      });

      return () => {
        if (unsubscribe) unsubscribe(); // Clean up subscription
      };
    };

    fetchData();
  }, []);

  // Directly set the speed of the Lottie animation
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(0.4); // Directly set Lottie animation speed to 0.4
    }
  }, []); // This effect will run only once when the component mounts

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

  // Find the highest group count and adjust maxItems
  const highestGroupCount = Math.max(categories.green, categories.yellow, categories.red);
  let maxItems = 500;

  // Helper function to round up to the nearest step
  const roundUpToStep = (value, step) => {
    return Math.ceil(value / step) * step;
  };

  // Adjust maxItems based on the highest group count
  if (highestGroupCount % 10 === 0) {
    maxItems = highestGroupCount + 40; // Add 15 if the highest count ends in 0
  } else {
    maxItems = roundUpToStep(highestGroupCount, 35); // Round up to the nearest multiple of 20
  }

  // Lottie Animation Options
  const greenLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: tree1,
    initialSegment: animationState ? [5, 55] : [0, 55], // Start at [0, 55], then switch to [5, 55]
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Track when the first animation completes to switch segment
  useEffect(() => {
    if (!animationState) {
      setTimeout(() => setAnimationState(true), 200); // After the first animation, switch to loop segment [5–55]
    }
  }, [animationState]);

  if (loading) {
    return
  }

  return (
      <><div className="bar-graph-container">
          {Object.entries(categories).map(([color, count]) => {
              const heightPercentage = (count / maxItems) * 100; // Calculate height as percentage
              return (
                  <div className="bar-graph-bar" key={color}>
                      <span className="bar-graph-label">
                          <p>{count} People</p>
                      </span>
                      <div
                          className={`bar-graph-fill ${color}-animation`}
                          style={{
                              height: `${heightPercentage}%`, // Use percentage for height
                              backgroundColor: color,
                          }}
                      ></div>
                  </div>
              );
          })}
      </div><div className="bar-graph-icons">
              {/* Controlled Lottie animation for green */}
              <div className="bar-icon">
                  <Lottie {...greenLottieOptions} lottieRef={lottieRef} />
              </div>
              {/* Placeholder SVGs for yellow and red */}
              <div className="bar-icon">
                  <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="5" width="30" height="30" stroke="yellow" strokeWidth="4" fill="none" />
                  </svg>
              </div>
              <div className="bar-icon">
                  <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="20,5 35,35 5,35" stroke="red" strokeWidth="4" fill="none" />
                  </svg>
              </div>
          </div></>
  );
};

export default BarGraph;
