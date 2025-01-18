import React, { useEffect, useState } from 'react';
import '../../styles/gamification.css';

const GamificationPersonalized = ({ userData, percentage }) => {
  const [selectedTitle, setSelectedTitle] = useState('');

  // Ensure the useEffect hook is always called
  useEffect(() => {
    if (percentage !== undefined && userData) {
      const getRandomTitle = (percentage) => {
        const titles = {
          "0-20": [
            "Carbon Culprit",
            "Planet Polluter",
            "Eco Enemy",
            "Environmental Hazard",
            "Earth’s Burden",
            "Sustainability Sinner",
            "Nature’s Nemesis",
          ],
          "21-40": [
            "Eco Explorer",
            "Carbon Challenger",
            "Sustainability Seeker",
            "Environment Advocate",
            "Green Learner",
          ],
          "41-60": [
            "Eco Ally",
            "Carbon Reducer",
            "Planet Ally",
            "Conscious Contributor",
            "Nature Friend",
          ],
          "61-80": [
            "Eco Advocate",
            "Sustainability Supporter",
            "Planet Partner",
            "Green Guardian",
            "Climate Champion",
          ],
          "81-100": [
            "Nature Savior",
            "Carbon Neutralizer",
            "Eco Warrior",
            "Planet Protector",
            "Sustainability Champion",
          ],
        };

        if (percentage <= 20) {
          return titles["0-20"][Math.floor(Math.random() * titles["0-20"].length)];
        } else if (percentage <= 40) {
          return titles["21-40"][Math.floor(Math.random() * titles["21-40"].length)];
        } else if (percentage <= 60) {
          return titles["41-60"][Math.floor(Math.random() * titles["41-60"].length)];
        } else if (percentage <= 80) {
          return titles["61-80"][Math.floor(Math.random() * titles["61-80"].length)];
        } else {
          return titles["81-100"][Math.floor(Math.random() * titles["81-100"].length)];
        }
      };

      const title = getRandomTitle(percentage);
      setSelectedTitle(title);
    }
  }, [percentage, userData]); // Include userData in dependencies

  if (!userData) {
    console.log('No user data available');
    return null;
  }

  const { weights } = userData;

  const averageWeight =
    Object.values(weights).reduce((sum, w) => sum + w, 0) / Object.keys(weights).length;

  return (
    <div className="personalized-result">
      {/* First section: Text */}
      <div className="gamification-text">
        <h4 className="gam-title">Based on your habits, you're:</h4>
        <h1 className="personal-title">{selectedTitle}</h1>
        <p>
          You did better than <strong>{percentage}%</strong> of people!
        </p>
      </div>

      {/* Second section: SVG */}
      <div className="gamification-knob">
        <div className="percentage-knob">
          <div
            className="knob-arrow"
            style={{ bottom: `${percentage}%` }} // Move the arrow based on percentage
          />
        </div>
      </div>

      {/* Third section: Bar */}
      <div className="gamification-bar">
        <div className="percentage-bar" />
      </div>
    </div>
  );
};

export default GamificationPersonalized;
