import React, { useEffect, useState, useRef } from 'react';
import '../../styles/gamification.css';

const GamificationGeneral = ({ dotId, percentage, color }) => {
  const textCache = useRef({}); 
  const [currentText, setCurrentText] = useState({ title: '', description: '' });

  // ✅ Load cache from localStorage on mount
  useEffect(() => {
    const storedCache = localStorage.getItem('gamificationDotCache');
    if (storedCache) {
      textCache.current = JSON.parse(storedCache);
    }
  }, []);

  useEffect(() => {
    if (!dotId || percentage === undefined) return;

    // ✅ Check if this specific dot already has a cached title/description
    if (textCache.current[dotId]) {
      setCurrentText(textCache.current[dotId]);
      return;
    }

    const getRandomSecondaryText = (percentage) => {
      const texts = {
        "0-20": ["Low effort—just ahead of", "Villain in disguise - higher than", "Global warming’s best friend. Beating only", "Negative impact—better than only"],
        "21-40": ["Slow start—higher than", "Not bad, not great—better than", "Getting there—beating only", "Mediocre progress—higher than"],
        "41-60": ["Solidly average—better than", "Stuck in the middle—higher than", "Right in the pack—beating", "Decent effort—better than"],
        "61-80": ["Great work—better than", "Solid progress—higher than", "Making a real difference—beating", "On the rise—better than"],
        "81-100": ["Outstanding—better than", "Top of the class—higher than", "Setting the standard—beating", "Eco hero status—better than"],
      };

      if (percentage <= 20) return texts["0-20"][Math.floor(Math.random() * texts["0-20"].length)];
      else if (percentage <= 40) return texts["21-40"][Math.floor(Math.random() * texts["21-40"].length)];
      else if (percentage <= 60) return texts["41-60"][Math.floor(Math.random() * texts["41-60"].length)];
      else if (percentage <= 80) return texts["61-80"][Math.floor(Math.random() * texts["61-80"].length)];
      else return texts["81-100"][Math.floor(Math.random() * texts["81-100"].length)];
    };

    const getRandomPrimaryTitle = (percentage) => {
      const titles = {
        "0-20": ["Climate Clueless", "Eco-Absentee", "Melting-Ice Enthusiast", "Carbon Profiter", "Asphalt Enjoyer", "Unworthy Commuter", "UV Enjoyer"],
        "21-40": ["Footprint Fumbler", "Living Gas Source", "Earth Kind of Sucks", "Yellow Velvet Cake", "Heat Struck", "Eco Dabbler"],
        "41-60": ["Uncertain Datapoint", "Balanced as in Average", "Null Responder", "Realistic Answerer", "Booring", "Must Be Fun", "Warming Up to the Idea"],
        "61-80": ["Planet Ally", "Animal Protector", "Nature Carer", "Ecological Warrior", "Sustainable Folk", "Caring is Fullfilling", "Rather Contributes than Consumes"],
        "81-100": ["Planet Guardian", "Sustainability Superhero", "Earth's Best Friend", "Green MVP", "Utopian Hardworker", "Sweet Greens are Made of This"],
      };

      if (percentage <= 20) return titles["0-20"][Math.floor(Math.random() * titles["0-20"].length)];
      else if (percentage <= 40) return titles["21-40"][Math.floor(Math.random() * titles["21-40"].length)];
      else if (percentage <= 50) return titles["41-60"][Math.floor(Math.random() * titles["41-60"].length)];
      else if (percentage <= 80) return titles["61-80"][Math.floor(Math.random() * titles["61-80"].length)];
      else return titles["81-100"][Math.floor(Math.random() * titles["81-100"].length)];
    };

    const assignedText = {
      title: getRandomPrimaryTitle(percentage),
      description: getRandomSecondaryText(percentage),
    };

    // Save in cache per dotId, not percentage
    textCache.current[dotId] = assignedText;
    localStorage.setItem('gamificationDotCache', JSON.stringify(textCache.current));

    setCurrentText(assignedText);
  }, [dotId, percentage]);

  if (!dotId || percentage === undefined || color === undefined) return null;

  const { title, description } = currentText;

  return (
    <div className="generalized-result">
      <h4 className="gam-general-title">This person is:</h4>
      <div className="gam-general">
        <div className="gam-general-description">
          <div className="gam-description-title">
            <h2>{title}</h2>
          </div>
          <div className="gam-description-text">
            <p>
              {description} <strong>{percentage}%</strong> of other people.
            </p>
          </div>
        </div>

        <div className="gam-visualization">
          <div className="gam-percentage-knob">
            <div
              className="gam-knob-arrow"
              style={{
                bottom: `${percentage}%`, 
                borderBottom: `15px solid ${color}`,
              }}
            ></div>
          </div>
          <div className="gam-percentage-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default GamificationGeneral;
