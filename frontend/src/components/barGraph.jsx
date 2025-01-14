import React, { useState, useEffect } from 'react';
import { fetchSurveyData } from '../utils/sanityAPI';
import '../styles/graph.css';

const BarGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Categorize data into groups
  const maxItems = 75; // Max value for scaling bars
  const categories = { green: 0, yellow: 0, red: 0 };
  data.forEach((item) => {
    const averageWeight = Object.values(item.weights).reduce((sum, w) => sum + w, 0) / Object.values(item.weights).length;
    if (averageWeight < 0.35) {
      categories.green++;
    } else if (averageWeight < 0.6) {
      categories.yellow++;
    } else {
      categories.red++;
    }
  });

  if (loading) {
    return <div>Loading bar graph...</div>;
  }

  return (
    <div className="bar-graph-overlay">
      <div className="bar-graph-container">
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
      </div>
      <div className="bar-graph-icons">
        <div className="bar-icon">
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="green" strokeWidth="4" fill="none" />
          </svg>
        </div>
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
      </div>
    </div>
  );
};

export default BarGraph;
