import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Lottie from 'lottie-react';
import { fetchSurveyData } from '../utils/sanityAPI';
import '../styles/graph.css';

import tree1 from '../lottie-for-UI/tree1.json'; 
import tree2 from '../lottie-for-UI/tree2.json'; 
import tree3 from '../lottie-for-UI/tree3.json'; 

const BarGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationState, setAnimationState] = useState(false); 
  const [animateBars, setAnimateBars] = useState(false);

  const barRefs = useRef({});
  const greenLottieRef = useRef(null);
  const yellowLottieRef = useRef(null);
  const redLottieRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const unsubscribe = fetchSurveyData((updatedData) => {
        setData(updatedData);
        setLoading(false);
        setTimeout(() => setAnimateBars(true), 10);
      });

      return () => unsubscribe && unsubscribe();
    };

    fetchData();
  }, []);

  const categories = { green: 0, yellow: 0, red: 0 };
  const percentages = { green: [], yellow: [], red: [] };

  data.forEach((item) => {
    const avgWeight = Object.values(item.weights).reduce((sum, w) => sum + w, 0) / Object.values(item.weights).length;
    if (avgWeight <= 0.33) {
      categories.green++;
      percentages.green.push(avgWeight);
    } else if (avgWeight < 0.6) {
      categories.yellow++;
      percentages.yellow.push(avgWeight);
    } else {
      categories.red++;
      percentages.red.push(avgWeight);
    }
  });

  let percentage = 0;
  if (data.length > 0) {
    const latestWeight = Object.values(data[0].weights).reduce((sum, w) => sum + w, 0) / Object.keys(data[0].weights).length;
    const usersWithHigherWeight = data.filter(entry => {
      const avgWeight = Object.values(entry.weights).reduce((sum, w) => sum + w, 0) / Object.keys(entry.weights).length;
      return avgWeight > latestWeight;
    });

    percentage = Math.round((usersWithHigherWeight.length / data.length) * 100);
  }

  const maxItems = Math.max(categories.green, categories.yellow, categories.red) + 15;

  useLayoutEffect(() => {
    Object.entries(barRefs.current).forEach(([color, ref]) => {
      if (!ref) return;
      const heightPercentage = (ref.offsetHeight / ref.parentElement.offsetHeight) * 100;
      ref.style.setProperty('--user-percentage', `${(percentage / 100) * heightPercentage}%`);
    });
  }, [percentage, animateBars]);

  useEffect(() => {
    const applySpeed = () => {
      if (greenLottieRef.current) {
        greenLottieRef.current.setSpeed(0.3);
      }
      if (yellowLottieRef.current) {
        yellowLottieRef.current.setSpeed(0.2);
      }
      if (redLottieRef.current) {
        redLottieRef.current.setSpeed(0.5);
      }
    };
  
    // Set speed when animations load
    const checkRefs = setInterval(() => {
      if (greenLottieRef.current && yellowLottieRef.current && redLottieRef.current) {
        applySpeed();
        clearInterval(checkRefs);
      }
    }, 100); // Check every 100ms until refs exist
  
    return () => clearInterval(checkRefs);
  }, []);
  

  useEffect(() => {
    if (!animationState) setTimeout(() => setAnimationState(true), 200);
  }, [animationState]);

  if (loading) return null;

  return (
    <>
      <div className="bar-graph-container">
        {Object.entries(categories).map(([color, count]) => {
            const heightPercentage = (count / maxItems) * 100; // Bar height relative to max items

            // Determine sectionTop based on color category
            let sectionTop = 100; // Default for green
            if (color === "yellow") sectionTop = 60;
            if (color === "red") sectionTop = 33;

            // Convert percentage relative to the section top
            const relativePercentage = (percentage / sectionTop) * 100;
            let userPercentage = (relativePercentage / 100) * heightPercentage; // Apply shrink ratio

            // Ensure percentage doesn't exceed section height
            userPercentage = Math.min(userPercentage, heightPercentage);

            const showPercentage =
              (percentage <= 33 && color === "red") ||
              (percentage > 33 && percentage <= 60 && color === "yellow") ||
              (percentage > 60 && color === "green");


          return (
            <div className="bar-graph-bar" key={color} ref={(el) => (barRefs.current[color] = el)}>
              <span className="bar-graph-label"><p>{count} People</p></span>
              <div className="bar-graph-divider"> 
              {showPercentage && (
                  <div className="percentage-section" style={{ height: animateBars ? `calc(${userPercentage}% - 4.1em)` : "0%" }}>
                    <div className="percentage-indicator">
                      <p>You</p>
                      <p>{percentage}%</p>
                    </div>
                  </div>
                )}
              <div className={`bar-graph-fill ${color}-animation`} style={{ height: animateBars ? `${heightPercentage}%` : "0%" }}></div>
            </div></div>
          );
        })}
      </div>

      <div className="bar-graph-icons">
        <div className="bar-icon">
        <Lottie
            animationData={tree1}
            loop
            autoplay
            lottieRef={greenLottieRef}
            initialSegment={animationState ? [5, 55] : [0, 55]}
            onDOMLoaded={() => setTimeout(() => greenLottieRef.current?.setSpeed(0.3), 50)} // Ensure speed applies
          />
        </div>
        <div className="bar-icon">
        <Lottie
            animationData={tree2}
            loop
            autoplay
            lottieRef={yellowLottieRef}
            initialSegment={animationState ? [5, 55] : [0, 55]}
            onDOMLoaded={() => setTimeout(() => yellowLottieRef.current?.setSpeed(0.2), 50)} // Ensure speed applies
          />
        </div>
        <div className="bar-icon">
        <Lottie
            animationData={tree3}
            loop
            autoplay
            lottieRef={redLottieRef}
            initialSegment={animationState ? [5, 55] : [0, 55]}
            onDOMLoaded={() => setTimeout(() => redLottieRef.current?.setSpeed(0.5), 50)} // Ensure speed applies
          />
        </div>
      </div>
    </>
  );
};

export default BarGraph;
